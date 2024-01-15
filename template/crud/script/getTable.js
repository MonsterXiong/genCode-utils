const { getFileInfo, initScript, addEmitMethodRow } = require("../../../src/common")
const { templateDataMap } = require('../view/templateData')
const path = require('path')
const ejs = require('ejs')
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
      if (label !== 'queryList') {
        console.log(code);
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
      name:btnName?btnName:type=='update'?'编辑':'删除',
      functionName:code?code:type=='update'?'onEdit':'onDelete'

    }
  }
  return {
    isShow,
    showInfo
  }
}

function handleTemplate(fieldList,funcList,isDeleteBatch=false){
  const editInfo = funcList.find(item=>item.label == 'update')
  const deleteInfo = funcList.find(item=>item.label == 'delete')
  const {isShow:isEdit,showInfo:editBtnInfo} = getDeleteOrEditBtnParam(editInfo,'update')
  const {isShow:isDelete,showInfo:deleteBtnInfo} = getDeleteOrEditBtnParam(deleteInfo,'delete')

  const btns = funcList.filter(item=>!['delete','update'].includes(item.label)).map(item=>{
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
  const isDeleteBatch =!!functionList.find(item=>item.label == 'deleteBatch')
  const funcList = functionList.filter(item => item.functionType == 'obj')
  const fieldList = (elementList.find(item => item.bindFunction == 'queryList')?.data || [])
  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script)
  handleMethodList(script,funcList)
  //  --------------------
  const templatePath = path.join(__dirname, '../view/table.ejs')

  const templateParam = handleTemplate(fieldList,funcList,isDeleteBatch)

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