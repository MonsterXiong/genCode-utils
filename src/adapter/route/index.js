const { getEjsTemplate } = require("../../common");
const path = require('path')
function getRouteAdapterData(routeData) {
    // const temp = getEjsTemplate(path.resolve(__dirname, './route.ejs'));
    const temp = getEjsTemplate('E://temp//genCode-utils//public//template//v3//route//route.ejs');
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