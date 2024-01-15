const { getFileInfo, initScript, parseUrl, handleImportList, handleSelectEntityType, handleMethodListHasOption } = require("../../../src/common")
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
  return funcInfo.label =='update'
}
function isCreate(funcInfo){
  return funcInfo.label =='insert'
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
    script['dataList'].push({name: 'title',type: 'string',initValue: name?name:label=='insert'?'新增':'编辑'})
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
      const { displayType, request } = field
      if(request){
        if (displayType == 'select') {
          const { type } = request
          if (type == 'entity') {
            handleSelectEntityType(script, field)
          }
        }
      }

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
  const prikeyInfo = fieldList.find(item=>item.pk)
  const pri = prikeyInfo.field
  let requestInfo = null
  const { request } = funcInfo
  if(isUpdate(funcInfo)){
    requestInfo = request.find(item=>item.label == 'update')
    const queryInfo = request.find(item=>item.label == 'query')
    const {ServiceName,InterfaceName} = getInterfaceData(queryInfo)
    script['methodList'].unshift({type:'editGetData',pri,ServiceName,InterfaceName})
    script['methodList'].unshift({type:'editDialogShow',pri})
    script['importList'].push({isDefault:false,content:`${ServiceName}`,from:'@/services'})
  }
  if(isCreate(funcInfo)){
    requestInfo = request.find(item=>item.label == 'insert')
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
    funcInfo = functionList.find(item=>item.label =='update')
    sourceFieldList =  (elementList.find(item => item.bindFunction == 'update')?.data || [])
    fieldList = sourceFieldList.filter(item=>!item.param.isHidden)
  }else if(name == 'createDialog'){
    funcInfo = functionList.find(item=>item.label =='insert')
    sourceFieldList= (elementList.find(item => item.bindFunction == 'insert')?.data || [])
    fieldList= sourceFieldList .filter(item=>!item.param.isHidden)
  }else{
    console.log(`不支持的dialog-${name}`);
  }

  const queryList = fieldList.map(field=>{
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