const { getFileInfo, initScript, addEmitMethodRow, getInfoByLabel, getInfoByBinFunction } = require("../../../src/common")
const path = require('path')
const ejs = require('ejs')
const { LABEL_ENUM, FUNCTION_TYPE_ENUM } = require("../../../src/enum")
function initPropList(script){
  script['propList']=[{
    name: 'tableData',
    type: 'object',
    initValue: '{}',
  }, {
    name: 'total',
    type: 'object',
    initValue: '{}',
  }, {
    name: 'pageInfo',
    type: 'object',
    initValue: '{}',
  }]
}

function initMethodList(script){
  script['methodList'] = [{
    type: 'setHeight',
    name: 'setHeight',
    content: "",
    param: ""
  }, {
    type: 'pageInfoChange',
    name: 'onSizeChange',
    content: '',
    param: 'rows',
  }, {
    type: 'pageInfoChange',
    name: 'onCurrentChange',
    content: '',
    param: 'page',
  }]
}

function initDataList(script){
  script['dataList']=[{
    name: 'tableHeight',
    type: 'string',
    initValue: `'500px'`,
  }]
}
function initMountList(script){
  script['mountList']= [{
    isAwait: false,
    type: 'callMethod',
    content: 'setHeight'
  }]
}

function initStruct(script){
  initPropList(script)
  initDataList(script)
  initMethodList(script)
  initMountList(script)
}

function handleMethodList(script, funcList) {
  if (funcList.length) {
    funcList.forEach(func => {
      const { label, code } = func
      if (label !== LABEL_ENUM.QUERY_LIST) {
        script['methodList'].push(addEmitMethodRow(code))
      }else{
        script['importList'].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
      }
    });
  }
}
// TODO:
function handleFieldList(){}


function getDeleteOrEditBtnParam(btnInfo,type){
  let isShow = false
  let showInfo = null
  if(btnInfo){
    isShow=true
    const {name:btnName,code} = btnInfo
    showInfo = {
      name:btnName?btnName:type==LABEL_ENUM.UPDATE?'编辑':'删除',
      functionName:code?code:type==LABEL_ENUM.UPDATE?'onEdit':'onDelete'
    }
  }
  return {
    isShow,
    showInfo
  }
}

function handleTemplate(fieldList,funcList,isDeleteBatch=false){
  const editInfo =getInfoByLabel(funcList,LABEL_ENUM.UPDATE)
  const deleteInfo = getInfoByLabel(funcList,LABEL_ENUM.DELETE)
  const {isShow:isEdit,showInfo:editBtnInfo} = getDeleteOrEditBtnParam(editInfo,LABEL_ENUM.UPDATE)
  const {isShow:isDelete,showInfo:deleteBtnInfo} = getDeleteOrEditBtnParam(deleteInfo,LABEL_ENUM.DELETE)

  const btns = funcList.filter(item=>![LABEL_ENUM.DELETE,LABEL_ENUM.UPDATE].includes(item.label)).map(item=>{
    return{
      param:'scope.row',
      name:item?.name || 'name',
      functionName:item?.code || 'code'
    }
  })

  const fields = fieldList.filter(item=>!item.param.isHidden).map(field=>{
    return{
      key:field.field,
      label:field.name
    }
  })
  return {
    isDeleteBatch,
    isEdit,
    isDelete,
    editBtnInfo,
    deleteBtnInfo,
    btns,
    fields,
  }
}
async function getTable(fileParam, sourceData) {
  const type = 'table'
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { functionList, elementList } = sourceData
  const isDeleteBatch =!!getInfoByLabel(functionList,LABEL_ENUM.DELETE_BATCH)
  const funcList = functionList.filter(item => item.functionType == FUNCTION_TYPE_ENUM.OBJ)
  const fieldList = (getInfoByBinFunction(elementList,LABEL_ENUM.QUERY_LIST)?.data || [])
  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script)
  handleMethodList(script,funcList)
  //  --------------------
  const templatePath = path.join(__dirname, '../view/table.ejs')

  const templateParam = handleTemplate(fieldList,funcList,true)

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
  getTable
}