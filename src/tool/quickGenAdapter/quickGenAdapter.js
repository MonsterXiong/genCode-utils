
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const { constantCase, pascalCase, camelCase } = require('../../utils/commonUtil')
const { updateData } = require('../common')
const { REQUIRE_PLACE_HOLDER_STR, EXPORT_PLACE_HOLDER_STR, CONTENT_PLACE_HOLDER_STR } = require('../placeholderConstant')
const { getEjsFileTemplateData } = require('../../common')
const { TEMPLATE_PATH, TOOL_CONFIG_ENUM } = require('../../config/templateMap')
const { TEMPLATE_ELEMENT_ENUM } = require('../../enum/templateElement')

const CONTENT_TYPE = {
    CONTENT: 'content',
    REQUIRE_CONTENT: 'requireContent',
    EXPORT_CONTENT: 'exportContent'
}
const REGISTER_TYPE = {
    TEMPLATE_MAP:'templateMap',
    PAGE_TEMPLATE_PATH_MAP: 'pageTemplatePathMap',
    TEMPLATE_ELEMENT:'templateElement',
    COMPONENT_TYPE: 'componentType',
    PAGE_TYPE: 'pageType',
    LABEL: 'label',
    ENTRY_SUFFIX: 'entrySuffix',
    PAGE_ADAPTER:'pageAdapter',
    ADAPTER:'adapter',
}

const REGISTER_MAP={
    [REGISTER_TYPE.TEMPLATE_MAP]:{
        filePath:formatPath('../../config/templateMap.js'),
        getContent:getTemplateMapContent,
    },
    [REGISTER_TYPE.PAGE_TEMPLATE_PATH_MAP]:{
        filePath:formatPath('../../config/pageTemplatePathMap.js'),
        getContent:getPageTemplatePathMapContent,
    },
    [REGISTER_TYPE.TEMPLATE_ELEMENT]:{
        filePath:formatPath('../../enum/templateElement.js'),
        getContent:getTemplateElementContent,
    },
    [REGISTER_TYPE.COMPONENT_TYPE]:{
        filePath:formatPath('../../enum/componentType.js'),
        getContent:getComponentTypeContent,
    },
    [REGISTER_TYPE.PAGE_TYPE]:{
        filePath:formatPath('../../enum/pageType.js'),
        getContent:getPageTypeContent,
    },
    [REGISTER_TYPE.LABEL]:{
        filePath:formatPath('../../enum/label.js'),
        getContent:getLabelContent,
    },
    [REGISTER_TYPE.ENTRY_SUFFIX]:{
        filePath:formatPath('../../enum/entrySuffix.js'),
        getContent:getEntrySuffixContent,
    },
    [REGISTER_TYPE.PAGE_ADAPTER]:{
        filePath:formatPath('../../adapter/page/pageAdapterMap.js'),
        getContent:getPageAdapterContent,
    },
    [REGISTER_TYPE.ADAPTER]:{
        filePath:formatPath('../../adapter/index.js'),
        getContent:getAdapterContent,
    },
}

