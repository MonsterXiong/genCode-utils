const changeCase = require('change-case')
const fse = require('fs-extra')
const fs = require('fs')
const ejs = require('ejs')
const { templateDataMap } = require('../template/crud/view/templateData')
const { uniqueArray } = require('./utils/array')

function getTab(number=1){
  return new Array(number).fill('').reduce((res)=>res+=`\t`,'')
}
function getFileInfo({ name, type, dirpath, template }) {
  const componentName = changeCase.pascalCase(`${dirpath}_${name ? name : type}`)
  const filetype = type !== 'index' ? 'component' : 'entry'
  const filename = filetype == 'component' ? componentName : `${changeCase.pascalCase(dirpath)}Manage`
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
function addServiceToImportList(script,serviceName){
  script['importList'].push({ isDefault: false, from: '@/services', content: serviceName })
}
function handleSelectEntityType(script,field){
  const { request,bindAttr,field:bindField } = field
  const { url } = request
  const { serviceType,interfaceName } = parseUrl(url)
  const serviceName = `${changeCase.pascalCase(serviceType)}Service`
  const variableName = `${changeCase.camelCase(bindField)}Option`
  const functionName = `get${changeCase.pascalCase(variableName)}`
  addServiceToImportList(script,serviceName)
  script['methodList'].unshift({ type: 'option', serviceName, interfaceName, variableName, functionName })
  script['dataList'].push({ name: variableName, type: 'array', initValue: '[]' })
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
  const initOptionList = script['methodList'].filter(item => item.type == 'option')
  if (initOptionList.length) {
    script['methodList'].unshift({ type: 'initOption', children: initOptionList.map(option => option.functionName) })
    script['mountList'].push({ isAwait: true, type: 'callMethod', content: 'initOption' })
  }
}
function handleImportList(script){
  const serviceList=uniqueArray(script['importList'],'content').filter(item=>item.from == '@/services')
  const otherList=script['importList'].filter(item=>item.from != '@/services')
  const importService = serviceList.map(item=>item.content).join(', ')
  script['importList'] = otherList
  if(serviceList.length){
    script['importList'].push({ isDefault:false, from:'@/services',content:importService})
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
function getTemplate(template,type){
  return templateDataMap[template][type]
}
function initScript(name=""){
  return {
    name,
    importList: [],
    propList: [],
    dataList: [],
    mountList: [],
    methodList: [],
    componentList: []
  }
}
function getFormatRequestList(sourceData){
  const {functionList,elementList} = sourceData
  const functionMap = functionList.reduce((res,item)=>{
    res[item.label] = item
    return res
  },{})
  const serviceList = elementList.reduce((res,element) => {
    let request = functionMap[element.bindFunction]?.request || []
    const prikeyInfo = element.data.find(item=>item.pk) || {}
    if(request.length){
      request = request.map(item=>{
        return {
          ...item,
          prikeyInfo:{...prikeyInfo,code:changeCase.camelCase(prikeyInfo.code)}
        }
      })
    }
    res = res.concat(request)
    return res
  },[]).reduce((res,item)=>{
    const { interfaceType, serviceType, interfaceName } = parseUrl(item.url)
    const param = {
      ...item,
      interfaceType,
      serviceType,
      serviceName:changeCase.pascalCase(serviceType),
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

module.exports = {
  genCode,
  getTab,
  getFileInfo,
  addEmitMethodNoParam,
  addServiceToImportList,
  handleSelectEntityType,
  handleMethodListHasOption,
  handleImportList,
  initScript,
  getTemplate,
  parseUrl,
  getFormatRequestList,
  getEjsTemplate
}