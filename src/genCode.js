
const { genCode } = require('./common')
const { getPage } = require('./adapter/vue/genPage.js')
const { getCrudAdapterData, getServiceAdapterData, getMenuAdapterData, getRouteAdapterData, getRouteConstantAdapterData } = require('./adapter')
const { constantCase, camelCase, pascalCase } = require('./utils/commonUtil.js')
const fse = require('fs-extra')
const path = require('path')
const { PAGE_TYPE_ENUM } = require('./enum/pageType.js')
const { MENU_TYPE_ENUM } = require('./enum/menuType.js')
const { FRAMEWORK_CONFIG } = require('./config/frameworkConfig.js')
const { ENTRY_SUFFIX_ENUM } = require('./enum/entrySuffix.js')

function getSoftwareData() {
  // 第一步:读取JSON数据
  const jsonData = fse.readJSONSync(path.resolve(__dirname, './mockJson.json'))
  return jsonData
}
async function getGenCode(softwareData) {
  const { menuInfo, componentInfo: pages } = softwareData

  // 获取路由常量、菜单、路由、页面数据
  const { menuList, routeList, routesConstantList, pageList } = getAdapterData(menuInfo, pages)
  const menuResult = getMenuAdapterData({ list: menuList })
  const routeResult = getRouteAdapterData({ list: routeList })
  const routesConstantResult = getRouteConstantAdapterData({ list: routesConstantList })

  // 获取页面内容 and 收集service数据
  const { pageResult, serviceData } = await getPageAdapterData(pageList)

  // 统一处理所有的serviceData
  const servieceResult = getServiceAdapterData(serviceData)

  return [...menuResult, ...routeResult, ...routesConstantResult, ...pageResult, ...servieceResult]
}

function getAdapterData(menuInfo, pages) {
  const menuList = menuInfo.reduce((res, item) => {
    const { code } = item
    const CONST_CODE = constantCase(code)
    const CAMEL_CASE_CODE = camelCase(code)
    const PASCAL_CASE_CODE = pascalCase(code)
    res['menuList'].push({
      ...item,
      menuParams: CONST_CODE,
    })
    // 设置了功能菜单 且必须设置配置了pages才可以生成页面内容
    const pageInfo = pages.find(page => page.bindMenu == item.id)
    if (pageInfo) {

      const { type } = pageInfo
      const VUE_FILE_NAME = `${CAMEL_CASE_CODE}/${PASCAL_CASE_CODE}${ENTRY_SUFFIX_ENUM[type]}.vue`
      if (item.menuType == MENU_TYPE_ENUM.PAGE && pageInfo) {
        res['routesConstantList'].push({
          const: CONST_CODE,
          path: CAMEL_CASE_CODE,
          name: PASCAL_CASE_CODE,
        })

        res['routeList'].push({
          ...item,
          const: CONST_CODE,
          path: `${FRAMEWORK_CONFIG.ROUTE_COMPONENT_PREFIX}/${VUE_FILE_NAME}`,
        })
        res['pageList'].push({ ...item, pageInfo });
      }
    }
    return res
  }, {
    menuList: [],
    routeList: [],
    routesConstantList: [],
    pageList: []
  })
  return menuList
}
// 最终返回的是写入文件相对路径和内容,有page和services两类
async function getPageAdapterData(menuPageList) {
  const pagesCode = []
  for await (const menuPage of menuPageList) {
    // 根据页面的菜单信息去找对应的pages信息
    const { type } = menuPage.pageInfo
    const pageData = parseJsonToPage(menuPage)
    if (type == PAGE_TYPE_ENUM.CRUD) {
      pagesCode.push(await getCrudAdapterData(pageData))
    }
  }
  return getPageResultAnddCollectServiceData(pagesCode)
}
// 返回页面需要的数据
function parseJsonToPage(menuPage) {
  const { functionModel: functionList, elementConfig: elementList } = menuPage.pageInfo

  return { menuInfo: menuPage, functionList, elementList }
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
  const filePath = path.join(FRAMEWORK_CONFIG.PAGE_DIR_PATH, dirpath, filepath)
  const content = getPage(params)
  return {
    filePath,
    content
  }
}



function transformPath(data){
  return data.map(item => {
    return {
      ...item,
      filePath: path.join(FRAMEWORK_CONFIG.CODE_OUTPUT_ROOT_PATH, item.filePath),
    }
  })
}



async function execCodeGenTest() {
  console.time('开始生成');
  // 获取软件数据
  const softwareData = getSoftwareData()
  // 获取code
  const code = await getGenCode(softwareData)

  // 清洗输出路径
  const result = transformPath(code)
  // 生成
  genCode(result)
  console.timeEnd('开始生成');
}
execCodeGenTest()
