const {
    COMPONENT_CRUD_ENUM,
    COMPONENT_MATRIX_ENUM,
    /* Software Gen Code Require Placeholder */
} = require("../enum/componentType");
const { PAGE_TYPE_ENUM } = require("../enum/pageType");
const path = require('path')
function getPath(filepath) {
    return path.join(process.cwd(), filepath)
}

const PAGE_TEMPLATE_PATH_MAP = {
    [PAGE_TYPE_ENUM.CRUD]: {
        [COMPONENT_CRUD_ENUM.QUERY]: getPath('public/template/v3/page/crud/query.ejs'),
        [COMPONENT_CRUD_ENUM.TABLE]: getPath('public/template/v3/page/crud/table.ejs'),
        [COMPONENT_CRUD_ENUM.DIALOG]: getPath('public/template/v3/page/crud/dialog.ejs'),
        [COMPONENT_CRUD_ENUM.ENTRY]: getPath('public/template/v3/page/crud/entry.ejs'),
    },
    [PAGE_TYPE_ENUM.MATRIX]: {
        [COMPONENT_MATRIX_ENUM.ENTRY]: getPath('public/template/v3/page/matrix/entry.ejs'),
    },
    /* Software Gen Code Placeholder */
}

module.exports = {
    PAGE_TEMPLATE_PATH_MAP
}