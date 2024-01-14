const changeCase = require('change-case')
const path = require('path')
const fse = require('fs-extra')
const { genScript: transform } = require('./genScript')


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
  const { request,bindAttr } = field
  const { url } = request
  const { serviceType,interfaceName } = parseUrl(url)
  const serviceName = `${changeCase.pascalCase(serviceType)}Service`
  const variableName = `${changeCase.camelCase(bindAttr)}Option`
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
  const serviceList=script['importList'].filter(item=>item.from == '@/services')
  const otherList=script['importList'].filter(item=>item.from != '@/services')
  const importService = serviceList.map(item=>item.content).join(', ')
  script['importList'] = otherList
  if(serviceList.length){
    script['importList'].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
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

// 得到的是一个页面内容并转换为适应genCode的格式
function transformOutInfo(transformData) {
  const { dirpath, filepath, params } = transformData
  const filePath = path.join(dirpath, filepath)
  const content = transform(params)
  return {
    filePath,
    content
  }
}

module.exports = {
  transformOutInfo,
  genCode,
  getFileInfo,
  addEmitMethodNoParam,
  addServiceToImportList,
  handleSelectEntityType,
  handleMethodListHasOption,
  handleImportList
}