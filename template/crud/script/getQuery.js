const {
  getFileInfo,
  addEmitMethodNoParam,
  handleSelectEntityType,
  handleMethodListHasOption,
  handleImportList
} = require("../../../src/common")
const { templateDataMap } = require("../view/templateData")
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

// 根据模板+params转换为指定的scriptData,然后调用genScript
function getQuery(fileParam, sourceData) {
  const { template } = fileParam
  const type = 'query'
  const fileInfo = getFileInfo({ ...fileParam, type })
  // 清洗数据，然后生成import
  //  --------------------
  const { functionList, elementList } = sourceData
  const funcList = functionList.filter(item => item.functionType == 'global')
  const fieldList = (elementList.find(item => item.bindFunction == 'queryList')?.data || []).filter(item => item.param.isSearch)
  // const fieldList = data.map(item => {
  //   const name = dataModel[item.bindObj].find(dataColumn => dataColumn.code == item.bindAttr)
  //   return {
  //     ...item,
  //     name: item.alias ? item.alias : name,
  //     field: item.aliasCode ? item.aliasCode : item.bindAttr
  //   }
  // })
  const script = {
    name: fileInfo.filename,
    importList: [],
    propList: [],
    dataList: [],
    mountList: [],
    methodList: [],
    componentList: []
  }

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
  handleMethodList(script, funcList)
  handleImportList(script)
  handleMethodListHasOption(script)
  // ---------------------
  return {
    ...fileInfo,
    params: {
      template: handleTemplate(template,type),
      script
    }
  }
}

function handleTemplate(template,type){
  return templateDataMap[template][type]
}

module.exports = {
  getQuery
}