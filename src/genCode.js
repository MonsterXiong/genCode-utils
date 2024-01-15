
const { genCode } = require('./common')
const { getPage } =require('./genPage.js')
const { getCrudAdapterData, getServiceAdapterData, getMenuAdapterData, getRouteAdapterData, getRouteConstantAdapterData } = require('../template')
const fse = require('fs-extra')
const path = require('path')
const changeCase = require('change-case')
function getSoftwareData() {
  // 第一步:读取JSON数据
  const jsonData = fse.readJSONSync(path.resolve(__dirname, '../mockJson.json'))
  return jsonData
}
function getGenCode(softwareData){
  const { menuInfo, pages, dataModel } = softwareData

  const dataModelInfo = transformDataModelMap(dataModel)

  // 获取路由常量、菜单、路由、页面数据
  const { menuList, routeList, routesConstantList, pageList } = getAdapterData(menuInfo, pages)

  const menuResult = getMenuAdapterData({ list: menuList })
  const routeResult = getRouteAdapterData({ list: routeList })
  const routesConstantResult = getRouteConstantAdapterData({ list: routesConstantList })

  // 获取页面内容 and 收集service数据
  const { pageResult, serviceData } = getPageAdapterData(pageList, dataModelInfo)

  // 统一处理所有的serviceData
  const servieceResult = getServiceAdapterData(serviceData)

  return [...menuResult, ...routeResult, ...routesConstantResult, ...pageResult, ...servieceResult]
}
// 转换dataModel
function transformDataModelMap(dataModel) {
  return dataModel.reduce((res, item) => {
    res[item.code] = item.cloumns
    return res
  }, {})
}
function getAdapterData(menuInfo, pages) {
  const init_fileList = {
    menuList: [],
    routeList: [],
    routesConstantList: [],
    pageList: []
  }
  const menuList = menuInfo.reduce((res, item) => {
    const { code } = item
    const CONST_CODE = changeCase.constantCase(code)
    const CAMEL_CASE_CODE = changeCase.camelCase(code)
    const PASCAL_CASE_CODE = changeCase.pascalCase(code)
    const VUE_FILE_NAME = `${CAMEL_CASE_CODE}/${PASCAL_CASE_CODE}.vue`
    res['menuList'].push({
      ...item,
      menuParams: CONST_CODE,
    })
    // 设置了功能菜单 且必须设置配置了pages才可以生成页面内容
    const pageInfo = pages.find(page => page.bindMenu == item.id)
    if (item.menuType == "page" && pageInfo) {
      res['routesConstantList'].push({
        const: CONST_CODE,
        path: CAMEL_CASE_CODE,
        name: PASCAL_CASE_CODE,
      })
      res['routeList'].push({
        ...item,
        const: CONST_CODE,
        path: `@/pages/${VUE_FILE_NAME}`,
      })
      res['pageList'].push({ ...item, pageInfo });
    }
    return res
  }, init_fileList)

  return menuList
}
// 最终返回的是写入文件相对路径和内容,有page和services两类
function getPageAdapterData(menuPageList, dataModel) {
  const pagesCode = menuPageList.map((menuPage) => {
    // 根据页面的菜单信息去找对应的pages信息和dataModel
    const { type } = menuPage.pageInfo
    const pageData = parseJsonToPage(menuPage, dataModel)
    if (type == 'crud') {
      return getCrudAdapterData(pageData)
    }
  })
  return getPageResultAnddCollectServiceData(pagesCode)
}
// 返回页面需要的数据
function parseJsonToPage(menuPage, dataModel) {
  const { functionModel: functionList, elementConfig: elementList } = menuPage.pageInfo
  elementList.forEach(element => {
    element.data.forEach(dataItem => {
      const name = dataModel[dataItem.bindObj].find(dataColumn => dataColumn.code == dataItem.bindAttr)
      dataItem['_name'] = name
      dataItem['name'] = dataItem.alias ? dataItem.alias : name,
        dataItem['field'] = dataItem.aliasCode ? dataItem.aliasCode : dataItem.bindAttr
    })
  })

  const dataModelPriInfo = Object.keys(dataModel).reduce((res, table) => {
    const primaryColumn = dataModel[table].find(item => item.isPrimary)
    if (!primaryColumn) {
      throw new Error(`${table}---数据模型中没有主键`)
    }
    res[table] = primaryColumn
    return res
  }, {})

  return { menuInfo: menuPage, functionList, elementList, dataModelPriInfo }
}
function getPageResultAnddCollectServiceData(pagesCode) {
  return pagesCode.reduce((res, { services, pages }) => {
    collectServiceData(res['serviceData'], services)
    getPageReuslt(res['pageResult'], pages)
    return res
  }, {
    pageResult: [],
    serviceData: {}
  })
}
function collectServiceData(serviceData, services) {
  Object.keys(services).forEach(serviceName => {
    if (!serviceData[serviceName]) {
      serviceData[serviceName] = services[serviceName]
    } else {
      serviceData[serviceName] = serviceData[serviceName].concat(services[serviceName])
    }
  })
}
function getPageReuslt(pageResult, pages) {
  pages.forEach(components => {
    pageResult.push(getGenPageData(components))
  })
}
function getGenPageData(transformData) {
  const { dirpath, filepath, params } = transformData
  const filePath = path.join(dirpath, filepath)
  const content = getPage(params)
  return {
    filePath,
    content
  }
}
function execCodeGen() {
  // 获取软件数据
  const softwareData = getSoftwareData()
  // 获取code
  const code = getGenCode(softwareData)
  // 生成
  genCode(code)
}
execCodeGen()
