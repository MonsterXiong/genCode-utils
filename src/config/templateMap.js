const path = require('path');
const { PAGE_TEMPLATE_PATH_MAP } = require("./pageTemplatePathMap");
const { TEMPLATE_ELEMENT_ENUM } = require('../enum/templateElement');
const { getPath } = require('../common');

const PROJETC_CONFIG_ENUM = {
    ENV:'env',
    ENV_DEV:'envDev',
    ENV_PROD:'envProd',
    PACKAGE_JSON:'packageJson',
}

const TOOL_CONFIG_ENUM ={
    ADAPTER_INDEX:'adapterIndex',
    GET_ENTRY:'getEntry'
}

const TEMPLATE_PATH={
    ...PAGE_TEMPLATE_PATH_MAP,
    [TEMPLATE_ELEMENT_ENUM.PROJECT]:{
        [PROJETC_CONFIG_ENUM.ENV]:getPath('public/template/v3/project/env.ejs'),
        [PROJETC_CONFIG_ENUM.ENV_DEV]:getPath('public/template/v3/project/env.dev.ejs'),
        [PROJETC_CONFIG_ENUM.ENV_PROD]:getPath('public/template/v3/project/env.prod.ejs'),
        [PROJETC_CONFIG_ENUM.PACKAGE_JSON]:getPath('public/template/v3/project/packageJson.ejs'),
    },
    [TEMPLATE_ELEMENT_ENUM.TOOL]:{
        [TOOL_CONFIG_ENUM.ADAPTER_INDEX]:getPath('public/template/v3/tool/adapterIndex.ejs'),
        [TOOL_CONFIG_ENUM.GET_ENTRY]:getPath('public/template/v3/tool/getEntry.ejs'),
    },
    [TEMPLATE_ELEMENT_ENUM.MENU]:getPath('public/template/v3/menu/menu.ejs'),
    [TEMPLATE_ELEMENT_ENUM.ROUTE]:getPath('public/template/v3/route/route.ejs'),
    [TEMPLATE_ELEMENT_ENUM.ROUTE_CONSTANT]:getPath('public/template/v3/routeConstant/routeConstant.ejs'),
    [TEMPLATE_ELEMENT_ENUM.SERVICE]:getPath('public/template/v3/service/service.ejs'),
    /* Software Gen Code Placeholder */
}


module.exports ={
    TEMPLATE_PATH,
    PROJETC_CONFIG_ENUM,
    TOOL_CONFIG_ENUM
}