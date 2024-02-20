const { addImportService, addCommonTools, addComponent } = require(".")
const { VUE_DATA_SCRIPT_ENUM, CRUD_LABEL_ENUM } = require("../../enum")
const { uniqueArray } = require("../../utils/array")
const { getInterfaceData,getPrikeyInfoByList } = require("./util")
function uniqueImport(script) {
    return uniqueArray(script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST], 'content')
}
function handleImportService(script, serviceList) {
    const importService = serviceList.map(item => item.content).join(', ')
    serviceList.length && addImportService(script, importService)
}
// TODO：最后统一处理importList
function handleImportList(script) {
    // 先根据content去重
    const importList = uniqueImport(script)
    // 针对service类进行特殊处理=>还有common包也会进行特殊处理，根据form进行分类，最后再进行汇总
    const serviceList = importList.filter(item => item.from == '@/services')
    const otherList = importList.filter(item => item.from != '@/services')
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST] = otherList
    handleImportService(script, serviceList)
}

function addDeleteOrDeleteBatch(script, deleteInfo, type = CRUD_LABEL_ENUM.DELETE) {
    const { ServiceName, InterfaceName } = getInterfaceData(deleteInfo)
    const { elementList, code } = deleteInfo
    const pri = getPrikeyInfoByList(elementList)?.code || ''
    const isDelete = type === CRUD_LABEL_ENUM.DELETE
    const methodType = isDelete ? 'tableDeleteMethod' : 'tableDeleteBatchMethod'
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: methodType, name: code, ServiceName, InterfaceName, pri, param: isDelete ? 'row' : '' })
    addCommonTools(script)
}


function addCreateOrUpdateDialog(script,pageName,dialogInfo,type=CRUD_LABEL_ENUM.INSERT){
    const isAdd = type === CRUD_LABEL_ENUM.INSERT
    const componentName = `${pageName}${isAdd?'AddDialog':'UpdateDialog'}`
    const dialogRef = isAdd?'addDialogRef':'updateDialogRef'
    addComponent(script,componentName)
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'openDialog', name: dialogInfo.code, dialogRef, param: isAdd?'':'row' })
}


module.exports = {
    uniqueImport,
    handleImportService,
    handleImportList,
    addDeleteOrDeleteBatch,
    addCreateOrUpdateDialog
}