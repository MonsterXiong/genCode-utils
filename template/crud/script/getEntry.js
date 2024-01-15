const { getFileInfo } = require("../../../src/common")
const { templateDataMap } = require('../view/templateData')
function getEntry(fileParam, sourceData) {
  const { template } = fileParam
  const type = 'index'
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
  getEntry
}