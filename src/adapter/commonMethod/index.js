const { VUE_DATA_SCRIPT_ENUM } = require("../../enum")

function checkAndInitScriptProp(script,prop){
    if(!script[prop]?.length){
        script[prop] = []
    }
}

// 公共方法
function initMultipleSelection(script){
    checkAndInitScriptProp(script,VUE_DATA_SCRIPT_ENUM.DATA_LIST)
    checkAndInitScriptProp(script,VUE_DATA_SCRIPT_ENUM.METHOD_LIST)
    script[VUE_DATA_SCRIPT_ENUM.DATA_LIST].push({ name: 'multipleSelection', type: 'array', initValue: '[]', })
    script[VUE_DATA_SCRIPT_ENUM.METHOD_LIST].push({ type: 'selectionChange' })
}

function addImportService(script,ServiceName){
    checkAndInitScriptProp(script,VUE_DATA_SCRIPT_ENUM.IMPORT_LIST)
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, content: ServiceName, from: '@/services' })
}

// 公共内容
function addCommonTools(script){
    checkAndInitScriptProp(script,VUE_DATA_SCRIPT_ENUM.IMPORT_LIST)
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({isDefault: true,from: '@/utils/tools',content: 'tools'})
}

function addCommonQueryConditionBuilder(script){
    checkAndInitScriptProp(script,VUE_DATA_SCRIPT_ENUM.IMPORT_LIST)
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: false, from: '@/utils/queryConditionBuilder', content: 'QueryConditionBuilder' })
}

function addImportComponent(script,content,from){
    checkAndInitScriptProp(script,VUE_DATA_SCRIPT_ENUM.IMPORT_LIST)
    script[VUE_DATA_SCRIPT_ENUM.IMPORT_LIST].push({ isDefault: true, content, from })
}

function addCompComponent(script,componenName){
    checkAndInitScriptProp(script,VUE_DATA_SCRIPT_ENUM.COMPONENT_LIST)
    script[VUE_DATA_SCRIPT_ENUM.COMPONENT_LIST].push(componenName)
}

function addComponent(script, componenName) {
    addCompComponent(script, componenName)
    addImportComponent(script, componenName, `./components/${componenName}.vue`)
}


module.exports = {
    initMultipleSelection,
    addImportService,
    addImportComponent,
    addComponent,
    addCommonTools,
    addCommonQueryConditionBuilder,
    addCompComponent
}