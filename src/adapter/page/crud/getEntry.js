const { handleImportList, addDeleteOrDeleteBatch, addCreateOrUpdateDialog } = require("../../commonMethod/genScriptUtils")
const { getFileInfo, initScript, getEjsFileTemplateData, addExtFuncStruct } = require("../../../common")
const { VUE_DATA_SCRIPT_ENUM } = require("../../../enum/vueDataScript")
const {  CRUD_LABEL_ENUM } = require("../../../enum/label")
const {  COMPONENT_CRUD_ENUM} = require("../../../enum/componentType")
const { TEMPLATE_PATH } = require("../../../config/templateMap")
const { addCommonQueryConditionBuilder, initMultipleSelection, addImportService, addComponent } = require("../../commonMethod")
const { getInterfaceData } = require("../../commonMethod/util")
function initDataList(script) {
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST]=[{ name: 'tableData', type: 'array', initValue: '[]', }]
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'total', type: 'number', initValue: 0, })
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({
    name: 'pageInfo', type: 'object', initValue: [{
      name: 'rows',
      type: 'number',
      initValue: 20,
    }, {
      name: 'page',
      type: 'number',
      initValue: 1,
    }]
  })
}

function initMountList(script) {
  script[VUE_DATA_SCRIPT_ENUM.MOUNT_LIST] = [{ isAwait: true, type: 'callMethod', content: 'queryTableData' }]
}
function initMethodList(script) {
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST] = [{ type: 'refreshPagination' }]
}

function initStruct(script) {
  initDataList(script)
  initMountList(script)
  initMethodList(script)
}

function handleExtendParamList(script,fieldList){
  fieldList.forEach(field => {
      script[VUE_DATA_SCRIPT_ENUM.MOUNT_LIST].unshift({  type: 'extendParam', content: `this.${field} = this.$route.query.${field}` })
      script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({name:field,type: 'string', initValue:"" })
  });
}

function handleScript(script, templateParam) {
  const {
    hasToolbar,
    hasQuery,
    pageName,
    hasUpdate,
    hasAdd,
    hasDeleteBatch,
    hasDelete,
    hasImport,
    tableInfo,
    deleteInfo,
    deleteBatchInfo,
    updateInfo,
    addInfo,
    toolbarBtnList,
    operateBtnList,
    tableFieldList,
    extendParamList,
    extendParamFieldList
  } = templateParam


  addComponent(script, `${pageName}Table`)

  if (hasQuery) {
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'queryForm', type: 'object', initValue: '{}', })
  }
  if (hasQuery || hasImport) {
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'entryOnReset' })
  }
  if (hasToolbar) {
    addComponent(script, `${pageName}Query`)
    addExtFuncStruct(script, toolbarBtnList)
  }

  operateBtnList.length && addExtFuncStruct(script, operateBtnList, 'row')

  if (hasUpdate) {
    addCreateOrUpdateDialog(script,pageName,updateInfo,CRUD_LABEL_ENUM.UPDATE)
  }
  if (hasAdd) {
    addCreateOrUpdateDialog(script,pageName,addInfo,CRUD_LABEL_ENUM.INSERT)
  }
  if (hasDeleteBatch) {
    initMultipleSelection(script)
    addDeleteOrDeleteBatch(script, deleteBatchInfo,CRUD_LABEL_ENUM.DELETE_BATCH)
  }
  if (hasDelete) {
    addDeleteOrDeleteBatch(script, deleteInfo)
  }

  // 初始化查询方法
  const { ServiceName, InterfaceName } = getInterfaceData(tableInfo)
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'queryTableData', ServiceName, InterfaceName, hasQuery,extendParamFieldList })
  addImportService(script,ServiceName)
  addCommonQueryConditionBuilder(script)
  // 初始化watch
  script[VUE_DATA_SCRIPT_ENUM.WATCH_LIST].push({ type: 'entryPageInfo' })
  // 处理字段
  handleExtendParamList(script,extendParamList)

  handleImportList(script)

}

async function getEntry(fileParam, sourceData) {
  const { template } = fileParam
  const type = COMPONENT_CRUD_ENUM.ENTRY
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const script = initScript(fileInfo.filename)
  initStruct(script)
  //  --------------------
  const templatePath = TEMPLATE_PATH[template][type]
  //  temp
  handleScript(script, sourceData)

  const templateData = await getEjsFileTemplateData(templatePath, sourceData)

  return {
    ...fileInfo,
    params: {
      template: templateData,
      script
    }
  }
}

module.exports = {
  getEntry
}