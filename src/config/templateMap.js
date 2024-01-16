const { COMPONENT_CRUD_ENUM } = require("../enum/componentType");
const { PAGE_TYPE_ENUM } = require("../enum/pageType");

const TEMPLATE_PATH={
    [PAGE_TYPE_ENUM.CRUD]:{
        [COMPONENT_CRUD_ENUM.QUERY]:"",
        [COMPONENT_CRUD_ENUM.TABLE]:"",
        [COMPONENT_CRUD_ENUM.DIALOG]:"",
        [COMPONENT_CRUD_ENUM.ENTRY]:"",
    }
}


module.exports ={
    TEMPLATE_PATH
}