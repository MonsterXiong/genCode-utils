const { isDev } = require("./isDev")

const FRAMEWORK_CONFIG = {

    // 路由页面的前缀地址
    ROUTE_COMPONENT_PREFIX:'@/pages',

    PAGE_DIR_PATH:isDev?'./pages':'src/pages',

    // service输出路径
    SERVICE_OUTPUT_DIR_PATH:isDev?'./base':'src/services/module/base',

    // 'src/layout/sideBar/menuData.js'
    MENU_DATA_OUTPUT_PATH:isDev?'./baseMenuData.js':'src/layout/sideBar/menuData.js',

    // 'src/router/base/baseRoutes.js'
    ROUTE_OUTPUT_PATH:isDev?'./baseRoutes.js':'src/router/base/baseRoutes.js',

    // 'src/router/base/baseRoutesConstant.js'
    ROUTE_CONSTANT_OUTPUT_PATH:isDev?'./baseRoutesConstant.js':'src/router/base/baseRoutesConstant.js',

    CODE_OUTPUT_ROOT_PATH:isDev?'./':'C://Users//Monster//Desktop//txsj-fe-template'
}


module.exports = {
    FRAMEWORK_CONFIG
}