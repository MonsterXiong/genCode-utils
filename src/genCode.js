
const {  genCode, transformOutInfo } = require('./common')
const { getCrudAdapterData } = require('../template')
const fse = require('fs-extra')
const path = require('path')
const changeCase = require('change-case')

// 转换dataModel
function transformDataModelMap(dataModel){
  return dataModel.reduce((res, item) => {
    res[item.code] = item.cloumns
    return res
  }, {})
}

function getSoftwareData(){
    // 第一步:读取JSON数据
    const jsonData = fse.readJSONSync(path.resolve(__dirname,'../mockJson.json'))

    return {
      ...jsonData,
      dataModel: transformDataModelMap(jsonData.dataModel),
    }
}


function getSoftwareStructData(menuInfo,pages){
  const init_fileList = {
    menuList:[],
    routeList:[],
    routesConstantList:[],
    pageList:[]
}
  const menuList = menuInfo.reduce((res,item)=>{
      const {code} = item
      const CONST_CODE = changeCase.constantCase(code)
      const CAMEL_CASE_CODE = changeCase.camelCase(code)
      const PASCAL_CASE_CODE = changeCase.pascalCase(code)
      const VUE_FILE_NAME = `${CAMEL_CASE_CODE}/${PASCAL_CASE_CODE}.vue`
          res['menuList'].push({
              ...item,
              menuParams: CONST_CODE,
          })
        // 设置了功能菜单 且必须设置配置了pages才可以生成页面内容
        const pageInfo = pages.find(page=>page.bindMenu == item.id)
        if(item.menuType == "page" && pageInfo){
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
          res['pageList'].push({...item,pageInfo});
        }
      return res
  },init_fileList)

  return menuList
}


// 将dataModel的数据清洗,同时返回页面需要的数据
function parseJsonToPage(menuPage,dataModel){
  const {  functionModel:functionList, elementConfig:elementList } = menuPage.pageInfo
  elementList.forEach(element=>{
    element.data.forEach(dataItem=>{
      const name = dataModel[dataItem.bindObj].find(dataColumn => dataColumn.code == dataItem.bindAttr)
      dataItem['_name'] = name
      dataItem['name'] = dataItem.alias ? dataItem.alias : name,
      dataItem['field'] = dataItem.aliasCode ? dataItem.aliasCode : dataItem.bindAttr
    })
  })

  return { menuInfo:menuPage,functionList, elementList }
}

// 最终返回的是写入文件相对路径和内容,有page和services两类
function getGenPageCode(menuPageList,dataModel){
  return menuPageList.map((menuPage)=>{
    // 根据页面的菜单信息去找对应的pages信息和dataModel
      const { type } = menuPage.pageInfo
      const pageData = parseJsonToPage(menuPage,dataModel)
      if (type == 'crud') {
        return getCrudAdapterData(pageData)
      }
  })

}

function main(){
  // 获取软件数据
  const softwareData = getSoftwareData()
  const { menuInfo,pages,dataModel } = softwareData
  // 1.根据menuInfo,开始打造软件
  // 2.根据软件数据需要生成的内容有=>menuList、routeList、routesConstantList、pageList
  // 先根据软件数据将基本的构造生成出来

  // 获取路由常量、菜单、路由、页面数据
  const {menuList,routeList,routesConstantList,pageList} = getSoftwareStructData(menuInfo,pages)
  // A.写入文件内容已经有menuList,routeList,routesConstantList三类文件了
  // 收集
  const result = []
    // B.开始收集service和page的内容
    // 一个页面多个组件
    const pagesCode = getGenPageCode(pageList,dataModel)
    pagesCode.forEach(({services,pages})=>{
      // services需要处理以下
      pages.forEach(components=>{
        result.push(components)
      })
    })
  const code = result.map(item=>transformOutInfo(item))
  genCode(code)
}

main()
