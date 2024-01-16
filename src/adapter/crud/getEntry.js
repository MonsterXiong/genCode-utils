const { getFileInfo, initScript, handleImportList, addEmitMethodNoParam, getEjsFileTemplateData, parseUrl, getInterfaceData } = require("../../common")
const { VUE_DATA_SCRIPT_ENUM,  COMPONENT_CRUD_ENUM } = require("../../enum")
const { TEMPLATE_PATH } = require("../../config/templateMap")
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
  const { 
    hasQuery, 
    pageName,
    hasUpdate,
    hasAdd,
    hasDeleteBatch,
    hasDelete,
    tableInfo,
    deleteInfo,
    deleteBatchInfo,
    updateInfo,
    addInfo
  } = templateParam

  addComponent(script, `${pageName}Table`)

  if (hasQuery) {
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'queryForm', type: 'object', initValue: '{}', })
    addComponent(script, `${pageName}Query`)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'entryOnReset' })
  }
  if (hasUpdate) {
    addComponent(script, `${pageName}UpdateDialog`)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'openDialog', name: updateInfo.code, dialogRef: 'updateDialogRef', param: 'row' })
  }
  if (hasAdd) {
    addComponent(script, `${pageName}AddDialog`)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'openDialog', name: addInfo.code, dialogRef: 'addDialogRef', param: '' })
  }
  if (hasDeleteBatch) {
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'multipleSelection', type: 'array', initValue: '[]', })
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'selectionChange' })
    // 还有批量删除的方法,会掉接口
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam(deleteBatchInfo.code))
  }
  if (hasDelete) {
    // 添加一个删除方法，会掉接口
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam(deleteInfo.code))
  }


  const { ServiceName, InterfaceName }=getInterfaceData(tableInfo)
  // 初始化查询方法
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'queryTableData', ServiceName, InterfaceName })
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: ServiceName, from: '@/services' })

  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
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
  handleScript(script,sourceData)

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