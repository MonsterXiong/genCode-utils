const path = require('path')
const { getEjsTemplate } = require("../../common")
const { uniqueArray } = require("../../utils/array")
const { camelCase, pascalCase } = require('../../utils/commonUtil')
const { TEMPLATE_PATH, ELEMENT_ENUM } = require('../../config/templateMap')
const { FRAMEWORK_CONFIG } = require('../../config/frameworkConfig')

// 根据label进行去重
function formatService(serviceData) {
    const serviceList = Object.keys(serviceData).reduce((res, serviceName) => {
        res[serviceName] = uniqueArray(serviceData[serviceName], 'label')
        return res
    }, {})
    return serviceList
}

// 转换为接口有模板需要的数据格式
function transfromInterfaceData(serviceFunc) {
    const { label, request, interfaceName, prikeyInfo } = serviceFunc
    const tempData = {
        functionType: label,
        functionUrl: request,
        functionName: interfaceName,
        prikey: prikeyInfo?.code
    }
    return tempData
}

function getServiceContent(className, serviceConten) {
    let content = `import { service } from '@/services/http/index.js'\n\n`
    content += `export default class ${className}Service {\n`
    content += serviceConten
    content += `}`
    return content
}
function getServiceResult(serviceList, serviceTemp) {
    return Object.keys(serviceList).reduce((res, service) => {
        const filename = `${camelCase(service)}Service.js`
        const className = pascalCase(service)
        let content = serviceList[service].reduce((pre, cur) => pre += serviceTemp(transfromInterfaceData(cur)), "")
        res.push({
            filePath: `${FRAMEWORK_CONFIG.SERVICE_OUTPUT_DIR_PATH}/${filename}`,
            content: getServiceContent(className, content)
        })
        return res
    }, [])
}
function getServiceAdapterData(serviceData) {
    const serviceList = formatService(serviceData)
    const serviceTemp = getEjsTemplate(TEMPLATE_PATH[ELEMENT_ENUM.SERVICE]);
    const serviceResult = getServiceResult(serviceList, serviceTemp)
    return serviceResult
}

module.exports = {
    getServiceAdapterData
}