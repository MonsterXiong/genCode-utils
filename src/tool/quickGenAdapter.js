
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const { constantCase, pascalCase, camelCase } = require('../utils/commonUtil')
const { updateData } = require('./common')
const { REQUIRE_PLACE_HOLDER_STR, EXPORT_PLACE_HOLDER_STR, CONTENT_PLACE_HOLDER_STR } = require('./placeholderConstant')
const { getEjsFileTemplateData } = require('../common')
function quickGenAdapter(param) {
    const { type, name } = param
    const isPage = isPageAdapter(type)

    createAdapter(param, isPage)
    isPage ? registerPageAdapter(name) : registerAdapter(name)
}

function isPageAdapter(type) {
    return type == 'page'
}

// 创建页面适配器需要
// todo:enum/index并未注册COMPONENT_XXX_ENUM

const CONTENT_TYPE = {
    CONTENT:'content',
    REQUIRE_CONTENT:'requireContent',
    EXPORT_CONTENT:'exportContent'
}

function registerComponentType(param){
    const { name } = param
    const filepath = path.resolve(__dirname, '../enum/componentType.js')
    register(filepath, getComponentTypeContent(name),{isTab:false})
}

function getComponentTypeContent(name){
    const componentTypeEnum = constantCase(`COMPONENT_${name}_ENUM`)
    const content = `const ${componentTypeEnum} = {\n\tENTRY: COMPONENT_ENUM.ENTRY,\n}`
    return {
        [CONTENT_TYPE.CONTENT]: content,
        [CONTENT_TYPE.EXPORT_CONTENT]:`${componentTypeEnum},`
    }
}

function registerPageTemplatePathMap(param){
    const { name } = param
    const filepath = path.resolve(__dirname, '../config/pageTemplatePathMap.js')
    register(filepath, getPageTemplatePathMapContent(name))
}
function getPageTemplatePathMapContent(name){
    const { constantCaseName,camelCaseName } = transformName(name)
    const componentTypeEnum = getComponentEnum(name)
    const content = `[PAGE_TYPE_ENUM.${constantCaseName}]: {\n\t\t[${componentTypeEnum}.ENTRY]: getPath('public/template/v3/page/${camelCaseName}/entry.ejs'),\n\t}`
    return {
        [CONTENT_TYPE.CONTENT]: content,
        [CONTENT_TYPE.REQUIRE_CONTENT]:`${componentTypeEnum},`
    }
}

function registerPageType(param) {
    const {name,componentName} = param
    const filepath = path.resolve(__dirname, '../enum/pageType.js')
    register(filepath, getPageTypeContent(name,componentName))
}

function getPageTypeContent(name,componentName) {
    const { constantCaseName } = transformName(name)
    return {
       [CONTENT_TYPE.CONTENT]: `${constantCaseName}: '${componentName}',`
    }
}

function registerLabelEnum(param){
    const {name,element} = param
    const filepath = path.resolve(__dirname, '../enum/label.js')
    register(filepath, getLabelEnumContent(name,element),{isTab:false})
}

function getLabelEnumContent(name,element){
    const labelEnum = getLabelEnumName(name)
    let elementContent = ''
    element.forEach((item,index) => {
        elementContent += `\n\t${item.elementNameEnumItem}:'${item.field}',`
        if (index == element.length - 1) {
            elementContent+='\n'
        }
    })
    const content = `const ${labelEnum} = {${elementContent}}`
    return {
        [CONTENT_TYPE.CONTENT]: content,
        [CONTENT_TYPE.EXPORT_CONTENT]:`${labelEnum},`
    }
}
function registerEntrySuffixEnum(param){
    const {name,entrySuffixName} = param
    const filepath = path.resolve(__dirname, '../enum/entrySuffix.js')
    register(filepath, getEntrySuffixEnumContent(name,entrySuffixName))
}

function getEntrySuffixEnumContent(name, entrySuffixName) {
    const { constantCaseName } = transformName(name)
    const entrySuffix = pascalCase(entrySuffixName)
    const content = `[PAGE_TYPE_ENUM.${constantCaseName}]:'${entrySuffix}',`
    return {
        [CONTENT_TYPE.CONTENT]: content,
    }
}


