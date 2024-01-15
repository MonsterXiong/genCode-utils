const {
  getFileInfo,
  addEmitMethodNoParam,
  handleSelectEntityType,
  handleMethodListHasOption,
  handleImportList,
  initScript,
} = require("../../../src/common")
const ejs = require('ejs')
const { nanoid } = require("nanoid")
const path = require('path')
const changeCase = require('change-case')
// 初始化查询和重置功能
function initQueryAndReset(script) {
  script['methodList'].push(addEmitMethodNoParam('onQuery'))
  script['methodList'].push(addEmitMethodNoParam('onReset'))
  script['propList'].push({ name: 'queryForm', type: 'object', initValue: '{}' })
}

function handleMethodList(script, funcList) {
  if (funcList.length) {
    funcList.forEach(func => {
      const { label, code } = func
      if (label !== 'queryList') {
        script['methodList'].push(addEmitMethodNoParam(code))
      }else{
        script['importList'].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
      }
    });
  }
}


function handleFieldList(script,fieldList){
  if (fieldList.length) {
    initQueryAndReset(script)
    fieldList.forEach(field => {
      const { displayType, request } = field
      if (displayType == 'select') {
        const { type } = request
        if (type == 'entity') {
          handleSelectEntityType(script, field)
        }
      }
    })
  }
}

function handleTemplate(fieldList,funcList){
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

  funcList.filter(item=>item.label !=='queryList').forEach(func=>{
    const {name,code,label} = func
    if(label == 'insert'){
      toolbarBtnList.push({
        type:'success',
        icon:"el-icon-circle-plus-outline",
        functionName:code?code:'onAdd',
        name:name?name:'新增',
        param:""
      })
    }else if(label == 'deleteBatch'){
      toolbarBtnList.push({
        type:'danger',
        icon:"el-icon-delete",
        functionName:code?code:'onBatchDelete',
        name:name?name:'批量删除',
        param:""
      })
    }else if(label == 'globalExt'){
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
  const type = 'query'
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { functionList, elementList } = sourceData
  const funcList = functionList.filter(item => item.functionType == 'global')
  const fieldList = (elementList.find(item => item.bindFunction == 'queryList')?.data || []).filter(item => item.param.isSearch)
  // 初始化script
  const script = initScript(fileInfo.filename)
  // 处理要素
  handleFieldList(script,fieldList)
  //  处理功能
  handleMethodList(script, funcList)
  //  整合一下imporList
  handleImportList(script)
  //  处理一下option
  handleMethodListHasOption(script)
  // ---------------------
  const templatePath = path.join(__dirname, '../view/query.ejs')

  const templateParam = handleTemplate(fieldList,funcList)

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
  getQuery
}