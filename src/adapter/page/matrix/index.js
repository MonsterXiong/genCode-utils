const { camelCase, pascalCase } = require('../../../utils/commonUtil');
const { PAGE_TYPE_ENUM } = require('../../../enum/pageType');
const { getInitParam,outputPageInfo } = require('../../../utils/genUtil');
const { MATRIX_LABEL_ENUM } = require('../../../enum/label');
const { getInfoByLabel, getFormatRequestList } = require('../../../common');
const { getEntry } = require('./getEntry');


function getParam(menuInfo){
    const { code, pageInfo } = menuInfo
    const pageName = pascalCase(code)
    const { function:functionModel } = pageInfo
    const rowInfo = getInfoByLabel(functionModel, MATRIX_LABEL_ENUM.QUERY_ROW)
    const colInfo = getInfoByLabel(functionModel, MATRIX_LABEL_ENUM.QUERY_COL)
    const relInfo = getInfoByLabel(functionModel, MATRIX_LABEL_ENUM.QUERY_REL)
    const saveInfo = getInfoByLabel(functionModel, MATRIX_LABEL_ENUM.SAVE_REL)
    // 开始解析了哦
    return {
        pageName,
        rowInfo,
        colInfo,
        relInfo,
        saveInfo
    }

}
function testPage(menuInfo,param){}


function checkMustInfo(param){
    const { rowInfo, colInfo, relInfo, saveInfo} = param
    if(!rowInfo){
        throw new Error('缺少矩阵行信息')
    }
    if(!colInfo){
        throw new Error('缺少矩阵列信息')
    }
    if(!relInfo){
        throw new Error('缺少矩阵关联信息')
    }
    // if(!saveInfo){
    //     throw new Error('缺少矩阵保存信息')
    // }
    return true
}
async function getMatrixAdapterData(menuInfo){
    const { fileParam } = getInitParam(menuInfo,PAGE_TYPE_ENUM.MATRIX)
    const param = getParam(menuInfo)
    // 输出提示语
    outputPageInfo(menuInfo)
    testPage(menuInfo,param)
    const pages = []
    if(checkMustInfo(param)){
        pages.push(await getEntry(fileParam, param))
    }
    return {
        services: getFormatRequestList(menuInfo.pageInfo),
        pages: pages.filter(item => !!item)
    }
}


module.exports = {
    getMatrixAdapterData
}