function formatPath(filepath) {
    return path.resolve(__dirname, filepath)
}
function execRegister(type,param,option){
    const {filePath,getContent} = REGISTER_MAP[type]
    register(filePath, getContent(param),option)
}
function isPageAdapter(type) {
    return type == 'page'
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
function getLabelEnumName(name) {
    return constantCase(`${name}_LABEL_ENUM`)
}
function getComponentEnumName(name) {
    return constantCase(`COMPONENT_${name}_ENUM`)
}


function getTemplateMapContent(param) {
    const { name } = param
    const { constantCaseName, camelCaseName } = transformName(name)
    const content = `[TEMPLATE_ELEMENT_ENUM.${constantCaseName}]: getPath('public/template/v3/${camelCaseName}/${camelCaseName}.ejs'),`
    return {
        [CONTENT_TYPE.CONTENT]: content,
    }
}
function getPageTemplatePathMapContent(param) {
    const { name } = param
    const { constantCaseName, camelCaseName } = transformName(name)
    const componentTypeEnum = getComponentEnumName(name)
    const content = `[PAGE_TYPE_ENUM.${constantCaseName}]: {\n\t\t[${componentTypeEnum}.ENTRY]: getPath('public/template/v3/page/${camelCaseName}/entry.ejs'),\n\t}`
    return {
        [CONTENT_TYPE.CONTENT]: content,
        [CONTENT_TYPE.REQUIRE_CONTENT]: `${componentTypeEnum},`
    }
}
function getTemplateElementContent(param) {
    const { name } = param
    const { constantCaseName, camelCaseName } = transformName(name)
    const content = `${constantCaseName}:'${camelCaseName}',`
    return {
        [CONTENT_TYPE.CONTENT]: content,
    }
}
function getComponentTypeContent(param) {
    const { name } = param
    const componentTypeEnum = constantCase(`COMPONENT_${name}_ENUM`)
    const content = `const ${componentTypeEnum} = {\n\tENTRY: COMPONENT_ENUM.ENTRY,\n}`
    return {
        [CONTENT_TYPE.CONTENT]: content,
        [CONTENT_TYPE.EXPORT_CONTENT]: `${componentTypeEnum},`
    }
}
function getPageTypeContent(param) {
    const { name, componentName } = param
    const { constantCaseName } = transformName(name)
    return {
        [CONTENT_TYPE.CONTENT]: `${constantCaseName}: '${componentName}',`
    }
}
function getLabelContent(param) {
    const { name, element } = param
    const labelEnum = getLabelEnumName(name)
    let elementContent = ''
    element.forEach((item, index) => {
        elementContent += `\n\t${constantCase(item.elementName)}:'${item.elementName}',`
        if (index == element.length - 1) {
            elementContent += '\n'
        }
    })
    const content = `const ${labelEnum} = {${elementContent}}`
    return {
        [CONTENT_TYPE.CONTENT]: content,
        [CONTENT_TYPE.EXPORT_CONTENT]: `${labelEnum},`
    }
}
function getEntrySuffixContent(param) {
    const { name, entrySuffixName } = param
    const { constantCaseName } = transformName(name)
    const entrySuffix = pascalCase(entrySuffixName)
    const content = `[PAGE_TYPE_ENUM.${constantCaseName}]:'${entrySuffix}',`
    return {
        [CONTENT_TYPE.CONTENT]: content,
    }
}
function getPageAdapterContent(param) {
    const {name} = param
    const { camelCaseName, constantCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)
    return {
        [CONTENT_TYPE.CONTENT]: `[PAGE_TYPE_ENUM.${constantCaseName}]: ${adapterMethodName},`,
        [CONTENT_TYPE.REQUIRE_CONTENT]: `const { ${adapterMethodName} } = require('./${camelCaseName}/index')`,
    }
}
function getAdapterContent(param) {
    const {name} = param
    const { camelCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)
    return {
        [CONTENT_TYPE.CONTENT]: `${adapterMethodName},`,
        [CONTENT_TYPE.REQUIRE_CONTENT]: `const { ${adapterMethodName} } = require('./${camelCaseName}')`,
    }
}


function createTemplateFile(filename, templateName) {
    const templatefilepath = formatPath( `../../../../../public/template/v3/${filename}/${templateName}`)
    fse.ensureFileSync(templatefilepath)
}
async function createComponentEntryFile(name, filename) {
    const componentEnum = getComponentEnumName(name)
    const entryfilepath = formatPath(`../../adapter/${filename}/getEntry.js`)
    fse.ensureFileSync(entryfilepath)
    const entryContent = await getEjsFileTemplateData(TEMPLATE_PATH[TEMPLATE_ELEMENT_ENUM.TOOL][TOOL_CONFIG_ENUM.GET_ENTRY]), {
        componentEnum,
    })
    fs.writeFileSync(entryfilepath, entryContent)
}

async function getPageAdapterFileContent(adapterMethodName, param) {
    const { name, element } = param
    const elementInfo = element.map(item=>{
        return {
            ...item,
            elementNameEnum: constantCase(item.elementName)
        }
    })
    const pageTypeEnumName = constantCase(name)
    const labelEnum = getLabelEnumName(name)
    return await getEjsFileTemplateData(TEMPLATE_PATH[TEMPLATE_ELEMENT_ENUM.TOOL][TOOL_CONFIG_ENUM.ADAPTER_INDEX], {
        adapterMethodName,
        labelEnum,
        element:elementInfo,
        pageTypeEnumName,
    })
}
function createAdapterFile(filename, fileContent) {
    const filepath = formatPath(`../../adapter/${filename}/index.js`)
    fse.ensureFileSync(filepath)
    fs.writeFileSync(filepath, fileContent)
}


