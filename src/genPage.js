function getTab(number=1){
  return new Array(number).fill('').reduce((res)=>res+=`\t`,'')
}
function genTemplate(template){
  // 从模板中获取
  let code = `<template>`
  code +=`${template}`
  code += `\n</template>\n`
  return code
}

function isEmpty(list){
  return Array.isArray(list) && list.length > 0
}

function getPage(scriptData){
  const {template,script} = scriptData
  const {importList } = script
  let code = genTemplate(template) || ''
  code += `<script>\n`
  if(isEmpty(importList)){
    code += genImport(script.importList)
  }
  code +=`export default {${getDefaultContent(script)}\n}`
  code += `\n</script>`
  return code
}
function genImport(list=[]){
  return list.reduce((res,item)=>res+=`${getImport(item)}\n`,'')
}

function getDefaultContent(scriptData) {
  const {name,dataList,componentList,watchList,methodList,mountList,propList} = scriptData
  let code = ""
  if (name){
    code += `\n${getTab()}name: '${name}',`
  }
  if(isEmpty(propList)){
    code += formatScriptAttr('props',':',getData(propList,2))
  }
  if(isEmpty(componentList)){
    code += formatScriptAttr('components',':',getComponent(componentList))
  }
  if(isEmpty(dataList)){
    code += `\n${getTab()}data() {\n${getTab(2)}return {\n${getData(dataList,3)}${getTab(2)}\n${getTab(2)}}\n${getTab()}},`
  }
  if(isEmpty(mountList)){
    code += formatScriptAttr('async mounted','()',getMount(mountList))
  }
  if(isEmpty(watchList)){
    code += formatScriptAttr('watch',':',getWatch())
  }
  if(isEmpty(methodList)){
    code += formatScriptAttr('methods',':',getMethod(methodList))
  }
  return code
}

function formatScriptAttr(attr,symbol,content){
  return `\n${getTab()}${attr}${symbol} {\n${content ? content : ''}\n${getTab()}},`
}
function getWatch(){}

function getComponent(list=[]){
  return list.reduce((res,item,index,arr)=>res+=`${getTab(2)}${item},${index!==arr.length-1?'\n':''}`,'')
}

function getMount(mountList=[]){
  let res = ''
  mountList.forEach((item,index)=>{
    if(item.type == 'callMethod'){
      res+=`${getTab(2)}${item.isAwait?'await':''} this.${item.content}()${index!=mountList.length-1?'\n':''}`
    }
  })
  return res
}
function getData(list=[],indent){
  return list.reduce((res,item,index,arr)=>res+=`${getTab(indent)}${item.name}: ${getDataItem(item,indent)},${index!==arr.length-1?'\n':''}`,'')
}


function getDataItem(dataItem,indent){
  const {name,type,initValue} = dataItem
  if(type == 'object'){
    if(Array.isArray(initValue) && initValue.length){
      let result = `{\n`
      initValue.forEach((item)=>{
        result+=`${getTab(indent+1)}${item.name}: ${getDataItem(item)},\n`
      })
      result += `${getTab(indent)}}`
      return result
    }
  }
  if(type == 'array'){
    if(Array.isArray(initValue) && initValue.length){
      let result = `[`
      initValue.forEach(item=>{
        result+=genDataItem(item)
      })
      result += `],`
    }
  }
  return `${initValue}`
}
function getImport(importData){
  const {isDefault,from,content} = importData
  return `import ${isDefault?'':'{ '}${content}${isDefault?'':' }'} from '${from}'`
}
function getMethod(list=[]){
  return list.reduce((res,item,index,arr)=>res+=`${getMethodItem(item)}${index!==arr.length-1?'\n':''}`,'')
}
function getMethodItem(method){
  const {type}= method
  const specialMethodMap = callMethod()
  const action = specialMethodMap[type]
  if(typeof action !== 'function'){
    console.log('暂时不支持该类型',type);
    return
  }
  return action(method)
}

function callMethod(){
  return {
    'emit':(method)=>getEmitMethod(method),
    'option':(method)=>getOptionMethod(method),
    'initOption':(method)=>getInitOptionMethod(method),
    'placeholder':(method)=>getPlaceholderMethod(method),
    'onEdit':(method)=>getOnEditMethod(method),
    'onDelete':(method)=>getOnDeleteMethod(method),
    // 表单
    'onDialogClose':(method)=>getOnDialogCloseMethod(method),
    'onReset':(method)=>getOnResetMethod(method),
    'dialogShow':(method)=>getDialogShowMethod(method),
    'dialogSubmit':(method)=>getDialogSubmitMethod(method),
    'setHeight':(method)=>getSetHeightMethod(method),
    'pageInfoChange':(method)=>getPageInfoMethod(method),
  }
}

function getPageInfoMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}(${param}) {
      this.pageInfo.${param} = ${param}
    },`
}
function getSetHeightMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}() {
      this.$nextTick(() => {
        this.tableHeight = this.$refs.tableRef.offsetHeight - this.$refs.paginationRef.offsetHeight + 'px'
      })
    },`
}

function getDialogSubmitMethod(method){
  const { name, param,pri,updateServiceName,updateInterfaceName,insertServiceName,insertInterfaceName } = method
  return `${getTab(2)}${name}(${param}) {
      this.$refs.formRef.validate(async valid => {
        if (valid) {
          if (this.row && this.row.${pri}) {
            await ${updateServiceName}.${updateInterfaceName}(this.formData);
          } else {
            await ${insertServiceName}.${insertInterfaceName}(this.formData);
          }
          tools.message("保存成功");
          this.onDialogClose();
          this.$emit("refresh");
        } else {
          return false;
        }
      });
    },`
}

function getDialogShowMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}(${param}) {
      this.title = title;
      this.dialogVisible = true;
      this.row = row;
      if (row) {
        this.formData = { ...row };
      } else {
        this.formData = {};
      }
    },`
}
function getOnDialogCloseMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}() {
      this.onReset();
      this.dialogVisible = false;
    },`
}
function getOnResetMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}() {
      Object.keys(this.formData).forEach(key=>{
        this.formData[key] = ""
      })
    },`
}
function getOnDeleteMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}(row) {
      this.apiDelete([row])
    },`
}

function getOnEditMethod(method){
  const { name, param,dialogRef,dialogTitle } = method
  return `${getTab(2)}${name}(row) {
      this.$refs.${dialogRef}.show({ row, title: '编辑${dialogTitle}' })
    },`
}

function getInitOptionMethod({children}){
  return `${getTab(2)}async initOption() {\n${getInitOptionData(children)}${getTab(2)}},`
}

function getInitOptionData(initOptionList){
  return initOptionList.reduce((res,item)=>res+=`${getTab(3)}await this.${item}()\n`,'')
}

function getOptionMethod(option){
  const {serviceName,interfaceName,variableName,functionName} = option
  return `${getTab(2)}async ${functionName}() {
      let queryCondition = QueryConditionBuilder.getInstanceNoPage()
      const { data } = await ${serviceName}.${interfaceName}(queryCondition)
      this.${variableName} = data
    },`
}

function getEmitMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}() {
      this.$emit('${name}'${param?',param':''})
    },`
}

function getPlaceholderMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}(${param}) {
      // TODO:implement ${name}
    },`
}

module.exports = {
  getPage
}