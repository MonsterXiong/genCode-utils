const { camelCase, pascalCase } = require('../../../utils/commonUtil');
const { PAGE_TYPE_ENUM } = require('../../../enum');
const { getInitParam } = require('../../../utils/genUtil');

function getParam(menuInfo){}
function testPage(menuInfo,param){}

async function getMatrixAdapterData(menuInfo){
    const { fileParam } = getInitParam(menuInfo,PAGE_TYPE_ENUM.MATRIX)
    const param = getParam(menuInfo)
    // 输出提示语
    testPage(menuInfo,param)
    
    const pages = []
    return {
        // services: getFormatRequestList(pageInfo),
        pages: pages.filter(item => !!item)   
    }
}


module.exports = {
    getMatrixAdapterData
}