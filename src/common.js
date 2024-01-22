const fse = require('fs-extra')
const fs = require('fs')
const ejs = require('ejs')
const { uniqueArray } = require('./utils/array')
const { DISPLAY_TYPE_ENUM, VUE_DATA_SCRIPT_ENUM, LABEL_ENUM } = require('./enum')
const { pascalCase, camelCase } = require('./utils/commonUtil')
const { COMPONENT_ENUM } = require('./enum/componentType')
const { ENTRY_SUFFIX_ENUM } = require('./enum/entrySuffix')
const qs = require('qs')
const { addCommonTools, addCommonQueryConditionBuilder, addImportService } = require('./adapter/commonMethod')

function getTab(number = 1) {
  return new Array(number).fill('').reduce((res) => res += `\t`, '')
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
    addCommonTools(script)
  }
  extList.forEach(item => {
    const { ServiceName, InterfaceName } = getInterfaceData(item)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'extMehodStruct', name: item.code, ServiceName, InterfaceName, param })
  })
}

function addEmitMethodNoParam(emitName) {
  return { type: 'emit', name: emitName, content: '', param: '' }
}
function addEmitMethodRow(emitName) {
  return { type: 'emit', name: emitName, content: '', param: 'row' }
}
function handleSelectEntityType(script, field) {
  const { selectUrl, bindAttr, code } = field
  const { serviceType, interfaceName } = parseUrl(selectUrl)
  const serviceName = `${pascalCase(serviceType)}Service`
  const variableName = `${camelCase(code)}Option`
  const functionName = `get${pascalCase(variableName)}`
  addImportService(script, serviceName)
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'option', serviceName, interfaceName, variableName, functionName })
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: variableName, type: 'array', initValue: '[]' })
  addCommonQueryConditionBuilder(script)
}
function parseUrl(url) {
  const {url:request} = parseUrlGetParam(url)
  const [, interfaceType, serviceType, _, interfaceName] = request.split('/')
  return {
    interfaceType,
    serviceType,
    interfaceName
  }
}
function handleMethodListHasOption(script) {
  const initOptionList = script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].filter(item => item.type == 'option')
  if (initOptionList.length) {
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'initOption', children: initOptionList.map(option => option.functionName) })
    script[VUE_DATA_SCRIPT_ENUM.MOUNT_LIST].push({ isAwait: true, type: 'callMethod', content: 'initOption' })
  }
}
function getInterfaceData(requestInfo, attr = 'operateUrl') {
  if (!requestInfo) {
    throw new Error('没有对应的请求信息')
  }
  const { serviceType, interfaceName } = parseUrl(requestInfo[attr])
  return {
    ServiceName: `${pascalCase(serviceType)}Service`,
    InterfaceName: `${camelCase(interfaceName)}`
  }
}
function handleImportList(script) {
  const importList = uniqueArray(script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST],'content')
  const serviceList = importList.filter(item => item.from == '@/services')
  const otherList = importList.filter(item => item.from != '@/services')
  const importService = serviceList.map(item => item.content).join(', ')
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST] = otherList
  if (serviceList.length) {
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST] =[]
    addImportService(script,importService)
  }
}

function getInfoByAttr(arr, type, attr) {
  return arr.find(item => item[attr] == type)
}

function getInfoByLabel(arr, type) {
  return getInfoByAttr(arr, type, 'label')
}

function handleFormFieldList(script, field) {
  const { param, selectUrl } = field
  const { displayType } = param
  if ([DISPLAY_TYPE_ENUM.SINGLE_SELECT, DISPLAY_TYPE_ENUM.MULTIPLE_SELECT].includes(displayType)) {
      if (selectUrl) {
        handleSelectEntityType(script, field)
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

function initScript(name = "") {
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

function getPrikeyInfoByList(arr, attr = 'isMajorKey') {
  return arr.find(item => item?.param && item['param'][attr]) || {}
}


function getServiceParam(element, url, prikeyInfo) {
  const { interfaceType, serviceType, interfaceName } = parseUrl(url)
  const param = {
    ...element,
    interfaceType,
    serviceType,
    serviceName: pascalCase(serviceType),
    interfaceName,
    request: url,
  }
  if (prikeyInfo && prikeyInfo.code) {
    param.prikeyInfo = { ...prikeyInfo, code: camelCase(prikeyInfo.code) }
  }
  return param
}
function getUpdateQueryUrl(requestUrl){
  const { interfaceName } = parseUrl(requestUrl)
  const queryInterfaceName = camelCase(`query_${interfaceName}`)
  const prefix = requestUrl.substring(0, requestUrl.lastIndexOf('/'))
  const url = `${prefix}/${queryInterfaceName}`
  return {interfaceName:queryInterfaceName,url}
}
function parseUrlGetParam(url){
  const queryParam = url.split('?')
  if(queryParam.length <=1){
      return {
        url
      }
  }else{
    return {
      url:queryParam[0],
      param:qs.parse(queryParam[1])
    }
  }
}
function getFormatRequestList(pageInfo) {
  const { function: functionList } = pageInfo
  const serviceList = functionList.reduce((res, element) => {
    const { queryUrl, operateUrl, label, code, elements } = element
    const elementList = elements[0]?.data || []
    const prikeyInfo = getPrikeyInfoByList(elementList)
    elementList?.forEach(item => {
      const selectUrl = item.selectUrl
      if (selectUrl) {
        const {url} = parseUrlGetParam(selectUrl)
        if(url){
          res.push(getServiceParam(element, url))
        }else{
          res.push(getServiceParam(element, selectUrl))
        }
      }
    })
    if (queryUrl) {
      res.push(getServiceParam(element, queryUrl, prikeyInfo))
    }
    if (operateUrl) {
      res.push(getServiceParam(element, operateUrl, prikeyInfo))
    }
    if (label == LABEL_ENUM.UPDATE && operateUrl) {
      const { interfaceName,url } =getUpdateQueryUrl(operateUrl)
      const param = {
        ...getServiceParam(element, url, prikeyInfo),
        label: LABEL_ENUM.QUERY,
        name: '查询',
        code: interfaceName,
        interfaceName: interfaceName,
        request: url,
      }
      res.push(element, param, prikeyInfo)
    }
    return res
  }, []).reduce((result, service) => {
      const { serviceType } = service
      if(serviceType){
        if (!result[serviceType]) {
          result[serviceType] = [service]
        } else {
          result[serviceType].push(service)
        }
      }
    return result 
  }, {})
  return serviceList
}

async function getEjsFileTemplateData(templatePath, templateParam) {
  return await ejs.renderFile(templatePath, templateParam)
}



module.exports = {
  genCode,
  getTab,
  getFileInfo,
  addEmitMethodNoParam,
  addEmitMethodRow,
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
  getInterfaceData,
  addExtFuncStruct,
  getPrikeyInfoByList,
  getUpdateQueryUrl,
  parseUrlGetParam
}