const { getEjsTemplate } = require('../../common');
const { TEMPLATE_PATH, PROJETC_CONFIG_ENUM, PROJECT_CONSTANT } = require('../../config/templateMap');
function getProjectAdapterData(projectInfo) {
  const projectConfigPath = TEMPLATE_PATH[PROJECT_CONSTANT]
  const envTemp = getEjsTemplate(projectConfigPath[PROJETC_CONFIG_ENUM.ENV]);
  const envDevTemp = getEjsTemplate(projectConfigPath[PROJETC_CONFIG_ENUM.ENV_DEV]);
  const envProdTemp = getEjsTemplate(projectConfigPath[PROJETC_CONFIG_ENUM.ENV_PROD]);
  const packageJsonTemp = getEjsTemplate(projectConfigPath[PROJETC_CONFIG_ENUM.PACKAGE_JSON]);
  const result = [{
    filePath: '.env',
    content: envTemp(projectInfo)
  }, {
    filePath: '.env.dev',
    content: envDevTemp(projectInfo)
  }, {
    filePath: '.env.prod',
    content: envProdTemp(projectInfo)
  }, {
    filePath: 'package.json',
    content: packageJsonTemp(projectInfo)
  }]
  return result
}

module.exports = {
  getProjectAdapterData
}
