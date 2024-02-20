
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

function createAdapter(name,isPage) {
    const { camelCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)

    let filename = camelCaseName
    if (isPage) {
        filename = `page/${filename}`
    }
    const filepath = path.resolve(__dirname, `../adapter/${filename}/index.js`)
    fse.ensureFileSync(filepath)
    const fileContent = `function ${adapterMethodName}(){\n\n}\n\nmodule.exports = {\n\t${adapterMethodName}\n}`
    fs.writeFileSync(filepath, fileContent)
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

function register(filepath, contentObj) {
    const sourceContent = fs.readFileSync(filepath, 'utf8')
    const { content, requireContent } = contentObj
    const updateContentStr = updateData(sourceContent, content)
    const updateRequireStr = updateData(updateContentStr, requireContent, REQUIRE_PLACE_HOLDER_STR)
    fs.writeFileSync(filepath, updateRequireStr)
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