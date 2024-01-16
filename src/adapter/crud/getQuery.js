const {
  getFileInfo,
  addEmitMethodNoParam,
  handleMethodListHasOption,
  handleImportList,
  initScript,
  handleFormFieldList,
  getInfoByBinFunction,
  getEjsFileTemplateData,
  getInfoByLabel,
} = require("../../common")
const { nanoid } = require("nanoid")
const path = require('path')
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
  if (funcList.length) {
    funcList.forEach(func => {
      const { label, code } = func
      if (label !== LABEL_ENUM.QUERY_LIST) {
        script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam(code))
      }else{
        script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
      }
    });
  }
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
  // if(fieldList.length>0){
  //   toolbarBtnList.push({
  //     type:'primary',
  //     icon:"el-icon-search",
  //     functionName:'onQuery',
  //     name:'查询',
  //   })
  //   toolbarBtnList.push({
  //     type:'',
  //     icon:"el-icon-refresh",
  //     functionName:'onReset',
  //     name:'重置',
  //   })
  // }

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

function handleDeleteBatch(script,isDeleteBatch){
  if(isDeleteBatch){
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam('onBatchDelete'))
  }
}
// 根据模板+params转换为指定的scriptData,然后调用genScript
async function getQuery(fileParam, sourceData) {
  // 解析模板需要的数据，根据模板渲染即可
  const { template } = fileParam
  const type = COMPONENT_CRUD_ENUM.QUERY
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { functionList, elementList } = sourceData
  const isDeleteBatch = !!getInfoByLabel(functionList,LABEL_ENUM.DELETE_BATCH)
  const funcList = functionList.filter(item => item.label == LABEL_ENUM.EXT_GLOBAL)
  const fieldList = (getInfoByBinFunction(elementList,LABEL_ENUM.QUERY_LIST)?.data || []).filter(item => item.param.isSearch)
  // 初始化script
  const script = initScript(fileInfo.filename)
  // 处理要素
  handleFieldList(script,fieldList)
  //  处理功能
  handleMethodList(script, funcList)
  // 处理批量删除
  handleDeleteBatch(script,isDeleteBatch)
  //  整合一下imporList
  handleImportList(script)
  //  处理一下option
  handleMethodListHasOption(script)
  // ---------------------
  const templatePath = TEMPLATE_PATH[template][type]

  const templateParam = handleTemplate(fieldList,funcList)

  const templateData = await getEjsFileTemplateData(templatePath,{...templateParam,isDeleteBatch})

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