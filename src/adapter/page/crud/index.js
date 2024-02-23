const { getDialog } = require("./getDialog");
const { getEntry } = require("./getEntry");
const { getQuery } = require("./getQuery");
const { getTable } = require("./getTable");
const { getFormatRequestList, getInfoByLabel, getPrikeyInfoByList } = require('../../../common');
const { camelCase, pascalCase } = require('../../../utils/commonUtil');
const { PAGE_TYPE_ENUM } = require('../../../enum/pageType');
const { CRUD_LABEL_ENUM } = require('../../../enum/label');
const { getInitParam,outputPageInfo } = require('../../../utils/genUtil');
// 根据label拿到功能信息并将对应的元素信息挂在elementList下
function formatInfoByLabel(functionModel , label) {
  const info = getInfoByLabel(functionModel, label)
  if (info) {
    info.elementList = info.elements[0]?.data || []
  }
  return info
}

// 对工具栏和操作栏的扩展按钮分类
function getToolbarBtnAndObjBtn(functionList) {
  return functionList.reduce((res, item) => {
    const { label } = item
    if (label == CRUD_LABEL_ENUM.EXT_GLOBAL) {
      res['toolbarBtnList'].push(item)
    } else if (label == CRUD_LABEL_ENUM.EXT_OBJ) {
      res['operateBtnList'].push(item)
    }
    return res
  }, {
    toolbarBtnList: [],
    operateBtnList: [],
  })
}

function getQueryList(tableFieldList) {
  return tableFieldList.filter(item => item?.param?.isSearch)
}

function getParam(menuInfo) {
  const { code, pageInfo } = menuInfo
  console.log('menuInfo',menuInfo);
  const { function:functionModel } = pageInfo
  const pageName = pascalCase(code)

  const updateInfo = formatInfoByLabel(functionModel, CRUD_LABEL_ENUM.UPDATE)
  const addInfo = formatInfoByLabel(functionModel, CRUD_LABEL_ENUM.INSERT)
  const tableInfo = formatInfoByLabel(functionModel, CRUD_LABEL_ENUM.QUERY_LIST)
  const deleteInfo = formatInfoByLabel(functionModel, CRUD_LABEL_ENUM.DELETE)
  const deleteBatchInfo = formatInfoByLabel(functionModel, CRUD_LABEL_ENUM.DELETE_BATCH)
  const exportTemplateInfo = formatInfoByLabel(functionModel, CRUD_LABEL_ENUM.EXPORT_TEMPLATE)
  const exportInfo = formatInfoByLabel(functionModel, CRUD_LABEL_ENUM.EXPORT)
  const importInfo = formatInfoByLabel(functionModel, CRUD_LABEL_ENUM.IMPORT)
  // 操作栏按钮和工具栏按钮
  const { toolbarBtnList, operateBtnList } = getToolbarBtnAndObjBtn(functionModel)

  const tableFieldList = tableInfo?.elementList || []
  const queryFieldList = getQueryList(tableFieldList)
  const hasQuery = queryFieldList.length > 0
  const hasDeleteBatch = !!deleteBatchInfo
  const hasDelete = !!deleteInfo
  const hasUpdate = !!updateInfo
  const hasExport = !!exportInfo
  const hasImport = !!importInfo
  const hasExportTemplate = !!exportTemplateInfo
  const hasAdd = !!addInfo
  const hasToolbar = hasAdd || hasDeleteBatch || hasQuery || hasExport || hasImport || hasExportTemplate || toolbarBtnList.length > 0
  // Query需要的数据有=>queryFieldList + queryBtnList
  let queryBtnList = []
  // table需要的数据  tableFieldList + tableBtnList
  let tableBtnList = []
  // updateDiaLog需要的数据
  let updateFieldList = []
  // addDiaLog需要的数据 addFieldList
  let addFieldList = []
  if (updateInfo) {
    tableBtnList.push(updateInfo)
    updateFieldList = updateInfo.elementList || []
  }

  if (deleteInfo) {
    tableBtnList.push(deleteInfo)
  }

  if (operateBtnList.length) {
    tableBtnList.concat(operateBtnList)
  }

  if (addInfo) {
    queryBtnList.push(addInfo)
    addFieldList = addInfo.elementList || []
  }

  if (deleteBatchInfo) {
    queryBtnList.push(deleteBatchInfo)
  }

  if (toolbarBtnList.length) {
    queryBtnList.concat(toolbarBtnList)
  }

  const extendParamFieldList = tableFieldList.filter(item=>item?.param?.paramConfig?.extend)
  const extendParamList =  extendParamFieldList.map(item=>item?.param?.paramConfig?.extend)

  const tablePrikey = getPrikeyInfoByList(tableFieldList)?.code

  const param = {
    pageName,
    hasToolbar,
    hasUpdate,
    hasAdd,
    hasQuery,
    hasDelete,
    hasDeleteBatch,
    hasExport,
    hasImport,
    hasExportTemplate,
    tableFieldList,
    queryFieldList,
    addInfo,
    tableInfo,
    deleteInfo,
    updateInfo,
    exportInfo,
    importInfo,
    exportTemplateInfo,
    toolbarBtnList,
    operateBtnList,
    tableFieldList,
    queryBtnList,
    tableBtnList,
    deleteBatchInfo,
    updateFieldList,
    addFieldList,
    extendParamFieldList,
    extendParamList,

    // 默认主键
    tablePrikey
  }
  return param
}

function translateChinese(flag){
  return flag?'有':'没有'
}

function testPage(param){
  console.log(`${translateChinese(param.hasToolbar)}工具栏`);
  console.log(`${translateChinese(param.hasUpdate)}更新功能`);
  console.log(`${translateChinese(param.hasAdd)}新增功能`);
  console.log(`${translateChinese(param.hasQuery)}筛选功能`);
  console.log(`${translateChinese(param.hasDelete)}删除功能`);
  console.log(`${translateChinese(param.hasDeleteBatch)}批量删除功能`);
  console.log(`${(param.tablePrikey)}---主键`);
  // pageName,
}


async function getCrudAdapterData(menuInfo) {
  const { fileParam } = getInitParam(menuInfo,PAGE_TYPE_ENUM.CRUD)
  const param = getParam(menuInfo)
  // 输出提示语
  outputPageInfo(menuInfo)
  testPage(param)

  const { hasToolbar, hasAdd, hasUpdate } = param


  const pages = [
    await getTable(fileParam, param),
    await getEntry(fileParam, param)
  ]

  // 是否有工具栏
  if (hasToolbar) {
    pages.push(await getQuery(fileParam, param))
  }
  if (hasAdd) {
    pages.push(await getDialog({ ...fileParam, name: 'addDialog' }, param))
  }
  if (hasUpdate) {
    pages.push(await getDialog({ ...fileParam, name: 'updateDialog' }, param))
  }
  return {
    services: getFormatRequestList(menuInfo.pageInfo),
    pages: pages.filter(item => !!item)
  }
}

module.exports = {
  getCrudAdapterData
}