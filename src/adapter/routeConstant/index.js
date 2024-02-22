const { getEjsTemplate } = require("../../common");
const { FRAMEWORK_CONFIG } = require("../../config/frameworkConfig");
const { TEMPLATE_PATH } = require("../../config/templateMap");
const { TEMPLATE_ELEMENT_ENUM } = require("../../enum/templateElement");
function getRouteConstantAdapterData(routesConstantData) {
    const temp = getEjsTemplate(TEMPLATE_PATH[TEMPLATE_ELEMENT_ENUM.ROUTE_CONSTANT]);
    const result =[{
        filePath:FRAMEWORK_CONFIG.ROUTE_CONSTANT_OUTPUT_PATH,
        content:temp(routesConstantData)
    }]
    return result
}

module.exports = {
    getRouteConstantAdapterData
}
