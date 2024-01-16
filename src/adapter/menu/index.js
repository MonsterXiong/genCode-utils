const path = require('path');
const { getEjsTemplate } = require('../../common');
function getMenuAdapterData(menuData) {
    // const temp = getEjsTemplate(path.resolve(__dirname, './menu.ejs'));
    const temp = getEjsTemplate('E://temp//genCode-utils//public//template//v3//menu//menu.ejs');
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
