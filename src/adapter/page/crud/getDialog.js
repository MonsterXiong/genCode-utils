const { getFileInfo, initScript, handleMethodListHasOption, handleFormFieldList, getEjsFileTemplateData, getUpdateQueryUrl } = require("../../../common")
const { VUE_DATA_SCRIPT_ENUM } = require("../../../enum/vueDataScript")
const { COMPONENT_CRUD_ENUM } = require("../../../enum/componentType")
const { camelCase, pascalCase } = require("../../../utils/commonUtil")
const { TEMPLATE_PATH } = require("../../../config/templateMap")
const { addImportService, addCommonTools } = require("../../commonMethod")
const { handleImportList } = require("../../commonMethod/genScriptUtils")
const { parseUrl, getInterfaceData, getPrikeyInfoByList } = require("../../commonMethod/util")
function initDataList(script) {
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST] = [{
    name: 'dialogWidth',
    type: 'string',
    initValue: '500px',
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
        initValue: '',
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
    const { name, code, param: fieldParam } = field
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

function handleExtendParamList(script, fieldList) {
  script[VUE_DATA_SCRIPT_ENUM.PROP_LIST] = []
  fieldList.forEach(field => {
    script[VUE_DATA_SCRIPT_ENUM.PROP_LIST].push({ name: field, type: 'object', initValue: '{}' })
  })
}

function addScript(script) {
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({ type: 'createDialogShow' })
}
async function getDialog(fileParam, sourceData) {
  const { template, name } = fileParam
  const type = COMPONENT_CRUD_ENUM.DIALOG
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { addInfo, updateInfo, extendParamList, extendParamFieldList } = sourceData

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

  if (extendParamList?.length) {
    // 处理外部参数
    handleExtendParamList(script, extendParamList)
  }

  const { ServiceName, InterfaceName } = getInterfaceData(funcInfo)
  const methodParam = { type: 'dialogSubmit', ServiceName, InterfaceName }
  if (isUpdate) {
    updateScript(script, sourceFieldList, updateInfo)
  }
  else {
    addScript(script)
    if (extendParamFieldList.length) {
      methodParam.extendParamFieldList = extendParamFieldList
    }
  }
  // 添加onSubmitForm方法
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(methodParam)
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'title', type: 'string', initValue: funcInfo.name })

  addImportService(script, ServiceName)

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