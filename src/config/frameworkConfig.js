const { isDev } = require("./isDev")

const FRAMEWORK_CONFIG = {

    ROUTE_COMPONENT_PREFIX:'@/pages',

    PAGE_DIR_PATH:'src/pages',

    SERVICE_OUTPUT_DIR_PATH:'src/services/module/base',

    MENU_DATA_OUTPUT_PATH:'src/layout/sideBar/menuData.js',

    ROUTE_OUTPUT_PATH:'src/router/base/baseRoutes.js',

    ROUTE_CONSTANT_OUTPUT_PATH:'src/router/base/baseRoutesConstant.js',

    CODE_OUTPUT_ROOT_PATH:isDev?'./submodule/txsj-fe-template':'./temp'
}


module.exports = {
    FRAMEWORK_CONFIG
}