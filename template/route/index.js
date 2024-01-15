const { getEjsTemplate } = require("../../src/common");
const path = require('path')
function getRouteAdapterData(routeData) {
    const temp = getEjsTemplate(path.resolve(__dirname, './route.ejs'));
    const result =[{
        // 'src/router/base/baseRoutes.js'
        filePath:'./baseRoutes.js',
        content:temp(routeData)
    }]
    return result
}

module.exports = {
    getRouteAdapterData
}