
const { genCode, transformOutInfo } = require('./common')
const { getCrudAdapterData, getServiceAdapterData, getMenuAdapterData, getRouteAdapterData, getRouteConstantAdapterData } = require('../template')
const fse = require('fs-extra')
const path = require('path')
const changeCase = require('change-case')

// 转换dataModel
function transformDataModelMap(dataModel) {
  return dataModel.reduce((res, item) => {
    res[item.code] = item.cloumns
    return res
  }, {})
}

function getSoftwareData() {
  // 第一步:读取JSON数据
  const jsonData = fse.readJSONSync(path.resolve(__dirname, '../mockJson.json'))

  return {
    ...jsonData,
    dataModel: transformDataModelMap(jsonData.dataModel),
  }
}

function getSoftwareStructData(menuInfo, pages) {
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

// 将dataModel的数据清洗,同时返回页面需要的数据
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

// 最终返回的是写入文件相对路径和内容,有page和services两类
function getGenPageCode(menuPageList, dataModel) {
  return menuPageList.map((menuPage) => {
    // 根据页面的菜单信息去找对应的pages信息和dataModel
    const { type } = menuPage.pageInfo
    const pageData = parseJsonToPage(menuPage, dataModel)
    if (type == 'crud') {
      return getCrudAdapterData(pageData)
    }
  })
}


function collectPageData(pageResult, pages) {
  pages.forEach(components => {
    pageResult.push(components)
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
function collectData(pagesCode) {
  return pagesCode.reduce((res, { services, pages }) => {
    collectServiceData(res['serviceData'], services)
    collectPageData(res['pageData'], pages)
    return res
  }, {
    pageData: [],
    serviceData: {}
  })
}

function main() {
  // 获取软件数据
  const softwareData = getSoftwareData()
  const { menuInfo, pages, dataModel } = softwareData

  // 获取路由常量、菜单、路由、页面数据
  const { menuList, routeList, routesConstantList, pageList } = getSoftwareStructData(menuInfo, pages)

  const menuResult = getMenuAdapterData({ list: menuList })
  const routeResult = getRouteAdapterData({ list: routeList })
  const routesConstantResult = getRouteConstantAdapterData({ list: routesConstantList })

  // 一个页面多个组件
  const pagesCode = getGenPageCode(pageList, dataModel)
  // 收集service和page的内容
  const { pageData, serviceData } = collectData(pagesCode)
  // 统一处理所有的serviceData
  const servieceResult = getServiceAdapterData(serviceData)

  const pageResult = pageData.map(item => transformOutInfo(item))

  genCode([...menuResult, ...routeResult, ...routesConstantResult, ...pageResult, ...servieceResult])
}

main()
