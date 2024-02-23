const fse = require('fs-extra')
const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const { pascalCase, camelCase } = require('./utils/commonUtil')
const {  CRUD_LABEL_ENUM } = require('./enum/label')
const {  VUE_DATA_SCRIPT_ENUM } = require('./enum/vueDataScript')
const {DISPLAY_TYPE_ENUM} = require('./enum/displayType')
const { COMPONENT_ENUM } = require('./enum/componentType')
const { ENTRY_SUFFIX_ENUM } = require('./enum/entrySuffix')
const { addCommonTools, addCommonQueryConditionBuilder, addImportService } = require('./adapter/commonMethod')
const { parseUrl, parseUrlGetParam, getInterfaceData, getTab, getPrikeyInfoByList } = require('./adapter/commonMethod/util')

function getPath(filepath){
  return path.join(process.cwd(),filepath)
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

function handleUploadFile(script, field) {
  const { code } = field
  addImportService(script, 'SystemService')
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'dialogUploadFileMethod', code })
}

function handleMethodListHasOption(script) {
  const initOptionList = script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].filter(item => item.type == 'option')
  if (initOptionList.length) {
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'initOption', children: initOptionList.map(option => option.functionName) })
    script[VUE_DATA_SCRIPT_ENUM.MOUNT_LIST].push({ isAwait: true, type: 'callMethod', content: 'initOption' })
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
  if ([DISPLAY_TYPE_ENUM.SELECT, DISPLAY_TYPE_ENUM.ENUM].includes(displayType)) {
    if (selectUrl) {
      handleSelectEntityType(script, field)
    }
  } else if (displayType === DISPLAY_TYPE_ENUM.IMAGE) {
    handleUploadFile(script, field)
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
function getUpdateQueryUrl(requestUrl) {
  const { interfaceName } = parseUrl(requestUrl)
  const queryInterfaceName = camelCase(`query_${interfaceName}`)
  const prefix = requestUrl.substring(0, requestUrl.lastIndexOf('/'))
  const url = `${prefix}/${queryInterfaceName}`
  return { interfaceName: queryInterfaceName, url }
}

function getFormatRequestList(pageInfo) {
  const { function: functionList } = pageInfo
  const serviceList = functionList.reduce((res, element) => {
    const { queryUrl, url:operateUrl, label, code, elements } = element
    const elementList = elements[0]?.data || []
    const prikeyInfo = getPrikeyInfoByList(elementList)
    elementList?.forEach(item => {
      const selectUrl = item.selectUrl
      if (selectUrl) {
        const { url } = parseUrlGetParam(selectUrl)
        if (url) {
          res.push(getServiceParam(element, url))
        } else {
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
    if (label == CRUD_LABEL_ENUM.UPDATE && operateUrl) {
      const { interfaceName, url } = getUpdateQueryUrl(operateUrl)
      const param = {
        ...getServiceParam(element, url, prikeyInfo),
        label: CRUD_LABEL_ENUM.QUERY,
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
    if (serviceType) {
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
  getPath,
  getFileInfo,
  addEmitMethodNoParam,
  addEmitMethodRow,
  handleSelectEntityType,
  handleMethodListHasOption,
  initScript,
  getFormatRequestList,
  getEjsTemplate,
  getEjsFileTemplateData,
  handleFormFieldList,
  getInfoByAttr,
  getInfoByLabel,
  addExtFuncStruct,
  getPrikeyInfoByList,
  getUpdateQueryUrl,
}