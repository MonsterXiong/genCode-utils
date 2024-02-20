const { getFileInfo, initScript, addEmitMethodRow, getEjsFileTemplateData,  } = require("../../../common")
const { CRUD_LABEL_ENUM, VUE_DATA_SCRIPT_ENUM, PAGE_TYPE_ENUM, COMPONENT_CRUD_ENUM, DISPLAY_TYPE_ENUM } = require("../../../enum")
const { TEMPLATE_PATH } = require("../../../config/templateMap")
const { addCommonQueryConditionBuilder } = require("../../commonMethod")
const { parseUrlGetParam } = require("../../commonMethod/util")
function initPropList(script) {
  script[VUE_DATA_SCRIPT_ENUM.PROP_LIST] = [{
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

function initMethodList(script) {
  script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST] = [{
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
    name: 'onCurrentChange',
    content: '',
    param: 'page',
  }]
}

function initDataList(script) {
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST] = [{
    name: 'tableHeight',
    type: 'string',
    initValue: '500px',
  }]
}
function initMountList(script) {
  script[VUE_DATA_SCRIPT_ENUM.MOUNT_LIST] = [{
    isAwait: false,
    type: 'callMethod',
    content: 'setHeight'
  }]
}

function initStruct(script) {
  initPropList(script)
  initDataList(script)
  initMethodList(script)
  initMountList(script)
}

function handleFieldList(script, fieldList) {
  if (fieldList.length) {
    fieldList.forEach(field => {
      const { param: { displayType },code } = field
      if (displayType == DISPLAY_TYPE_ENUM.ENUM) {
        script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({type:'tableEnumMethod',name:`${code}EnumData`})
      }
    })
  }

}

function handleMethodList(script, funcList) {
  if (funcList.length) {
    funcList.forEach(func => {
      const { label, code } = func
      if (label !== CRUD_LABEL_ENUM.QUERY_LIST) {
        script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodRow(code))
      } else {
        addCommonQueryConditionBuilder(script)
      }
    });
  }
}

function handleTemplate(fieldList, funcList) {

  const btns = funcList.filter(item => item.label == CRUD_LABEL_ENUM.EXT_OBJ).map(item => {
    return {
      param: 'scope.row',
      name: item.name,
      functionName: item.code
    }
  })

  const fields = fieldList.filter(item => !item.param?.isHidden).map(field => {
    const { code, name, selectUrl,param:{displayType} } = field
    let key = code
    if (selectUrl) {
      const { param } = parseUrlGetParam(selectUrl)
      const displayAttr = param?.displayAttr
      if (displayAttr) {
        key = `${key}_quote[0].${displayAttr}`
      }
    }
    return {
      key,
      label: name,
      displayType
    }
  })
  return {
    btns,
    fields
  }
}
async function getTable(fileParam, sourceData) {
  const { template } = fileParam
  const type = COMPONENT_CRUD_ENUM.TABLE
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { hasDelete, hasUpdate, tableBtnList, operateBtnList, tableFieldList } = sourceData

  const funcList = [...tableBtnList, ...operateBtnList]

  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script)
  handleMethodList(script, funcList)
  handleFieldList(script, tableFieldList)
  //  --------------------
  const templatePath = TEMPLATE_PATH[template][type]

  const { btns, fields } = handleTemplate(tableFieldList, funcList)

  const isShowOperate = hasUpdate || hasDelete || btns.length > 0

  const templateData = await getEjsFileTemplateData(templatePath, { ...sourceData, btns, fields, isShowOperate })
  return {
    ...fileInfo,
    params: {
      template: templateData,
      script
    }
  }
}

module.exports = {
  getTable
}