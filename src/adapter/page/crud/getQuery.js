const {
  getFileInfo,
  addEmitMethodNoParam,
  handleMethodListHasOption,
  initScript,
  handleFormFieldList,
  getEjsFileTemplateData,
} = require("../../../common")
const { nanoid } = require("nanoid")
const { VUE_DATA_SCRIPT_ENUM } = require("../../../enum/vueDataScript")
const { CRUD_LABEL_ENUM } = require("../../../enum/label")
const { COMPONENT_CRUD_ENUM } = require("../../../enum/componentType")
const { TEMPLATE_PATH } = require("../../../config/templateMap")
const { handleImportList } = require("../../commonMethod/genScriptUtils")
const { getInterfaceData } = require("../../commonMethod/util")
// 初始化查询和重置功能
function initQueryAndReset(script) {
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam('onQuery'))
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodNoParam('onReset'))
  script[VUE_DATA_SCRIPT_ENUM.PROP_LIST].push({ name: 'queryForm', type: 'object', initValue: '{}' })
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
    return param
  })

  const toolbarBtnList = []

  funcList.filter(item=>item.label !==CRUD_LABEL_ENUM.QUERY_LIST).forEach(func=>{
    const {name,code,label} = func
    if(label == CRUD_LABEL_ENUM.INSERT){
      toolbarBtnList.push({
        type:'success',
        icon:"el-icon-circle-plus-outline",
        functionName:code?code:'onAdd',
        name:name?name:'新增',
        param:""
      })
    }
    else if(label == CRUD_LABEL_ENUM.EXT_GLOBAL){
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
  const {queryBtnList,queryFieldList:fieldList,toolbarBtnList:extBtnList,exportInfo,importInfo,exportTemplateInfo,hasExport,hasImport,hasExportTemplate} = sourceData
  // 初始化script
  const script = initScript(fileInfo.filename)
  // 处理要素
  handleFieldList(script,fieldList)
  //  处理功能
  handleMethodList(script, [...queryBtnList,...extBtnList])
  if(hasExport){
    const { ServiceName, InterfaceName }=getInterfaceData(exportInfo)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'tableExportMethod',exportName:exportInfo.name, name: exportInfo.code, ServiceName, InterfaceName, param: '' })
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: ServiceName, from: '@/services' })
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: 'exportFile', from: '@/utils/commonUtil' })
  }
  if(hasImport){
    const { ServiceName, InterfaceName }=getInterfaceData(importInfo)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'tableImportMethod', name: importInfo.code, ServiceName, InterfaceName, param: '' })
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: ServiceName, from: '@/services' })
  }
  if(hasExportTemplate){
    const { ServiceName, InterfaceName }=getInterfaceData(exportTemplateInfo)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'tableExportTemplateMethod',exportName:exportTemplateInfo.name, name: exportTemplateInfo.code, ServiceName, InterfaceName, param: '' })
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: ServiceName, from: '@/services' })
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: 'exportFile', from: '@/utils/commonUtil' })
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
  }
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