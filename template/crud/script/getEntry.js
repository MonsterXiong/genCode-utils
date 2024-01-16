const { getFileInfo, initScript, handleImportList, addEmitMethodNoParam, getEjsFileTemplateData } = require("../../../src/common")
const path = require('path')
const { VUE_DATA_SCRIPT_ENUM } = require("../../../src/enum")
function initDataList(script) {
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST] = [{
    name: 'tableData',
    type: 'array',
    initValue: '[]',
  }, {
    name: 'total',
    type: 'number',
    initValue: 0,
  }, {
    name: 'pageInfo',
    type: 'object',
    initValue: [{
      name: 'rows',
      type: 'number',
      initValue: 20,
    }, {
      name: 'page',
      type: 'number',
      initValue: 1,
    }],
  }]
}
function initComponentList(script) {
  script[VUE_DATA_SCRIPT_ENUM.COMPONENT_LIST] = []
}

function initMountList(script) {
  script[VUE_DATA_SCRIPT_ENUM.MOUNT_LIST] = [{ isAwait: true, type: 'callMethod', content: 'queryTableData' }]
}

function initMethodList(script) {
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST] = [{ type: 'refreshPagination' }]
}

function initStruct(script) {
  initDataList(script)
  initComponentList(script)
  initMountList(script)
  initMethodList(script)
}

function addComponent(script, componenName) {
  script[VUE_DATA_SCRIPT_ENUM.COMPONENT_LIST].push(componenName)
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: true, content: componenName, from: `./components/${componenName}.vue` })
}

function handleScript(script, templateParam, sourceData) {
  const { isQuery, queryComponentName,
    tableComponentName,
    isEditDialog,
    editDialogComponentName,
    createDialogComponentName,
    isCreateDialog,
    isDeleteBatch,
    isDelete
  } = templateParam

  addComponent(script, tableComponentName)

  if (isQuery) {
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'queryForm', type: 'object', initValue: '{}', })
    addComponent(script, queryComponentName)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'entryOnReset' })
  }
  if (isEditDialog) {
    addComponent(script, editDialogComponentName)
    // 需要调整
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'openDialog', name: 'onEdit', dialogRef: 'editDialogRef', param: 'row' })
  }
  if (isCreateDialog) {
    addComponent(script, createDialogComponentName)
    // 需要调整
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'openDialog', name: 'onAdd', dialogRef: 'createDialogRef', param: '' })
  }
  if (isDeleteBatch) {
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'multipleSelection', type: 'array', initValue: '[]', })
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'selectionChange' })
    // 还有批量删除的方法,会掉接口
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam('onDeleteBatch'))
  }
  if (isDelete) {
    // 添加一个删除方法，会掉接口
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam('onDelete'))
  }
  // 初始化查询方法
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'queryTableData', ServiceName: 'DesignAbiService', InterfaceName: 'queryList' })
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: 'DesignAbiService', from: '@/services' })

  // QueryConditionBuilder
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
  // 初始化watch
  script[VUE_DATA_SCRIPT_ENUM.WATCH_LIST].push({ type: 'entryPageInfo' })
  handleImportList(script)

}

async function getEntry(fileParam, sourceData) {
  const { template } = fileParam
  const type = 'index'
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { functionList, elementList } = sourceData
  const script = initScript(fileInfo.filename)
  initStruct(script)
  //  --------------------
  const templatePath = path.join(__dirname, '../view/entry.ejs')

  //  const templateParam = handleTemplate(fieldList,funcList,true)
  const templateParam = {
    isDeleteBatch: true,
    isDelete: true,

    isQuery: true,
    queryBtnList: ['onAdd', 'onBatchDelete'],
    queryComponentName: 'DesignIndexQuery',

    isEditDialog: true,
    editDialogComponentName: "DesignIndexEditDialog",

    isCreateDialog: true,
    createDialogComponentName: "DesignIndexCreateDialog",

    tableComponentName: "DesignIndexTable",
    tableBtnList: ['onEdit', 'onDelete']
  }
  //  temp
  handleScript(script, templateParam, sourceData)

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
  getEntry
}