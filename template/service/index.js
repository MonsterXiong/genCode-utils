const path = require('path')
const changeCase = require('change-case')
const { getEjsTemplate } = require("../../src/common")
const { uniqueArray } = require("../../src/utils/array")

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
    const { label, url, interfaceName, prikeyInfo } = serviceFunc
    const tempData = {
        functionType: label,
        functionUrl: url,
        functionName: interfaceName,
        prikey: prikeyInfo?.field
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
        const filename = `${changeCase.camelCase(service)}Service.js`
        const className = changeCase.pascalCase(service)
        let content = serviceList[service].reduce((pre, cur) => pre += serviceTemp(transfromInterfaceData(cur)), "")
        res.push({
            filePath: `./base/${filename}`,
            content: getServiceContent(className, content)
        })
        return res
    }, [])
}
function getServiceAdapterData(serviceData) {
    const serviceList = formatService(serviceData)
    const serviceTemp = getEjsTemplate(path.resolve(__dirname, './service.ejs'));
    const serviceResult = getServiceResult(serviceList, serviceTemp)
    return serviceResult
}

module.exports = {
    getServiceAdapterData
}