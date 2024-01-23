const { handleImportList, addDeleteOrDeleteBatch, addCreateOrUpdateDialog } = require("../commonMethod/genScriptUtils")
const { getFileInfo, initScript, getEjsFileTemplateData, addExtFuncStruct } = require("../../common")
const { VUE_DATA_SCRIPT_ENUM, COMPONENT_CRUD_ENUM, LABEL_ENUM } = require("../../enum")
const { TEMPLATE_PATH } = require("../../config/templateMap")
const { addCommonQueryConditionBuilder, initMultipleSelection, addImportService, addComponent } = require("../commonMethod")
const { getInterfaceData } = require("../commonMethod/util")
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
    addCreateOrUpdateDialog(script,pageName,updateInfo,LABEL_ENUM.UPDATE)
  }
  if (hasAdd) {
    addCreateOrUpdateDialog(script,pageName,addInfo,LABEL_ENUM.INSERT)
  }
  if (hasDeleteBatch) {
    initMultipleSelection(script)
    addDeleteOrDeleteBatch(script, deleteBatchInfo,LABEL_ENUM.DELETE_BATCH)
  }
  if (hasDelete) {
    addDeleteOrDeleteBatch(script, deleteInfo)
  }

  const { ServiceName, InterfaceName } = getInterfaceData(tableInfo, 'queryUrl')
  // 初始化查询方法
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'queryTableData', ServiceName, InterfaceName, hasQuery })
  addImportService(script,ServiceName)
  addCommonQueryConditionBuilder(script)
  // 初始化watch
  script[VUE_DATA_SCRIPT_ENUM.WATCH_LIST].push({ type: 'entryPageInfo' })
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