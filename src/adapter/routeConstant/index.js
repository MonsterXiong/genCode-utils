const { getEjsTemplate } = require("../../common");
const path = require('path')
function getRouteConstantAdapterData(routesConstantData) {
    // const temp = getEjsTemplate(path.resolve(__dirname, './routeConstant.ejs'));
    const temp = getEjsTemplate('E://temp//genCode-utils//public//template//v3//routeConstant//routeConstant.ejs');
    const result =[{
        // 'src/router/base/baseRoutesConstant.js'
        filePath:'./baseRoutesConstant.js',
        content:temp(routesConstantData)
    }]
    return result
}

module.exports = {
    getRouteConstantAdapterData
}
