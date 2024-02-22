const { getEjsTemplate } = require("../../common");
const { TEMPLATE_PATH } = require("../../config/templateMap");
const { FRAMEWORK_CONFIG } = require("../../config/frameworkConfig");
const { TEMPLATE_ELEMENT_ENUM } = require("../../enum/templateElement");
function getRouteAdapterData(routeData) {
    const temp = getEjsTemplate(TEMPLATE_PATH[TEMPLATE_ELEMENT_ENUM.ROUTE]);
    const result =[{
        filePath:FRAMEWORK_CONFIG.ROUTE_OUTPUT_PATH,
        content:temp(routeData)
    }]
    return result
}

module.exports = {
    getRouteAdapterData
}