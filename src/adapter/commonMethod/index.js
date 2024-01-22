//  importList

const { VUE_DATA_SCRIPT_ENUM } = require("../../enum")





// 批量删除


// 


// 公共方法
function multipleSelection(script){
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'multipleSelection', type: 'array', initValue: '[]', })
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'selectionChange' })
}

function addImportService(script,ServiceName){
    if(!script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST]?.length){
        script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST] = []
    }
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: ServiceName, from: '@/services' })
}


// 添加删除接口
function addDeleteInterface(script,deleteInfo){
    const { ServiceName, InterfaceName }=getInterfaceData(deleteInfo)
    // TODO:查找prikey
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'tableDeleteBatchMethod', name: deleteInfo.code, ServiceName, InterfaceName,pri:tablePrikey, param: '' })
    addCommonTools(script)
}


// 公共内容
function addCommonTools(script){
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({isDefault: true,from: '@/utils/tools',content: 'tools'})
}

function addCommonQueryConditionBuilder(script){
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
}

function addImportComponent(script,content,from){
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: true, content, from })
}

function addCompComponent(script,componenName){
    if(!script[VUE_DATA_SCRIPT_ENUM.COMPONENT_LIST]?.length){
        script[VUE_DATA_SCRIPT_ENUM.COMPONENT_LIST] = []
    }
    script[VUE_DATA_SCRIPT_ENUM.COMPONENT_LIST].push(componenName)
}


module.exports = {
    multipleSelection,
    addImportService,
    addImportComponent,
    addDeleteInterface,
    addCommonTools,
    addCommonQueryConditionBuilder,
    addCompComponent
}