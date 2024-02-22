const path = require('path');
const { PAGE_TEMPLATE_PATH_MAP } = require("./pageTemplatePathMap");
const { TEMPLATE_ELEMENT_ENUM } = require('../enum/templateElement');

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
    ...PAGE_TEMPLATE_PATH_MAP,
    [TEMPLATE_ELEMENT_ENUM.PROJECT]:{
        [PROJETC_CONFIG_ENUM.ENV]:getPath('public/template/v3/project/env.ejs'),
        [PROJETC_CONFIG_ENUM.ENV_DEV]:getPath('public/template/v3/project/env.dev.ejs'),
        [PROJETC_CONFIG_ENUM.ENV_PROD]:getPath('public/template/v3/project/env.prod.ejs'),
        [PROJETC_CONFIG_ENUM.PACKAGE_JSON]:getPath('public/template/v3/project/packageJson.ejs'),
    },
    [TEMPLATE_ELEMENT_ENUM.MENU]:getPath('public/template/v3/menu/menu.ejs'),
    [TEMPLATE_ELEMENT_ENUM.ROUTE]:getPath('public/template/v3/route/route.ejs'),
    [TEMPLATE_ELEMENT_ENUM.ROUTE_CONSTANT]:getPath('public/template/v3/routeConstant/routeConstant.ejs'),
    [TEMPLATE_ELEMENT_ENUM.SERVICE]:getPath('public/template/v3/service/service.ejs'),
    /* Software Gen Code Placeholder */
}


module.exports ={
    TEMPLATE_PATH,
    PROJETC_CONFIG_ENUM
}