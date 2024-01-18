const fse = require('fs-extra')
const fs = require('fs')
const ejs = require('ejs')
const { uniqueArray } = require('./utils/array')
const { DISPLAY_TYPE_ENUM, VUE_DATA_SCRIPT_ENUM, LABEL_ENUM } = require('./enum')
const { pascalCase, camelCase } = require('./utils/commonUtil')
const { COMPONENT_ENUM } = require('./enum/componentType')
const { ENTRY_SUFFIX_ENUM } = require('./enum/entrySuffix')

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
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: true, from: '@/utils/tools', content: 'tools' })
  }
  extList.forEach(item => {
    const { ServiceName, InterfaceName } = getInterfaceData(item, 'operateUrl')
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'extMehodStruct', name: item.code, ServiceName, InterfaceName, param })
  })
}

function addEmitMethodNoParam(emitName) {
  return { type: 'emit', name: emitName, content: '', param: '' }
}
function addEmitMethodRow(emitName) {
  return { type: 'emit', name: emitName, content: '', param: 'row' }
}
function addServiceToImportList(script, serviceName) {
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/services', content: serviceName })
}
function handleSelectEntityType(script, field) {
  const { selectUrl, bindAttr, code } = field
  const { serviceType, interfaceName } = parseUrl(selectUrl)
  const serviceName = `${pascalCase(serviceType)}Service`
  const variableName = `${camelCase(code)}Option`
  const functionName = `get${pascalCase(variableName)}`
  addServiceToImportList(script, serviceName)
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'option', serviceName, interfaceName, variableName, functionName })
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: variableName, type: 'array', initValue: '[]' })
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
}
function parseUrl(url) {
  const [, interfaceType, serviceType, _, interfaceName] = url.split('/')
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
  const serviceList = uniqueArray(script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST], 'content').filter(item => item.from == '@/services')
  const otherList = script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].filter(item => item.from != '@/services')
  const importService = serviceList.map(item => item.content).join(', ')
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST] = otherList
  if (serviceList.length) {
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/services', content: importService })
  }
}

function getInfoByAttr(arr, type, attr) {
  return arr.find(item => item[attr] == type)
}

function getInfoByLabel(arr, type) {
  return getInfoByAttr(arr, type, 'label')
}
function getInfoByBinFunction(arr, type) {
  return getInfoByAttr(arr, type, 'bindFunction')
}

function handleFormFieldList(script, field) {
  const { param, selectUrl } = field
  const { displayType } = param
  if ([DISPLAY_TYPE_ENUM.SINGLE_SELECT, DISPLAY_TYPE_ENUM.MULTIPLE_SELECT].includes(displayType)) {
      if (selectUrl) {
      // const { type } = request
      // if (type == 'entity') {
        handleSelectEntityType(script, field)
      // }
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
function getFormatRequestList(pageInfo) {
  const { function: functionList } = pageInfo
  const serviceList = functionList.reduce((res, element) => {
    const { queryUrl, operateUrl, label, code, elements } = element
    const elementList = elements[0]?.data || []
    const prikeyInfo = getPrikeyInfoByList(elementList)
    elementList?.forEach(item => {
      const selectUrl = item.selectUrl
      if (selectUrl) {
        res.push(getServiceParam(element, selectUrl))
      }
    })
    if (queryUrl) {
      res.push(getServiceParam(element, queryUrl, prikeyInfo))
    }
    if (operateUrl) {
      res.push(getServiceParam(element, operateUrl, prikeyInfo))
    }
    if (label == LABEL_ENUM.UPDATE && operateUrl) {
      // const { interfaceName } = parseUrl(operateUrl)
      // const queryInterfaceName = camelCase(`query_${interfaceName}`)
      // const prefix = operateUrl.substring(0, operateUrl.lastIndexOf('/'))
      // const url = `${prefix}/${queryInterfaceName}`
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
  getPrikeyInfoByList,
  getUpdateQueryUrl
}