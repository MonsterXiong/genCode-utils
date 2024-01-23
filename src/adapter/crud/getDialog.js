const { getFileInfo, initScript, handleMethodListHasOption, handleFormFieldList, getEjsFileTemplateData, getUpdateQueryUrl } = require("../../common")
const { VUE_DATA_SCRIPT_ENUM, COMPONENT_CRUD_ENUM } = require("../../enum")
const { camelCase, pascalCase } = require("../../utils/commonUtil")
const { TEMPLATE_PATH } = require("../../config/templateMap")
const { addImportService, addCommonTools } = require("../commonMethod")
const { handleImportList } = require("../commonMethod/genScriptUtils")
const { parseUrl, getInterfaceData, getPrikeyInfoByList } = require("../commonMethod/util")
function initDataList(script) {
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST] = [{
    name: 'dialogWidth',
    type: 'string',
    // initValue: 'CommonDialogWidth.smallForm',
    initValue: '"500px"',
  }, {
    name: 'dialogVisible',
    type: 'boolean',
    initValue: 'false',
  }, {
    name: 'formDataRules',
    type: 'object',
    initValue: '{}',
  }]
}
function initImportDataList(script) {
  addCommonTools(script)
  // script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({isDefault: false,from: '@/common/constants',content: 'CommonDialogWidth'})
}
function initMethodList(script) {
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST] = [{
    type: 'onDialogClose',
    name: 'onDialogClose',
    content: "",
    param: ""
  }, {
    type: 'onReset',
    name: 'onReset',
    content: "",
    param: ""
  },]
}

function initStruct(script) {
  initDataList(script)
  initImportDataList(script)
  initMethodList(script)

}
function handleFieldList(script, fieldList) {
  let initValue = "{}"
  if (fieldList.length) {
    initValue = []
    fieldList.forEach(field => {
      initValue.push({
        name: field.code,
        type: 'string',
        initValue: '""',
      })
      handleFormFieldList(script, field)
    })
  }
  const form = {
    name: 'formData',
    type: 'object',
    initValue
  }
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push(form)

}

function handleTemplate(fieldList) {
  return fieldList.map(field => {
    const { name, code, param: fieldParam, bindAttr } = field
    const { displayType } = fieldParam
    const param = {
      label: name,
      displayType,
      prop: code
    }
    return param
  })
}

function updateScript(script, fieldList, updateInfo) {
  const prikeyInfo = getPrikeyInfoByList(fieldList)
  const pri = prikeyInfo?.code || ''
  const operateUrl = updateInfo?.operateUrl
  if (operateUrl) {
    const { url } = getUpdateQueryUrl(operateUrl)
    const { serviceType, interfaceName } = parseUrl(url)
    const ServiceName = `${pascalCase(serviceType)}Service`
    const InterfaceName = `${camelCase(interfaceName)}`
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'editGetData', pri, ServiceName, InterfaceName })
    addImportService(script, ServiceName)
  } else {
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'emptyEditGetData' })
  }
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'editDialogShow', pri })
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'row', type: 'null', initValue: 'null', })
}

function addScript(script) {
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'createDialogShow' })
}
async function getDialog(fileParam, sourceData) {
  const { template, name } = fileParam
  const type = COMPONENT_CRUD_ENUM.DIALOG
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { addInfo, updateInfo } = sourceData

  let fieldList = []
  let sourceFieldList = []
  const isUpdate = name == 'updateDialog'
  let funcInfo = isUpdate ? updateInfo : addInfo
  sourceFieldList = funcInfo?.elementList || []
  fieldList = sourceFieldList.filter(item => !item.param?.isHidden)

  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script)
  // 处理要素
  handleFieldList(script, fieldList)

  if (isUpdate) {
    updateScript(script, sourceFieldList, updateInfo)
  }
  else {
    addScript(script)
  }
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'title', type: 'string', initValue: `'${funcInfo.name}'` })
  const { ServiceName, InterfaceName } = getInterfaceData(funcInfo)
  addImportService(script, ServiceName)
  // 添加onSubmitForm方法
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({
    type: 'dialogSubmit',
    ServiceName,
    InterfaceName
  })
  //  整合一下imporList
  handleImportList(script)
  //  处理一下option
  handleMethodListHasOption(script)
  // ---------------------
  const queryList = handleTemplate(fieldList)

  const templatePath = TEMPLATE_PATH[template][type]

  const templateParam = { queryList }

  const templateData = await getEjsFileTemplateData(templatePath, templateParam)

  return {
    ...fileInfo,
    params: {
      template: templateData,
      script
    }
  }
}
module.exports = {
  getDialog
}