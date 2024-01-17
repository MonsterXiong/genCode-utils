const { getTab } = require("../../common")


function getPageInfoMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}(${param}) {
      this.pageInfo.${param} = ${param}
    },`
}
function getSetHeightMethod(method){
  const { name, param } = method
  return `${getTab(2)}setHeight() {
      this.$nextTick(() => {
        this.tableHeight = this.$refs.tableRef.offsetHeight - this.$refs.paginationRef.offsetHeight + 'px'
      })
    },`
}
function getDialogSubmitMethod(method){
  const { ServiceName,InterfaceName } = method
  return `${getTab(2)}async onSubmit() {
      this.$refs.formRef.validate(async valid => {
        if (valid) {
          await ${ServiceName}.${InterfaceName}(this.formData);
          tools.message("操作成功");
          this.onDialogClose();
          this.$emit("refresh");
        } else {
          return false;
        }
      });
    },`
}
function getEditDialogShowMethod(method){
  const { name, param,pri } = method
  return `${getTab(2)}async show(row) {
      this.dialogVisible = true;
      this.row = row;
      if(row) {
        this.formData = {...row}
      }
      await this.getData(${pri?'row.'+pri:''})
    },`
}
function getEditGetData(method){
  const { name, param,pri } = method
  const { ServiceName,InterfaceName } = method
  return `${getTab(2)}async getData(${pri}) {
      const { data } = await ${ServiceName}.${InterfaceName}(${pri})
      this.formData = data
    },`
}
function getEmptyEditGetData(method){
  return `${getTab(2)}async getData() {
      console.log('没有查询功能哦')
    },`
}
function getCreateDialogShowMethod(method){
  return `${getTab(2)}show() {
      this.dialogVisible = true;
    },`
}
function getTableDeleteMethod(method){
  const { name, param,pri, ServiceName,InterfaceName } = method
  return `${getTab(2)}async ${name}(${param}) {
      try {
        await tools.confirm('请确认是否删除？')
        const { code } = await ${ServiceName}.${InterfaceName}(${param}.${pri})
        if (code === 200) tools.message('删除成功')
        this.queryTableData()
      } catch (e) {
        if (e == 'cancel') return tools.message('已取消删除', { type: 'info' })
        console.error('删除失败', e)
      }
    },`
}
function getTableDeleteBatchMethod(method){
  const { name, param,pri, ServiceName,InterfaceName } = method
  return `${getTab(2)}async ${name}() {
      const rows = this.multipleSelection
      if (Array.isArray(rows) && !rows.length) {
        return tools.message('请勾选要删除的文档信息！', { type: 'warning' })
      }
      try {
        await tools.confirm('请确认是否删除？')
        const { code } = await ${ServiceName}.${InterfaceName}(rows.map((row) =>row.${pri}))
        if (code === 200) tools.message('删除成功')
        this.queryTableData()
      } catch (e) {
        if (e == 'cancel') return tools.message('已取消删除', { type: 'info' })
        console.error('删除失败', e)
      }
    },`
}

function getExtMehodStruct(method){
  const { name, ServiceName,InterfaceName,param } = method
  return `${getTab(2)}async ${name}(${param}) {
      await ${ServiceName}.${InterfaceName}(${param})
      tools.message('操作成功')
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
  return `${getTab(2)}onReset() {
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
  return `${getTab(2)}${name}(${param}) {
      this.$emit('${name}'${param?','+param:''})
    },`
}
function getPlaceholderMethod(method){
  const { name, param } = method
  return `${getTab(2)}${name}(${param}) {
      // TODO:implement ${name}
    },`
}

function getRefreshPagination(method){
  return `${getTab(2)}refreshPagination() {
      this.pageInfo = {
        rows: 20,
        page: 1,
      }
    },`
}
function getEntryOnReset(method){
  return `${getTab(2)}onReset() {
      Object.keys(this.queryForm).forEach((key) => {
        this.queryForm[key] = ''
      })
      this.refreshPagination()
    },`
}
function getOpenDialog(method){
  const {name,dialogRef,param}= method
  return `${getTab(2)}${name}(${param}) {
      this.$refs.${dialogRef}.show(${param})
    },`
}
function getOnSelectionChanget(method){
  return `${getTab(2)}onSelectionChange(val) {
      this.multipleSelection = val
    },`
}
function getQueryTableData(method){
  const { ServiceName,InterfaceName,hasQuery } = method
  return `${getTab(2)}async queryTableData() {
      let queryCondition = QueryConditionBuilder.getInstance(this.pageInfo.page, this.pageInfo.rows)
      ${hasQuery?`Object.keys(this.queryForm).forEach((key) => {
        if (this.queryForm[key] || this.queryForm[key] == 0) {
          queryCondition.buildLikeQuery(key, this.queryForm[key])
        }
      })`:''}
      const { data, count } = await ${ServiceName}.${InterfaceName}(queryCondition)
      this.tableData = data
      this.total = count
    },`
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
    'editGetData':(method)=>getEditGetData(method),
    'emptyEditGetData':(method)=>getEmptyEditGetData(method),
    'editDialogShow':(method)=>getEditDialogShowMethod(method),
    'createDialogShow':(method)=>getCreateDialogShowMethod(method),
    'dialogSubmit':(method)=>getDialogSubmitMethod(method),
    'setHeight':(method)=>getSetHeightMethod(method),
    'pageInfoChange':(method)=>getPageInfoMethod(method),
    'refreshPagination':(method)=>getRefreshPagination(method),
    'entryOnReset':(method)=>getEntryOnReset(method),
    'selectionChange':(method)=>getOnSelectionChanget(method),
    'openDialog':(method)=>getOpenDialog(method),
    'queryTableData':(method)=>getQueryTableData(method),
    'tableDeleteMethod':(method)=>getTableDeleteMethod(method),
    'tableDeleteBatchMethod':(method)=>getTableDeleteBatchMethod(method),
    'extMehodStruct':(method)=>getExtMehodStruct(method)
  }
}


module.exports= {
  callMethod
}