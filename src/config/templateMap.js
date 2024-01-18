const { COMPONENT_CRUD_ENUM } = require("../enum/componentType");
const { PAGE_TYPE_ENUM } = require("../enum/pageType");
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
        [COMPONENT_CRUD_ENUM.QUERY]:getPath('public/template/v3/crud/query.ejs'),
        [COMPONENT_CRUD_ENUM.TABLE]:getPath('public/template/v3/crud/table.ejs'),
        [COMPONENT_CRUD_ENUM.DIALOG]:getPath('public/template/v3/crud/dialog.ejs'),
        [COMPONENT_CRUD_ENUM.ENTRY]:getPath('public/template/v3/crud/entry.ejs'),
    },
    [ELEMENT_ENUM.MENU]:getPath('public/template/v3/menu/menu.ejs'),
    [ELEMENT_ENUM.ROUTE]:getPath('public/template/v3/route/route.ejs'),
    [ELEMENT_ENUM.ROUTE_CONSTANT]:getPath('public/template/v3/routeConstant/routeConstant.ejs'),
    [ELEMENT_ENUM.SERVICE]:getPath('public/template/v3/service/service.ejs'),
    [PROJECT_CONSTANT]:{
        [PROJETC_CONFIG_ENUM.ENV]:getPath('public/template/v3/project/env.ejs'),
        [PROJETC_CONFIG_ENUM.ENV_DEV]:getPath('public/template/v3/project/env.dev.ejs'),
        [PROJETC_CONFIG_ENUM.ENV_PROD]:getPath('public/template/v3/project/env.prod.ejs'),
        [PROJETC_CONFIG_ENUM.PACKAGE_JSON]:getPath('public/template/v3/project/packageJson.ejs'),
    }

}


module.exports ={
    TEMPLATE_PATH,
    ELEMENT_ENUM,
    PROJECT_CONSTANT,
    PROJETC_CONFIG_ENUM
}