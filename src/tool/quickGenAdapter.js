
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const { constantCase, pascalCase, camelCase } = require('../utils/commonUtil')
const { updateData } = require('./common')
const { REQUIRE_PLACE_HOLDER_STR } = require('./placeholderConstant')
function quickGenAdapter(param) {
    const { type, name } = param
    const isPage = isPageAdapter(type)
    
    createAdapter(name,isPage)
    isPage ? registerPageAdapter(name) : registerAdapter(name)
}

function isPageAdapter(type) {
    return type == 'page'
}

// 创建页面适配器需要
// 1. 适配器文件和模板文件 crud/index.js crud/getEntry.js 同时需要注册适配器
// 2. crud/index.js中的内容需要考虑 crud/getEntry需要定制
// 3. 其中crud/index.js中只有getParam需要自定义以及checkMustInfo需要自定义，根据label对数据进行分类
// 4. getEntry.js需要注册COMPONENT_XXX_ENUM.ENTRY，同时需要在public下注册ejs模板文件，以及在templatePath中注册模板路径
//    

function createAdapter(name,isPage) {
    const { camelCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)

    let filename = camelCaseName
    if (isPage) {
        filename = `page/${filename}`
    }
    const filepath = path.resolve(__dirname, `../adapter/${filename}/index.js`)
    const entryfilepath = path.resolve(__dirname, `../adapter/${filename}/getEntry.js`)
    fse.ensureFileSync(filepath)
    fse.ensureFileSync(entryfilepath)
    const fileContent = `function ${adapterMethodName}(){\n\n}\n\nmodule.exports = {\n\t${adapterMethodName}\n}`
    const entryContent = ``
    fs.writeFileSync(filepath, fileContent)
    fs.writeFileSync(entryfilepath, entryContent)

    // 在public/template/v3/page/dirname/entry.ejs
    // public/template/v3/dirname/dirname.ejs || 自定义命名
}

function transformName(name) {
    return {
        camelCaseName: camelCase(name),
        constantCaseName: constantCase(name),
        pascalCaseName: pascalCase(name),
    }
}

function getAdapterMethodName(name) {
    return `get${name}AdapterData`
}
function getPageAdapterRegisterContent(name) {
    const { camelCaseName, constantCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)
    return {
        content: `[PAGE_TYPE_ENUM.${constantCaseName}]: ${adapterMethodName},`,
        requireContent: `const { ${adapterMethodName} } = require('./${camelCaseName}/index')`,
    }
}

function getAdapterRegisterContent(name) {
    const { camelCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)
    return {
        content: `${adapterMethodName},`,
        requireContent: `const { ${adapterMethodName} } = require('./${camelCaseName}')`,
    }
}

function register(filepath, contentObj,isRequire=true) {
    const sourceContent = fs.readFileSync(filepath, 'utf8')
    const { content, requireContent } = contentObj
    let updateStr = updateData(sourceContent, content)
    if(isRequire){
        updateStr = updateData(updateStr, requireContent, REQUIRE_PLACE_HOLDER_STR)
    }
    fs.writeFileSync(filepath, updateStr)
}
function registerPageAdapter(name) {
    const filepath = path.resolve(__dirname, '../adapter/page/pageAdapterMap.js')
    register(filepath, getPageAdapterRegisterContent(name))
}
function registerAdapter(name) {
    const filepath = path.resolve(__dirname, '../adapter/index.js')
    register(filepath, getAdapterRegisterContent(name))
}

module.exports = {
    quickGenAdapter
}

quickGenAdapter({ type: 'xxx', name: 'graph' })