const { getEjsTemplate } = require("../../common");
const { TEMPLATE_PATH, ELEMENT_ENUM } = require("../../config/templateMap");
const { FRAMEWORK_CONFIG } = require("../../config/frameworkConfig");
function getRouteAdapterData(routeData) {
    const temp = getEjsTemplate(TEMPLATE_PATH[ELEMENT_ENUM.ROUTE]);
    const result =[{
        filePath:FRAMEWORK_CONFIG.ROUTE_OUTPUT_PATH,
        content:temp(routeData)
    }]
    return result
}

module.exports = {
    getRouteAdapterData
}