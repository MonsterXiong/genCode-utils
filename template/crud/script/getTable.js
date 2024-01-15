const { getFileInfo, initScript, addEmitMethodRow } = require("../../../src/common")
const { templateDataMap } = require('../view/templateData')


function initPropList(script){
  script['propList']=[{
    name: 'tableData',
    type: 'object',
    initValue: '{}',
  }, {
    name: 'total',
    type: 'object',
    initValue: '{}',
  }, {
    name: 'pageInfo',
    type: 'object',
    initValue: '{}',
  }]
}

function initMethodList(script){
  script['methodList'] = [{
    type: 'setHeight',
    name: 'setHeight',
    content: "",
    param: ""
  }, {
    type: 'pageInfoChange',
    name: 'onSizeChange',
    content: '',
    param: 'rows',
  }, {
    type: 'pageInfoChange',
    name: 'onSizeChange',
    content: '',
    param: 'page',
  }]
}

function initDataList(script){
  script['dataList']=[{
    name: 'tableHeight',
    type: 'string',
    initValue: `'500px'`,
  }]
}
function initMountList(script){
  script['mountList']= [{
    isAwait: false,
    type: 'callMethod',
    content: 'setHeight'
  }]
}

function initStruct(script){
  initPropList(script)
  initDataList(script)
  initMethodList(script)
  initMountList(script)
}

function handleMethodList(script, funcList) {
  if (funcList.length) {
    funcList.forEach(func => {
      const { label, code } = func
      if (label !== 'queryList') {
        console.log(code);
        script['methodList'].push(addEmitMethodRow(code))
      }else{
        script['importList'].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
      }
    });
  }
}

function handleFieldList(){}
function getTable(fileParam, sourceData) {
  const { template } = fileParam
  const type = 'table'
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { functionList, elementList } = sourceData
  const funcList = functionList.filter(item => item.functionType == 'obj')
  const fieldList = (elementList.find(item => item.bindFunction == 'queryList')?.data || [])
  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script)
  // handleFieldList()
  handleMethodList(script,funcList)
  //  --------------------
  return {
    ...fileInfo,
    params: {
      template: templateDataMap[template][type],
      script
    }
  }
}

module.exports = {
  getTable
}