function register(filepath, contentObj, option = { isTab: true }) {
    const sourceContent = fs.readFileSync(filepath, 'utf8')
    const { content, requireContent, exportContent } = contentObj
    let updateStr = sourceContent
    if (requireContent) {
        updateStr = updateData(updateStr, requireContent, REQUIRE_PLACE_HOLDER_STR, option)
    }
    if (exportContent) {
        updateStr = updateData(updateStr, exportContent, EXPORT_PLACE_HOLDER_STR, { ...option, isTab: true })
    }
    if (content) {
        updateStr = updateData(updateStr, content, CONTENT_PLACE_HOLDER_STR, option)
    }
    if (updateStr) {
        fs.writeFileSync(filepath, updateStr)
    }
}
async function quickGenAdapter(param) {
    const { name,type } = param
    const { camelCaseName, pascalCaseName } = transformName(name)
    const adapterMethodName = getAdapterMethodName(pascalCaseName)

    let filename = camelCaseName
    let templateName = `${camelCaseName}.ejs`
    let fileContent = `function ${adapterMethodName}(){\n\n}\n\nmodule.exports = {\n\t${adapterMethodName}\n}`

    if (isPageAdapter(type)) {
        // 页面的特殊处理
        filename = `page/${filename}`
        templateName = 'entry.ejs'
        fileContent = await getPageAdapterFileContent(adapterMethodName, param)
        // 注册页面组件
        execRegister(REGISTER_TYPE.PAGE_TYPE,param)
        // 注册要素label枚举
        execRegister(REGISTER_TYPE.LABEL,param,{ isTab: false })
        // 注册页面中的组件类型
        execRegister(REGISTER_TYPE.COMPONENT_TYPE,param,{ isTab: false })
        // 更新templatePath
        execRegister(REGISTER_TYPE.PAGE_TEMPLATE_PATH_MAP,param)
        // 创建生成组件入口文件
        await createComponentEntryFile(name, filename)
        // 入口文件的后缀名
        execRegister(REGISTER_TYPE.ENTRY_SUFFIX,param)
        // 注册页面适配器
        execRegister(REGISTER_TYPE.PAGE_ADAPTER,param)
    } else {
        // 非页面的特殊处理

        // ---优化适配器调用---，通过map隐射
        // ---根据type需要去注册全局的frameworkConfig
        // ---能够在genCode.js中使用

        // 注册模板要素
        execRegister(REGISTER_TYPE.TEMPLATE_ELEMENT,param)
        // 注册模板路径
        execRegister(REGISTER_TYPE.TEMPLATE_MAP,param)
        // 注册适配器
        execRegister(REGISTER_TYPE.ADAPTER,param)
    }

    // 公共处理

    // 创建模板文件
    createTemplateFile(filename, templateName)
    // 创建写入适配器文件
    createAdapterFile(filename, fileContent)
    console.log('需要写模板内容');
    console.log('需要写适配器相关内容-如入口文件内容');
}

module.exports = {
    quickGenAdapter
}

// quickGenAdapter({
//     // 适配器类型
//     type: 'page',
//     // 适配器名称
//     name: 'graph',
//     // 对应组件枚举
//     componentName: 'graph_general',
//     // 入口后缀
//     entrySuffixName: 'Empty',
//     // 组件要素
//     element: [{
//         field: 'rowInfo',
//         elementName: 'queryRow',
//         message: '矩阵行信息'
//     }, {
//         field: 'colInfo',
//         elementName: 'queryCol',
//         message: '矩阵列信息'
//     }, {
//         field: 'relInfo',
//         elementName: 'queryRel',
//         message: '矩阵关联信息'
//     }, {
//         field: 'saveInfo',
//         elementName: 'saveRel',
//         message: '矩阵保存信息'
//     }]
// })