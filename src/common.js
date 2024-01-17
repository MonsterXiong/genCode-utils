const fse = require('fs-extra')
const fs = require('fs')
const ejs = require('ejs')
const { uniqueArray } = require('./utils/array')
const { DISPLAY_TYPE_ENUM, VUE_DATA_SCRIPT_ENUM } = require('./enum')
const { pascalCase, camelCase } = require('./utils/commonUtil')
const { COMPONENT_ENUM } = require('./enum/componentType')
const { ENTRY_SUFFIX_ENUM } = require('./enum/entrySuffix')

function getTab(number=1){
  return new Array(number).fill('').reduce((res)=>res+=`\t`,'')
}
function getFileInfo({ name, type, dirpath, template }) {
  const componentName = pascalCase(`${dirpath}_${name ? name : type}`)
  const filetype = type !== COMPONENT_ENUM.ENTRY ? COMPONENT_ENUM.COMPONENT : COMPONENT_ENUM.ENTRY
  const filename = filetype == COMPONENT_ENUM.COMPONENT ? componentName : `${pascalCase(dirpath)}${ENTRY_SUFFIX_ENUM[template]}`
  const filepath = (filetype == COMPONENT_ENUM.COMPONENT ? `components/${filename}` : filename) + '.vue'
  return {
    filename,
    filetype,
    filepath,
    dirpath,
    type,
    template,
  }
}

function addExtFuncStruct(script, extList, param = '') {
  if (extList.length) {
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({isDefault: true,from: '@/utils/tools',content: 'tools'})
  }
  extList.forEach(item=>{
    const { ServiceName, InterfaceName }=getInterfaceData(item)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({type:'extMehodStruct',name:item.code,ServiceName,InterfaceName,param})
  })
}

function addEmitMethodNoParam(emitName){
  return { type: 'emit', name: emitName, content: '', param: '' }
}
function addEmitMethodRow(emitName){
  return { type: 'emit', name: emitName, content: '', param:'row' }
}
function addServiceToImportList(script,serviceName){
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/services', content: serviceName })
}
function handleSelectEntityType(script,field){
  const { request,bindAttr,code } = field
  const { serviceType,interfaceName } = parseUrl(request.url)
  const serviceName = `${pascalCase(serviceType)}Service`
  const variableName = `${camelCase(code)}Option`
  const functionName = `get${pascalCase(variableName)}`
  addServiceToImportList(script,serviceName)
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'option', serviceName, interfaceName, variableName, functionName })
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: variableName, type: 'array', initValue: '[]' })
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
}
function parseUrl (url){
  const [,interfaceType,serviceType,interfaceName]=url.split('/')
  return {
    interfaceType,
    serviceType,
    interfaceName
  }
}
function handleMethodListHasOption(script){
  const initOptionList = script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].filter(item => item.type == 'option')
  if (initOptionList.length) {
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'initOption', children: initOptionList.map(option => option.functionName) })
    script[VUE_DATA_SCRIPT_ENUM.MOUNT_LIST].push({ isAwait: true, type: 'callMethod', content: 'initOption' })
  }
}
function getInterfaceData(requestInfo){
  if(!requestInfo){
    throw new Error('没有对应的请求信息')
  }
  const { request } = requestInfo
  const { serviceType,interfaceName }= parseUrl(request)
  return {
    ServiceName:`${pascalCase(serviceType)}Service`,
    InterfaceName:`${camelCase(interfaceName)}`
  }
}
function handleImportList(script){
  const serviceList=uniqueArray(script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST],'content').filter(item=>item.from == '@/services')
  const otherList=script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].filter(item=>item.from != '@/services')
  const importService = serviceList.map(item=>item.content).join(', ')
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST] = otherList
  if(serviceList.length){
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault:false, from:'@/services',content:importService})
  }
}

function getInfoByAttr(arr,type,attr){
  return arr.find(item=>item[attr] == type)
}

function getInfoByLabel(arr,type){
  return getInfoByAttr(arr,type,'label')
}
function getInfoByBinFunction(arr,type){
  return getInfoByAttr(arr,type,'bindFunction')
}

function handleFormFieldList(script,field){
  const { param, request } = field
  const {displayType} =param
  if(request){
    if (displayType == DISPLAY_TYPE_ENUM.SELECT) {
      const { type } = request
      if (type == 'entity') {
        handleSelectEntityType(script, field)
      }
    }
  }
}

// 输出到文件系统
async function genCode(result) {
  for (const writeItem of result) {
    const writeFilePath = writeItem.filePath;
    fse.ensureFileSync(writeFilePath);
    fse.writeFile(writeFilePath, writeItem.content);
  }
}
function getEjsTemplate(templatePath) {
  const templateFile = fs.readFileSync(templatePath, "utf8");
  return ejs.compile(templateFile);
}

function initScript(name=""){
  return {
    name,
    importList: [],
    propList: [],
    dataList: [],
    mountList: [],
    methodList: [],
    watchList: [],
    componentList: []
  }
}

function getPrikeyInfoByList(arr,attr='isMajorKey'){
  return arr.find(item=>item?.param && item['param'][attr]) || {}
}
function getFormatRequestList(sourceData){
  const {functionList,elementList} = sourceData
  const functionMap = functionList.reduce((res,item)=>{
    res[item.label] = item
    return res
  }, {})

  const serviceList = elementList.reduce((res,element) => {
    let request = functionMap[element.bindFunction]
    const prikeyInfo = getPrikeyInfoByList(element.data)
    const param = {...request}
    if (prikeyInfo && prikeyInfo.code) {
      param.prikeyInfo={...prikeyInfo,code:camelCase(prikeyInfo.code)}
    }
    res.push(param)
    return res
  },functionList).reduce((res,item)=>{
    const { interfaceType, serviceType, interfaceName } = parseUrl(item.request)
    const param = {
      ...item,
      interfaceType,
      serviceType,
      serviceName:pascalCase(serviceType),
      interfaceName
    }
    if(!res[serviceType]){
      res[serviceType] = [param]
    }else{
      res[serviceType].push(param)
    }
    return res
  },{})
  return serviceList
}

async function getEjsFileTemplateData(templatePath,templateParam){
  return await ejs.renderFile(templatePath,templateParam)
}



module.exports = {
  genCode,
  getTab,
  getFileInfo,
  addEmitMethodNoParam,
  addEmitMethodRow,
  addServiceToImportList,
  handleSelectEntityType,
  handleMethodListHasOption,
  handleImportList,
  initScript,
  parseUrl,
  getFormatRequestList,
  getEjsTemplate,
  getEjsFileTemplateData,
  handleFormFieldList,
  getInfoByAttr,
  getInfoByLabel,
  getInfoByBinFunction,
  getInterfaceData,
  addExtFuncStruct,
  getPrikeyInfoByList
}