const { COMPONENT_CRUD_ENUM } = require("../enum/componentType");
const { PAGE_TYPE_ENUM } = require("../enum/pageType");
const { isDev } = require("./isDev");
const path = require('path')

const ELEMENT_ENUM = {
    SERVICE:'service',
    MENU:'menuData',
    ROUTE:'route',
    ROUTE_CONSTANT:'routeConstant',
}

const PROJECT_CONSTANT = 'project_constant'

const PROJETC_CONFIG_ENUM = {
    ENV:'env',
    ENV_DEV:'envDev',
    ENV_PROD:'envProd',
    PACKAGE_JSON:'packageJson',
}

function getPath(filepath){
    return path.join(process.cwd(),filepath)
}

const TEMPLATE_PATH={
    [PAGE_TYPE_ENUM.CRUD]:{
        [COMPONENT_CRUD_ENUM.QUERY]:!isDev?getPath('public/template/v3/crud/query.ejs'):'E://temp//genCode-utils//public//template//v3//crud//query.ejs',
        [COMPONENT_CRUD_ENUM.TABLE]:!isDev?getPath('public/template/v3/crud/table.ejs'):'E://temp//genCode-utils//public//template//v3//crud//table.ejs',
        [COMPONENT_CRUD_ENUM.DIALOG]:!isDev?getPath('public/template/v3/crud/dialog.ejs'):'E://temp//genCode-utils//public//template//v3//crud//dialog.ejs',
        [COMPONENT_CRUD_ENUM.ENTRY]:!isDev?getPath('public/template/v3/crud/entry.ejs'):"E://temp//genCode-utils//public//template//v3//crud//entry.ejs",
    },
    [ELEMENT_ENUM.MENU]:!isDev?getPath('public/template/v3/menu/menu.ejs'):"E://temp//genCode-utils//public//template//v3//menu//menu.ejs",
    [ELEMENT_ENUM.ROUTE]:!isDev?getPath('public/template/v3/route/route.ejs'):"E://temp//genCode-utils//public//template//v3//route//route.ejs",
    [ELEMENT_ENUM.ROUTE_CONSTANT]:!isDev?getPath('public/template/v3/routeConstant/routeConstant.ejs'):"E://temp//genCode-utils//public//template//v3//routeConstant//routeConstant.ejs",
    [ELEMENT_ENUM.SERVICE]:!isDev?getPath('public/template/v3/service/service.ejs'):"E://temp//genCode-utils//public//template//v3//service//service.ejs",
    [PROJECT_CONSTANT]:{
        [PROJETC_CONFIG_ENUM.ENV]:!isDev?getPath('public/template/v3/project/env.ejs'):'E://temp//genCode-utils//public//template//v3//project//env.ejs',
        [PROJETC_CONFIG_ENUM.ENV_DEV]:!isDev?getPath('public/template/v3/project/env.dev.ejs'):'E://temp//genCode-utils//public//template//v3//project//env.dev.ejs',
        [PROJETC_CONFIG_ENUM.ENV_PROD]:!isDev?getPath('public/template/v3/project/env.prod.ejs'):'E://temp//genCode-utils//public//template//v3//project//env.prod.ejs',
        [PROJETC_CONFIG_ENUM.PACKAGE_JSON]:!isDev?getPath('public/template/v3/project/packageJson.ejs'):'E://temp//genCode-utils//public//template//v3//project//packageJson.ejs',
    }

}


module.exports ={
    TEMPLATE_PATH,
    ELEMENT_ENUM,
    PROJECT_CONSTANT,
    PROJETC_CONFIG_ENUM
}