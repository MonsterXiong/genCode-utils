const { getFileInfo } = require("../../../src/common")
const { templateDataMap } = require('../view/templateData')
function getTable(fileParam, sourceData) {
  const { template } = fileParam
  const type = 'table'
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
  getTable
}