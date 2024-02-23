
const qs = require('qs')
const { pascalCase, camelCase } = require('../../utils/commonUtil')
function parseUrlGetParam(url) {
  const queryParam = url.split('?')
  if(queryParam.length <=1){
      return {
        url
      }
  }else{
    return {
      url:queryParam[0],
      param:qs.parse(queryParam[1])
    }
  }
}
function parseUrl(url) {
    const {url:request} = parseUrlGetParam(url)
    const [, interfaceType, serviceType, _, interfaceName] = request.split('/')
    return {
      interfaceType,
      serviceType,
      interfaceName
    }
  }

function getInterfaceData(requestInfo, attr = 'url') {
    if (!requestInfo) {
        throw new Error('没有对应的请求信息')
    }
    const { serviceType, interfaceName } = parseUrl(requestInfo[attr])
    return {
        ServiceName: `${pascalCase(serviceType)}Service`,
        InterfaceName: `${camelCase(interfaceName)}`
    }
}

function getTab(number = 1) {
    return new Array(number).fill('').reduce((res) => res += `\t`, '')
}

function getPrikeyInfoByList(arr, attr = 'isMajorKey') {
    return arr.find(item => item?.param && item['param'][attr]) || {}
}


module.exports = {
    parseUrl,
    parseUrlGetParam,
    getInterfaceData,
    getTab,
    getPrikeyInfoByList
}