function getLabelEnumName(name){
    return constantCase(`${name}_LABEL_ENUM`)
}
function getComponentEnum(name){
    return constantCase(`COMPONENT_${name}_ENUM`)
}
function createTemplateFile(filename,templateName){
    const templatefilepath = path.resolve(__dirname, `../../../../public/template/v3/${filename}/${templateName}`)
    fse.ensureFileSync(templatefilepath)
}
async function createComponentEntryFile(name,filename){
    const componentEnum = getComponentEnum(name)
    const entryfilepath = path.resolve(__dirname, `../adapter/${filename}/getEntry.js`)
    fse.ensureFileSync(entryfilepath)
    const entryContent = await getEjsFileTemplateData(path.resolve(__dirname,'./getEntry.ejs'),{
        componentEnum,
    })
    fs.writeFileSync(entryfilepath, entryContent)
}
async function createAdapter(param, isPage) {
    const {name} = param
    const { camelCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)

    let filename = camelCaseName
    let templateName = `${camelCaseName}.ejs`
    let fileContent = `function ${adapterMethodName}(){\n\n}\n\nmodule.exports = {\n\t${adapterMethodName}\n}`

    if (isPage) {
        filename = `page/${filename}`
        templateName = 'entry.ejs'
        const pageTypeEnumName = constantCase(name)
        const labelEnum = getLabelEnumName(name)
        // 页面的特殊处理
        fileContent = await getEjsFileTemplateData(path.resolve(__dirname,'./adapterIndex.ejs'),{
            adapterMethodName,
            labelEnum,
            element:param.element,
            pageTypeEnumName,
        })
        // 注册页面组件
        registerPageType(param)
        // 注册要素label枚举
        registerLabelEnum(param)
        // 注册页面中的组件类型
        registerComponentType(param)
        // 更新templatePath
        registerPageTemplatePathMap(param)
        // 创建模板文件
        createTemplateFile(filename,templateName)
        // 创建生成组件入口文件
        await createComponentEntryFile(name,filename)
        // 入口文件的后缀名
        registerEntrySuffixEnum(param)
    } else {
        // 非页面的特殊处理
    }
    // 公共处理
    const filepath = path.resolve(__dirname, `../adapter/${filename}/index.js`)
    fse.ensureFileSync(filepath)
    fs.writeFileSync(filepath, fileContent)
    console.log('需要写模板内容');
    console.log('需要写适配器相关内容-如入口文件内容');
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
        [CONTENT_TYPE.CONTENT]: `[PAGE_TYPE_ENUM.${constantCaseName}]: ${adapterMethodName},`,
        [CONTENT_TYPE.REQUIRE_CONTENT]: `const { ${adapterMethodName} } = require('./${camelCaseName}/index')`,
    }
}

function getAdapterRegisterContent(name) {
    const { camelCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)
    return {
        [CONTENT_TYPE.CONTENT]: `${adapterMethodName},`,
        [CONTENT_TYPE.REQUIRE_CONTENT]: `const { ${adapterMethodName} } = require('./${camelCaseName}')`,
    }
}

function register(filepath, contentObj,option={isTab:true}) {
    const sourceContent = fs.readFileSync(filepath, 'utf8')
    const { content, requireContent,exportContent } = contentObj
    let updateStr = sourceContent
    if (requireContent) {
        updateStr = updateData(updateStr, requireContent, REQUIRE_PLACE_HOLDER_STR,option)
    }
    if (exportContent) {
        console.log(exportContent,exportContent);

        updateStr = updateData(updateStr, exportContent, EXPORT_PLACE_HOLDER_STR,{...option,isTab:true})
    }
    if(content){
        updateStr = updateData(updateStr, content,CONTENT_PLACE_HOLDER_STR,option)
    }
    if(updateStr){
        fs.writeFileSync(filepath, updateStr)
    }
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

quickGenAdapter({
    // 适配器类型
    type: 'page',
    // 适配器名称
    name: 'graph',
    // 对应组件枚举
    componentName: 'graph_general',
    // 入口后缀
    entrySuffixName:'Empty',
    // 组件要素
    element: [{
        field: 'rowInfo',
        elementName: 'queryRow',
        elementNameEnumItem:'QUERY_ROW',
        message: '矩阵行信息'
    }, {
        field: 'colInfo',
        elementName: 'queryCol',
        elementNameEnumItem:'QUERY_ROW',
        message: '矩阵列信息'
    }, {
        field: 'relInfo',
        elementName: 'queryRel',
        elementNameEnumItem:'QUERY_REL',
        message: '矩阵关联信息'
    }, {
        field: 'saveInfo',
        elementName: 'saveRel',
        elementNameEnumItem:'SAVE_REL',
        message: '矩阵保存信息'
    }]
})