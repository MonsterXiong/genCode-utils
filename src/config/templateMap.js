const { COMPONENT_CRUD_ENUM } = require("../enum/componentType");
const { PAGE_TYPE_ENUM } = require("../enum/pageType");

const ELEMENT_ENUM = {
    SERVICE:'service',
    MENU:'menuData',
    ROUTE:'route',
    ROUTE_CONSTANT:'routeConstant'
}


const TEMPLATE_PATH={
    [PAGE_TYPE_ENUM.CRUD]:{
        [COMPONENT_CRUD_ENUM.QUERY]:'E://temp//genCode-utils//public//template//v3//crud//query.ejs',
        [COMPONENT_CRUD_ENUM.TABLE]:'E://temp//genCode-utils//public//template//v3//crud//table.ejs',
        [COMPONENT_CRUD_ENUM.DIALOG]:'E://temp//genCode-utils//public//template//v3//crud//dialog.ejs',
        [COMPONENT_CRUD_ENUM.ENTRY]:"E://temp//genCode-utils//public//template//v3//crud//entry.ejs",
    },
    [ELEMENT_ENUM.MENU]:"E://temp//genCode-utils//public//template//v3//menu//menu.ejs",
    [ELEMENT_ENUM.ROUTE]:"E://temp//genCode-utils//public//template//v3//route//route.ejs",
    [ELEMENT_ENUM.ROUTE_CONSTANT]:"E://temp//genCode-utils//public//template//v3//routeConstant//routeConstant.ejs",
    [ELEMENT_ENUM.SERVICE]:"E://temp//genCode-utils//public//template//v3//service//service.ejs",

}


module.exports ={
    TEMPLATE_PATH,
    ELEMENT_ENUM,
}