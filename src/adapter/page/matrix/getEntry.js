const { TEMPLATE_PATH } = require("../../../config/templateMap")
const { getFileInfo, initScript, getEjsFileTemplateData } = require("../../../common")
const { COMPONENT_MATRIX_ENUM } = require("../../../enum")
const { getInterfaceData } = require("../../commonMethod/util")

function parseTemplateParam(param){
    const { colInfo,rowInfo,relInfo,saveInfo,pageName } = param
    return {
        pageName:pageName+'MatrixTable',
        ServiceName:getInterfaceData(colInfo).ServiceName,
        colInfo:getInterfaceData(colInfo),
        rowInfo:getInterfaceData(rowInfo),
        relInfo: getInterfaceData(relInfo),
        saveInfo
        // saveInfo:getInterfaceData(saveInfo),
    }
}

async function getEntry(fileParam, sourceData){
    const { template } = fileParam
    const type = COMPONENT_MATRIX_ENUM.ENTRY
    const fileInfo = getFileInfo({ ...fileParam, type })
    //  --------------------
    const script = initScript(fileInfo.filename)
    const templatePath = TEMPLATE_PATH[template][type]
    const templateParam = parseTemplateParam(sourceData)
    const templateData = await getEjsFileTemplateData(templatePath, templateParam)
    return {
        ...fileInfo,
        params: {
          template: templateData
        }
    }
}

module.exports = {
    getEntry
}