const { getFileInfo, initScript } = require("../../../src/common")
const path = require('path')
const ejs = require('ejs')
const changeCase = require('change-case')

function initDataList(script){
  script['dataList']=[  {
    name: 'dialogWidth',
    type: 'string',
    initValue: 'CommonDialogWidth.smallForm',
  }, {
    name: 'dialogVisible',
    type: 'boolean',
    initValue: 'false',
  }]
}
function initImportDataList(script){
  script['importList'] = [{isDefault: true,from: '@/utils/tools',content: 'tools'}]
}
function initMethodList(script){
script['methodList']=[{
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
function initStruct(script,funcInfo){
  initDataList(script)
  initImportDataList(script)
  initMethodList(script)
  const {code,name,label,request} = funcInfo
  if(label == 'update'){
    script['dataList'].push({name: 'row',type: 'null',initValue: 'null',})
  }
  else if(name == 'createDialog'){
    script['dataList'].push({name: 'title',type: 'string',initValue: name?name:label=='insert'?'新增':'编辑'})
  }
}
function handleFieldList(script,fieldList){
  const initValue = [{
    name: 'name',
    type: 'string',
    initValue: '""'
  }]
  fieldList.forEach(field=>{
    initValue.push({
      name: field.field,
      type:'string',
      initValue: '""',
    })
  })
  const form = {
    name: 'formData',
    type: 'object',
    initValue
  }
  script['dataList'].push(form)


   
}

function handleTemplate(fileParam,sourceData){
  const { name } = fileParam
  const { functionList, elementList } = sourceData
  let funcInfo = null
  let fieldList = []
  if(name == 'editDialog'){
    funcInfo = functionList.find(item=>item.label =='update')
    fieldList = (elementList.find(item => item.bindFunction == 'update')?.data || [])
  }else if(name == 'createDialog'){
    funcInfo = functionList.find(item=>item.label =='insert')
    fieldList = (elementList.find(item => item.bindFunction == 'insert')?.data || [])
  }else{
    console.log(`不支持的dialog-${name}`);
  }

  const queryList = fieldList.filter(item=>!item.param.isHidden).map(field=>{
    const {name,field:prop,displayType,bindAttr} = field
    const param =  {
      label:name,
      displayType,
      prop
    }
    if(displayType == 'select'){
      param.entityKey = changeCase.camelCase(bindAttr)
      param.entityLabel = prop
    }
    return param
  })
  return {
    funcInfo,
    queryList,
    fieldList
  }
}
async function getDialog(fileParam, sourceData) {
  const { name } = fileParam
  const type = 'dialog'
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const {queryList,funcInfo,fieldList} = handleTemplate(fileParam, sourceData)
  if(!funcInfo){
    // 不生成页面
    return ''
  }
  const { request } = funcInfo
  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script)
  // // 处理要素
  handleFieldList(script,fieldList)
  // //  处理功能
  // handleMethodList(script, funcList)
  // //  整合一下imporList
  // handleImportList(script)
  // //  处理一下option
  // handleMethodListHasOption(script)
  // ---------------------
  const templatePath = path.join(__dirname, '../view/dialog.ejs')


  const templateParam = { queryList }
  
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
  getDialog
}