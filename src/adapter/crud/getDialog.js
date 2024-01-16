const { getFileInfo, initScript, parseUrl, handleImportList, handleMethodListHasOption, handleFormFieldList, getInfoByLabel, getEjsFileTemplateData } = require("../../common")
const path = require('path')
const { LABEL_ENUM, DISPLAY_TYPE_ENUM, VUE_DATA_SCRIPT_ENUM } = require("../../enum")
const { pascalCase, camelCase } = require("../../utils/commonUtil")

function initDataList(script){
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST]=[  {
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
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST] = [{isDefault: true,from: '@/utils/tools',content: 'tools'}]
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST] = [{isDefault: true,from: '@/common/constants',content: 'CommonDialogWidth'}]
}
function initMethodList(script){
script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST]=[{
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
  const {name,label} = funcInfo
  if(isUpdate(funcInfo)){
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({name: 'row',type: 'null',initValue: 'null',})
  }
  else if(isCreate(funcInfo)){
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({name: 'title',type: 'string',initValue: name?name:label==LABEL_ENUM.INSERT?'新增':'编辑'})
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
        name: field.code,
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
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push(form)
  }

}
function getInterfaceData(requestInfo){
  if(!requestInfo){
    throw new Error('没有对应的请求信息')
  }
  const { request } = requestInfo
  const { serviceType,interfaceName }= parseUrl(request)
  return {
    ServiceName:`${pascalCase(serviceType)}Service`,
    InterfaceName:`${camelCase(interfaceName)}`
  }
}
function handleMethodList(script,funcList,fieldList){
  const prikeyInfo = fieldList.find(item=>item.param.pk)
  const pri = prikeyInfo?.code
  let requestInfo = null
  if(getInfoByLabel(funcList,LABEL_ENUM.UPDATE)){
    requestInfo = getInfoByLabel(funcList,LABEL_ENUM.UPDATE)
    const queryInfo =getInfoByLabel(funcList,LABEL_ENUM.QUERY)
    if(!queryInfo){
      const {ServiceName,InterfaceName} = getInterfaceData(queryInfo)
      script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({type:'editGetData',pri,ServiceName,InterfaceName})
      script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({isDefault:false,content:`${ServiceName}`,from:'@/services'})
    }
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({type:'editDialogShow',pri})
  }
  if(getInfoByLabel(funcList,LABEL_ENUM.INSERT)){
    requestInfo = getInfoByLabel(funcList,LABEL_ENUM.INSERT)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].unshift({type:'createDialogShow'})
  }
  const {ServiceName,InterfaceName}= getInterfaceData(requestInfo)
  script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({isDefault:false,content:`${ServiceName}`,from:'@/services'})
  // 添加onSubmitForm方法
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({
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
    const {name,code,param:fieldParam,bindAttr} = field
    const {displayType} =fieldParam 
    const param =  {
      label:name,
      displayType,
      prop:code
    }
    if(displayType == DISPLAY_TYPE_ENUM.SELECT){
      param.entityKey = camelCase(bindAttr)
      param.entityLabel = code
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
  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script,funcInfo)
  // 处理要素
  handleFieldList(script,fieldList)
  handleMethodList(script,sourceData.functionList,sourceFieldList)
  //  整合一下imporList
  handleImportList(script)
  //  处理一下option
  handleMethodListHasOption(script)
  // ---------------------
  // const templatePath = path.join(__dirname, '../view/dialog.ejs')
  const templatePath = 'E://temp//genCode-utils//public//template//v3//crud//dialog.ejs'

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