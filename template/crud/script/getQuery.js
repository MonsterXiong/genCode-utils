const {
  getFileInfo,
  addEmitMethodNoParam,
  handleSelectEntityType,
  handleMethodListHasOption,
  handleImportList,
  initScript,
  getTemplate
} = require("../../../src/common")

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

// 根据模板+params转换为指定的scriptData,然后调用genScript
function getQuery(fileParam, sourceData) {
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
  return {
    ...fileInfo,
    params: {
      template: getTemplate(template,type),
      script
    }
  }
}

module.exports = {
  getQuery
}