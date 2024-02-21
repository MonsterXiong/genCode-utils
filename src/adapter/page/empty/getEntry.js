const { TEMPLATE_PATH } = require("../../../config/templateMap")
const { getFileInfo, getEjsFileTemplateData } = require("../../../common")
const { COMPONENT_EMPTY_ENUM } = require("../../../enum")

async function getEntry(fileParam, sourceData){
    const { template } = fileParam
    const type = COMPONENT_EMPTY_ENUM.ENTRY
    const fileInfo = getFileInfo({ ...fileParam, type })
    const templatePath = TEMPLATE_PATH[template][type]
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