const { getFileInfo, initScript, addEmitMethodRow, getEjsFileTemplateData } = require("../../common")
const { LABEL_ENUM, VUE_DATA_SCRIPT_ENUM, PAGE_TYPE_ENUM, COMPONENT_CRUD_ENUM } = require("../../enum")
const { TEMPLATE_PATH } = require("../../config/templateMap")

function initPropList(script){
  script[VUE_DATA_SCRIPT_ENUM.PROP_LIST]=[{
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

function initDataList(script){
  script[VUE_DATA_SCRIPT_ENUM.DATA_LIST]=[{
    name: 'tableHeight',
    type: 'string',
    initValue: `'500px'`,
  }]
}
function initMountList(script){
  script[VUE_DATA_SCRIPT_ENUM.MOUNT_LIST]= [{
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
      if (label !== LABEL_ENUM.QUERY_LIST) {
        script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push(addEmitMethodRow(code))
      }else{
        script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
      }
    });
  }
}
// TODO:
function handleFieldList(){}


function getDeleteOrEditBtnParam(btnInfo,type){
  let isShow = false
  let showInfo = null
  if(btnInfo){
    isShow=true
    const {name:btnName,code} = btnInfo
    showInfo = {
      name:btnName?btnName:type==LABEL_ENUM.UPDATE?'编辑':'删除',
      functionName:code?code:type==LABEL_ENUM.UPDATE?'onEdit':'onDelete'
    }
  }
  return {
    isShow,
    showInfo
  }
}

function handleTemplate(fieldList,funcList){

  const btns = funcList.filter(item=>item.label == LABEL_ENUM.EXT_OBJ).map(item=>{
    return{
      param:'scope.row',
      name:item.name ,
      functionName:item.code
    }
  })

  const fields = fieldList.filter(item=>!item.param?.isHidden).map(field=>{
    return{
      key:field.code,
      label:field.name
    }
  })
  return {
    btns,
    fields

  }
}
async function getTable(fileParam, sourceData) {
  const {template} = fileParam
  const type = COMPONENT_CRUD_ENUM.TABLE
  const fileInfo = getFileInfo({ ...fileParam, type })
  //  --------------------
  const { hasDelete,hasUpdate,tableBtnList,operateBtnList,tableFieldList} = sourceData

  const funcList = [...tableBtnList,...operateBtnList]

  // 初始化script
  const script = initScript(fileInfo.filename)
  initStruct(script)
  handleMethodList(script,funcList)
  //  --------------------
  const templatePath = TEMPLATE_PATH[template][type]

  const {btns,fields} = handleTemplate(tableFieldList,funcList)

  const isShowOperate = hasUpdate || hasDelete|| btns.length>0

  const templateData = await getEjsFileTemplateData(templatePath,{...sourceData,btns,fields,isShowOperate})
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