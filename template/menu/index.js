const { getEjsTemplate } = require("../../src/common");
const path = require('path')
function getMenuAdapterData(menuData) {
    const temp = getEjsTemplate(path.resolve(__dirname, './menu.ejs'));
    const result =[{
        // 'src/layout/sideBar/menuData.js',
        filePath:'./baseMenuData.js',
        content:temp(menuData)
    }]
    return result
}

module.exports = {
    getMenuAdapterData
}
