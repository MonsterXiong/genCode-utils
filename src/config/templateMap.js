const { COMPONENT_CRUD_ENUM } = require("../enum/componentType");
const { PAGE_TYPE_ENUM } = require("../enum/pageType");
const { isDev } = require("./isDev");
const path = require('path')

const ELEMENT_ENUM = {
    SERVICE:'service',
    MENU:'menuData',
    ROUTE:'route',
    ROUTE_CONSTANT:'routeConstant'
}

function getPath(filepath){
    return path.join(process.cwd(),filepath)
}

const TEMPLATE_PATH={
    [PAGE_TYPE_ENUM.CRUD]:{
        [COMPONENT_CRUD_ENUM.QUERY]:isDev?getPath('public/template/v3/crud/query.ejs'):'E://temp//genCode-utils//public//template//v3//crud//query.ejs',
        [COMPONENT_CRUD_ENUM.TABLE]:isDev?getPath('public/template/v3/crud/table.ejs'):'E://temp//genCode-utils//public//template//v3//crud//table.ejs',
        [COMPONENT_CRUD_ENUM.DIALOG]:isDev?getPath('public/template/v3/crud/dialog.ejs'):'E://temp//genCode-utils//public//template//v3//crud//dialog.ejs',
        [COMPONENT_CRUD_ENUM.ENTRY]:isDev?getPath('public/template/v3/crud/entry.ejs'):"E://temp//genCode-utils//public//template//v3//crud//entry.ejs",
    },
    [ELEMENT_ENUM.MENU]:isDev?getPath('public/template/v3/menu/menu.ejs'):"E://temp//genCode-utils//public//template//v3//menu//menu.ejs",
    [ELEMENT_ENUM.ROUTE]:isDev?getPath('public/template/v3/route/route.ejs'):"E://temp//genCode-utils//public//template//v3//route//route.ejs",
    [ELEMENT_ENUM.ROUTE_CONSTANT]:isDev?getPath('public/template/v3/routeConstant/routeConstant.ejs'):"E://temp//genCode-utils//public//template//v3//routeConstant//routeConstant.ejs",
    [ELEMENT_ENUM.SERVICE]:isDev?getPath('public/template/v3/service/service.ejs'):"E://temp//genCode-utils//public//template//v3//service//service.ejs",

}


module.exports ={
    TEMPLATE_PATH,
    ELEMENT_ENUM,
}