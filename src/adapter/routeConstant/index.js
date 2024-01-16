const { getEjsTemplate } = require("../../common");
const { FRAMEWORK_CONFIG } = require("../../config/frameworkConfig");
const { TEMPLATE_PATH, ELEMENT_ENUM } = require("../../config/templateMap");
function getRouteConstantAdapterData(routesConstantData) {
    const temp = getEjsTemplate(TEMPLATE_PATH[ELEMENT_ENUM.ROUTE_CONSTANT]);
    const result =[{
        filePath:FRAMEWORK_CONFIG.ROUTE_CONSTANT_OUTPUT_PATH,
        content:temp(routesConstantData)
    }]
    return result
}

module.exports = {
    getRouteConstantAdapterData
}
