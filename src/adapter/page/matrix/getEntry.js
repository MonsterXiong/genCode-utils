const { TEMPLATE_PATH } = require("../../../config/templateMap")
const { getFileInfo, initScript, getEjsFileTemplateData } = require("../../../common")
const { COMPONENT_MATRIX_ENUM } = require("../../../enum")

async function getEntry(fileParam, sourceData){
    const { template } = fileParam
    const type = COMPONENT_MATRIX_ENUM.ENTRY
    const fileInfo = getFileInfo({ ...fileParam, type })
    //  --------------------
    const script = initScript(fileInfo.filename)
    const templatePath = TEMPLATE_PATH[template][type]
    console.log(templatePath,'templatePath',fileInfo,script);
    const templateData = await getEjsFileTemplateData(templatePath, sourceData)
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