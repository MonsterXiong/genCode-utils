const {
  getFileInfo,
  addEmitMethodNoParam,
  handleMethodListHasOption,
  handleImportList,
  initScript,
  handleFormFieldList,
  getEjsFileTemplateData,
} = require("../../common")
const { nanoid } = require("nanoid")
const { LABEL_ENUM, DISPLAY_TYPE_ENUM, VUE_DATA_SCRIPT_ENUM,  COMPONENT_CRUD_ENUM } = require("../../enum")
const { camelCase } = require("../../utils/commonUtil")
const { TEMPLATE_PATH } = require("../../config/templateMap")
// 初始化查询和重置功能
function initQueryAndReset(script) {
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam('onQuery'))
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam('onReset'))
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'queryForm', type: 'object', initValue: '{}' })
}
function handleMethodList(script, funcList) {
    funcList.forEach(func => {
      const { code } = func
        script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam(code))
    });
}


function handleFieldList(script,fieldList){
  if (fieldList.length) {
    initQueryAndReset(script)
    fieldList.forEach(field =>handleFormFieldList(script, field))
  }
}

function handleTemplate(fieldList,funcList){
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

  const toolbarBtnList = []

  funcList.filter(item=>item.label !==LABEL_ENUM.QUERY_LIST).forEach(func=>{
    const {name,code,label} = func
    if(label == LABEL_ENUM.INSERT){
      toolbarBtnList.push({
        type:'success',
        icon:"el-icon-circle-plus-outline",
        functionName:code?code:'onAdd',
        name:name?name:'新增',
        param:""
      })
    }
    else if(label == LABEL_ENUM.EXT_GLOBAL){
      toolbarBtnList.push({
        type:'',
        icon:'',
        functionName:code?code:nanoid(),
        name:name?name:'扩展按钮',
        param:""
      })
    }else{
      console.log(`功能label:${label}不符合标准`);
    }
  })

  return {
    queryList,
    toolbarBtnList
  }
}

// 根据模板+params转换为指定的scriptData,然后调用genScript
async function getQuery(fileParam, sourceData) {
  // 解析模板需要的数据，根据模板渲染即可
  const { template } = fileParam
  const type = COMPONENT_CRUD_ENUM.QUERY
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const {queryBtnList,queryFieldList:fieldList,toolbarBtnList:extBtnList} = sourceData
  // 初始化script
  const script = initScript(fileInfo.filename)
  // 处理要素
  handleFieldList(script,fieldList)
  //  处理功能
  handleMethodList(script, [...queryBtnList,...extBtnList])
  //  整合一下imporList
  handleImportList(script)
  //  处理一下option
  handleMethodListHasOption(script)
  // ---------------------
  const templatePath = TEMPLATE_PATH[template][type]
  const templateParam = handleTemplate(fieldList,extBtnList)
  const templateData = await getEjsFileTemplateData(templatePath,{...sourceData,...templateParam})

  return {
    ...fileInfo,
    params: {
      template: templateData,
      script
    }
  }
}

module.exports = {
  getQuery
}