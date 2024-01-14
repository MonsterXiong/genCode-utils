const { getFileInfo } = require("../../../src/common")
const { templateDataMap } = require('../view/templateData')
function getDialog(fileParam, sourceData) {
  const { template } = fileParam
  const type = 'dialog'
  const fileInfo = getFileInfo({ ...fileParam, type })
  return {
    ...fileInfo,
    params: {
      template: templateDataMap[template][type],
      script: {}
    }
  }
}
module.exports = {
  getDialog
}