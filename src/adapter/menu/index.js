const { getEjsTemplate } = require('../../common');
const { FRAMEWORK_CONFIG } = require('../../config/frameworkConfig');
const { TEMPLATE_PATH} = require('../../config/templateMap');
const { TEMPLATE_ELEMENT_ENUM } = require('../../enum/templateElement');
function getMenuAdapterData(menuData) {
    const temp = getEjsTemplate(TEMPLATE_PATH[TEMPLATE_ELEMENT_ENUM.MENU]);
    const result =[{
        filePath:FRAMEWORK_CONFIG.MENU_DATA_OUTPUT_PATH,
        content:temp(menuData)
    }]
    return result
}

module.exports = {
    getMenuAdapterData
}
