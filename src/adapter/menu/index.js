const { getEjsTemplate } = require('../../common');
const { FRAMEWORK_CONFIG } = require('../../config/frameworkConfig');
const { TEMPLATE_PATH, ELEMENT_ENUM } = require('../../config/templateMap');
function getMenuAdapterData(menuData) {
    const temp = getEjsTemplate(TEMPLATE_PATH[ELEMENT_ENUM.MENU]);
    const result =[{
        filePath:FRAMEWORK_CONFIG.MENU_DATA_OUTPUT_PATH,
        content:temp(menuData)
    }]
    return result
}

module.exports = {
    getMenuAdapterData
}
