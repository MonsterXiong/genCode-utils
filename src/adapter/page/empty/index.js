const {  pascalCase } = require('../../../utils/commonUtil');
const { PAGE_TYPE_ENUM } = require('../../../enum/pageType');
const { getInitParam,outputPageInfo } = require('../../../utils/genUtil');
const { getEntry } = require('./getEntry');

function getParam(menuInfo){
    const { code } = menuInfo
    const pageName = pascalCase(code)
    return {
        ...menuInfo,
        pageName,
    }

}



async function getEmptyAdapterData(menuInfo){
    const { fileParam } = getInitParam(menuInfo,PAGE_TYPE_ENUM.EMPTY)
    const param = getParam(menuInfo)
    // 输出提示语
    outputPageInfo(menuInfo)
    const pages = [await getEntry(fileParam, param)]
    return {
        services: [],
        pages: pages.filter(item => !!item)
    }
}


module.exports = {
    getEmptyAdapterData
}