const { nanoid } = require('nanoid')
const { getDialog } = require("./getDialog");
const { getEntry } = require("./getEntry");
const { getQuery } = require("./getQuery");
const { getTable } = require("./getTable");
const { getFormatRequestList, getInfoByLabel, getInfoByBinFunction } = require('../../common');
const { camelCase, pascalCase } = require('../../utils/commonUtil');
const { PAGE_TYPE_ENUM, LABEL_ENUM } = require('../../enum');
function formatInfoByLabel({functionModel,elementConfig},label){
  const info = getInfoByLabel(functionModel,label)
  if(info){
    info.elementList = getInfoByBinFunction(elementConfig,label)?.data || []
  }
  return info
}

function getToolbarBtnAndObjBtn(functionList){
  return functionList.reduce((res,item)=>{
    const {label} = item
    if(label == LABEL_ENUM.EXT_GLOBAL){
      res['toolbarBtnList'].push(item)
    }else if(label == LABEL_ENUM.EXT_OBJ){
      res['operateBtnList'].push(item)
    }
    return res
  },{
    toolbarBtnList:[],
    operateBtnList:[],
  })
}

function getQueryList(tableFieldList){
  return tableFieldList.filter(item=>item.param.isSearch)
}

function getParam(menuInfo){
  const { code, pageInfo } = menuInfo
  const { functionModel, elementConfig } =pageInfo
  const pageName = pascalCase(code)
  
  const updateInfo = formatInfoByLabel(pageInfo,LABEL_ENUM.UPDATE)
  const addInfo = formatInfoByLabel(pageInfo,LABEL_ENUM.INSERT)
  const tableInfo =formatInfoByLabel(pageInfo,LABEL_ENUM.QUERY_LIST)
  const queryInfo = formatInfoByLabel(pageInfo,LABEL_ENUM.QUERY)
  const deleteInfo = formatInfoByLabel(pageInfo,LABEL_ENUM.DELETE)
  const deleteBatchInfo = formatInfoByLabel(pageInfo,LABEL_ENUM.DELETE_BATCH)
  // 操作栏按钮和工具栏按钮
  const { toolbarBtnList,operateBtnList } = getToolbarBtnAndObjBtn(functionModel)

  const tableFieldList = tableInfo?.elementList || []

  const queryFieldList = getQueryList(tableFieldList)
  
  const hasQuery = queryFieldList.length > 0

  const hasDeleteBatch = !! deleteBatchInfo

  const hasDelete = !!deleteInfo

  const hasUpdate = !! updateInfo
  
  const hasAdd = !! addInfo

  const hasToolbar = hasAdd || hasDeleteBatch || hasQuery || toolbarBtnList.length >0



  // Query需要的数据有=>queryFieldList + queryBtnList
  let queryBtnList = []

  // table需要的数据  tableFieldList + tableBtnList
  let tableBtnList = []

  // updateDiaLog需要的数据 还需要一个queryInfo
  let updateFieldList = []

  // addDiaLog需要的数据 addFieldList
  let addFieldList = []

  if(updateInfo){
    tableBtnList.push(updateInfo)
    updateFieldList = updateInfo.elementList || [] 
  }

  if(deleteInfo){
    tableBtnList.push(updateInfo)
  }

  if(operateBtnList.length){
    tableBtnList.concat(operateBtnList)
  }

  if(addInfo){
    queryBtnList.push(addInfo)
    addFieldList = addInfo.elementList || []
  }

  if(deleteBatchInfo){
    queryBtnList.push(deleteBatchInfo)
  }

  if(toolbarBtnList.length){
    queryBtnList.concat(toolbarBtnList)
  }
  const param = {
    pageName,
    tableFieldList,
    queryFieldList,
    hasAdd,
    addInfo,
    tableInfo,
    hasQuery,
    queryInfo,
    hasDeleteBatch,
    hasDelete,
    deleteInfo,
    hasUpdate,
    updateInfo,
    toolbarBtnList,
    operateBtnList,
    tableFieldList,
    hasToolbar,
    queryBtnList,
    tableBtnList,
    deleteBatchInfo
  }
  return param
}


async function getCrudAdapterData(sourceData) {
  const { menuInfo, functionList, elementList } = sourceData
  const { code: menuCode } = menuInfo
  const dirpath = menuCode ? menuCode : nanoid()
  const template = PAGE_TYPE_ENUM.CRUD
  const fileParam = { dirpath: camelCase(dirpath), template }


   const param = getParam(menuInfo)

   const {hasToolbar,hasAdd,hasUpdate} = param


  const pages = [
    await getTable(fileParam, param),
    await getEntry(fileParam, param)
  ]

    // 是否有工具栏
    if(hasToolbar){
      pages.push(await getQuery(fileParam, param))
    }
    if(hasAdd){
      pages.push(await getDialog({ ...fileParam, name: 'addDialog' },param))
    }
    if(hasUpdate){
      pages.push(await getDialog({ ...fileParam, name: 'updateDialog' },param))
    }


  return {
    services:getFormatRequestList(sourceData),
    pages:pages.filter(item=>!!item)
    // pages:[
    //   // await getQuery(fileParam, sourceData),
    //   // await getDialog({ ...fileParam, name: 'updateDialog' },sourceData),
    //   // await getDialog({ ...fileParam, name: 'addDialog' },sourceData),
    //   // await getTable(fileParam, sourceData),
    //   // await getEntry(fileParam, sourceData)
    // ].filter(item=>!!item)
  }
}

module.exports = {
  getCrudAdapterData
}