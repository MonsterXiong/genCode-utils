const { COMPONENT_CRUD_ENUM } = require("../enum/componentType");
const { PAGE_TYPE_ENUM } = require("../enum/pageType");

const TEMPLATE_PATH={
    [PAGE_TYPE_ENUM.CRUD]:{
        [COMPONENT_CRUD_ENUM.QUERY]:'E://temp//genCode-utils//public//template//v3//crud//query.ejs',
        [COMPONENT_CRUD_ENUM.TABLE]:'E://temp//genCode-utils//public//template//v3//crud//table.ejs',
        [COMPONENT_CRUD_ENUM.DIALOG]:'E://temp//genCode-utils//public//template//v3//crud//dialog.ejs',
        [COMPONENT_CRUD_ENUM.ENTRY]:"E://temp//genCode-utils//public//template//v3//crud//entry.ejs",
    }
}


module.exports ={
    TEMPLATE_PATH
}