const { getFileInfo, initScript, parseUrl, handleImportList, handleMethodListHasOption, handleFormFieldList, getInfoByLabel, getEjsFileTemplateData } = require("../../../src/common")
const path = require('path')
const changeCase = require('change-case')
const { LABEL_ENUM, DISPLAY_TYPE_ENUM } = require("../../../src/enum")

function initDataList(script){
  script['dataList']=[  {
    name: 'dialogWidth',
    type: 'string',
    initValue: 'CommonDialogWidth.smallForm',
  }, {
    name: 'dialogVisible',
    type: 'boolean',
    initValue: 'false',
  },{
    name:'formDataRules',
    type:'object',
    initValue: '{}',
  }]
}
function initImportDataList(script){
  script['importList'] = [{isDefault: true,from: '@/utils/tools',content: 'tools'}]
  script['importList'] = [{isDefault: true,from: '@/common/constants',content: 'CommonDialogWidth'}]
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
function isUpdate(funcInfo){
  return funcInfo.label ==LABEL_ENUM.UPDATE
}
function isCreate(funcInfo){
  return funcInfo.label ==LABEL_ENUM.INSERT
}
function initStruct(script,funcInfo){
  initDataList(script)
  initImportDataList(script)
  initMethodList(script)
  const {code,name,label,request} = funcInfo
  if(isUpdate(funcInfo)){
    script['dataList'].push({name: 'row',type: 'null',initValue: 'null',})
  }
  else if(isCreate(funcInfo)){
    script['dataList'].push({name: 'title',type: 'string',initValue: name?name:label==LABEL_ENUM.INSERT?'新增':'编辑'})
  }
}
function handleFieldList(script,fieldList){
  if(fieldList.length){
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
      handleFormFieldList(script, field)
    })
    const form = {
      name: 'formData',
      type: 'object',
      initValue
    }
    script['dataList'].push(form)
  }

}
function getInterfaceData(requestInfo){
  if(!requestInfo){
    throw new Error('没有对应的请求信息')
  }
  const { url } = requestInfo
  const { serviceType,interfaceName }= parseUrl(url)
  return {
    ServiceName:`${changeCase.pascalCase(serviceType)}Service`,
    InterfaceName:`${changeCase.camelCase(interfaceName)}`
  }
}

function handleMethodList(script,funcInfo,fieldList){
  const prikeyInfo = fieldList.find(item=>item.param.pk)
  const pri = prikeyInfo.field
  let requestInfo = null
  const { request } = funcInfo
  if(isUpdate(funcInfo)){
    requestInfo = getInfoByLabel(request,LABEL_ENUM.UPDATE)
    const queryInfo =getInfoByLabel(request,LABEL_ENUM.QUERY)
    const {ServiceName,InterfaceName} = getInterfaceData(queryInfo)
    script['methodList'].unshift({type:'editGetData',pri,ServiceName,InterfaceName})
    script['methodList'].unshift({type:'editDialogShow',pri})
    script['importList'].push({isDefault:false,content:`${ServiceName}`,from:'@/services'})
  }
  if(isCreate(funcInfo)){
    requestInfo = getInfoByLabel(request,LABEL_ENUM.INSERT)
    script['methodList'].unshift({type:'createDialogShow'})
  }
  const {ServiceName,InterfaceName}= getInterfaceData(requestInfo)
  script['importList'].push({isDefault:false,content:`${ServiceName}`,from:'@/services'})
  // 添加onSubmitForm方法
  script['methodList'].push({
    type:'dialogSubmit',
    ServiceName,
    InterfaceName
  })

}
function handleTemplate(fileParam,sourceData){
  const { name } = fileParam
  const { functionList, elementList } = sourceData
  let funcInfo = null
  let fieldList = []
  let sourceFieldList = []
  if(name == 'editDialog'){
    funcInfo = getInfoByLabel(functionList,LABEL_ENUM.UPDATE)
    sourceFieldList =  (elementList.find(item => item.bindFunction == LABEL_ENUM.UPDATE)?.data || [])
    fieldList = sourceFieldList.filter(item=>!item.param.isHidden)
  }else if(name == 'createDialog'){
    funcInfo = getInfoByLabel(functionList,LABEL_ENUM.INSERT)
    sourceFieldList= (elementList.find(item => item.bindFunction == LABEL_ENUM.INSERT)?.data || [])
    fieldList= sourceFieldList .filter(item=>!item.param.isHidden)
  }else{
    console.log(`不支持的dialog-${name}`);
  }

  const queryList = fieldList.map(field=>{
    const {name,field:prop,param:fieldParam,bindAttr} = field
    const {displayType} =fieldParam 
    const param =  {
      label:name,
      displayType,
      prop
    }
    if(displayType == DISPLAY_TYPE_ENUM.SELECT){
      param.entityKey = changeCase.camelCase(bindAttr)
      param.entityLabel = prop
    }
    return param
  })
  return {
    funcInfo,
    queryList,
    fieldList,
    sourceFieldList
  }
}
async function getDialog(fileParam, sourceData) {
  const { name } = fileParam
  const type = 'dialog'
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const {queryList,funcInfo,fieldList,sourceFieldList} = handleTemplate(fileParam, sourceData)
  if(!funcInfo){
    // 不生成页面
    return ''
  }
  const { request } = funcInfo
  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script,funcInfo)
  // 处理要素
  handleFieldList(script,fieldList)
  handleMethodList(script,funcInfo,sourceFieldList)
  //  整合一下imporList
  handleImportList(script)
  //  处理一下option
  handleMethodListHasOption(script)
  // ---------------------
  const templatePath = path.join(__dirname, '../view/dialog.ejs')

  const templateParam = { queryList }
  
  const templateData = await getEjsFileTemplateData(templatePath,templateParam)

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