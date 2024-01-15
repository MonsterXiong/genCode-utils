const { getFileInfo, initScript, handleImportList, addEmitMethodNoParam } = require("../../../src/common")
const path = require('path')
const ejs = require('ejs')
function initDataList(script){
  script['dataList']=[{
    name: 'tableData',
    type: 'array',
    initValue: '[]',
  },{
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
    },{
      name: 'page',
      type: 'number',
      initValue: 1,
    }],
  }]
}
function initComponentList(script){
  script['componentList'] = []
}

function initMountList(script){
  script['mountList']=[{isAwait: true,type: 'callMethod',content: 'queryTableData'}]
}

function initMethodList(script){
  script['methodList']=[{type: 'refreshPagination'}]
}


function initStruct(script){
  initDataList(script)
  initComponentList(script)
  initMountList(script)
  initMethodList(script)
}

function addComponent(script,componenName){
  script['componentList'].push(componenName)
  script['importList'].push({isDefault:true,content:componenName,from:`./components/${componenName}.vue`})
}

function handleScript(script,templateParam,sourceData){
  const {isQuery,queryComponentName,
    tableComponentName,
    isEditDialog,
    editDialogComponentName,
    createDialogComponentName,
    isCreateDialog,
    isDeleteBatch,
    isDelete
  } = templateParam

  addComponent(script,tableComponentName)

  if(isQuery){
    script['dataList'].push({name: 'queryForm',type: 'object',initValue: '{}',})
    addComponent(script,queryComponentName)
    script['methodList'].push({type: 'entryOnReset'})
  }
  if(isEditDialog){
    addComponent(script,editDialogComponentName)
    // 需要调整
    script['methodList'].push({type: 'openDialog',name:'onEdit',dialogRef:'editDialogRef',param:'row'})
  }
  if(isCreateDialog){
    addComponent(script,createDialogComponentName)
    // 需要调整
    script['methodList'].push({type: 'openDialog',name:'onAdd',dialogRef:'createDialogRef',param:''})
  }
  if(isDeleteBatch){
    script['dataList'].push({name: 'multipleSelection',type: 'array',initValue: '[]',})
    script['methodList'].push({type: 'selectionChange'})
    // 还有批量删除的方法,会掉接口
    script['methodList'].push(addEmitMethodNoParam('onDeleteBatch'))
  }
  if(isDelete){
    // 添加一个删除方法，会掉接口
    script['methodList'].push(addEmitMethodNoParam('onDelete'))
  }
  // 初始化查询方法
  script['methodList'].push({type: 'queryTableData',ServiceName:'DesignAbiService',InterfaceName:'queryList'})
  script['importList'].push({isDefault: false,content:'DesignAbiService',from:'@/services'})

  // QueryConditionBuilder
  script['importList'].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
  // 初始化watch
  script['watchList'].push({ type: 'entryPageInfo'})
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
   const templateParam ={
      isDeleteBatch:true,
      isDelete:true,

      isQuery:true,
      queryBtnList:['onAdd','onBatchDelete'],
      queryComponentName:'DesignIndexQuery',

      isEditDialog:true,
      editDialogComponentName:"DesignIndexEditDialog",

      isCreateDialog:true,
      createDialogComponentName:"DesignIndexCreateDialog",

      tableComponentName:"DesignIndexTable",
      tableBtnList:['onEdit','onDelete']
   }
  //  temp
   handleScript(script,templateParam,sourceData)

   const templateData = await ejs.renderFile(templatePath,templateParam)
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