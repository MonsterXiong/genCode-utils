const fse = require('fs-extra')
const fs = require('fs')
const ejs = require('ejs')
const { uniqueArray } = require('./utils/array')
const { DISPLAY_TYPE_ENUM, VUE_DATA_SCRIPT_ENUM } = require('./enum')
const { pascalCase, camelCase } = require('./utils/commonUtil')

function getTab(number=1){
  return new Array(number).fill('').reduce((res)=>res+=`\t`,'')
}
function getFileInfo({ name, type, dirpath, template }) {
  const componentName = pascalCase(`${dirpath}_${name ? name : type}`)
  const filetype = type !== 'index' ? 'component' : 'entry'
  const filename = filetype == 'component' ? componentName : `${pascalCase(dirpath)}Manage`
  const filepath = (filetype == 'component' ? `components/${filename}` : filename) + '.vue'
  return {
    filename,
    filetype,
    filepath,
    dirpath,
    type,
    template,
  }
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
  const { url } = request
  const { serviceType,interfaceName } = parseUrl(url)
  const serviceName = `${pascalCase(serviceType)}Service`
  const variableName = `${camelCase(code)}Option`
  const functionName = `get${pascalCase(variableName)}`
  addServiceToImportList(script,serviceName)
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'option', serviceName, interfaceName, variableName, functionName })
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: variableName, type: 'array', initValue: '[]' })
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

function getInfoByLabel(request,type){
  return getInfoByAttr(request,type,'label')
}
function getInfoByBinFunction(request,type){
  return getInfoByAttr(request,type,'bindFunction')
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
function getFormatRequestList(sourceData){
  const {functionList,elementList} = sourceData
  const functionMap = functionList.reduce((res,item)=>{
    res[item.label] = item
    return res
  },{})
  // 临时处理不存在要素中的功能
  const functionServiceList = functionList.reduce((res,item)=>{
    let request = item?.request || []
    res = res.concat(request)
    return res
  },[])
  const serviceList = elementList.reduce((res,element) => {
    let request = functionMap[element.bindFunction]?.request || []
    const prikeyInfo = element.data.find(item=>item.param.pk) || {}
    if(request.length){
      request = request.map(item=>{
        return {
          ...item,
          prikeyInfo:{...prikeyInfo,code:camelCase(prikeyInfo.code)}
        }
      })
    }
    res = res.concat(request)
    return res
  },functionServiceList).reduce((res,item)=>{
    const { interfaceType, serviceType, interfaceName } = parseUrl(item.url)
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
}