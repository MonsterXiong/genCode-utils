const { getPath } = require("../../common")
const { camelCase, constantCase, pascalCase } = require("../../utils/commonUtil")
const path = require('path')
const fse = require('fs-extra')
const fs = require('fs')
const { register } = require("../common")
function formatPath(filepath) {
  return getPath(path.join('submodule/owner-workbase/src', filepath))
}
const CONTENT_TYPE = {
  CONTENT: 'content',
  REQUIRE_CONTENT: 'requireContent',
  EXPORT_CONTENT: 'exportContent'
}
const REGISTER_TYPE = {
  PAGE_TYPE: 'pageType',
  PAGE_LIST: 'pageList',
  TEMPLATE_MAP: 'templateMap',
  PAGE_CATEGORY_TYPE: 'pageCategoryType',
  PAGE_CATEGORY_LIST: 'pageCategoryList',
  ADAPTER_PAGE_TYPE: 'adapterPageCategoryType',
  ADAPTER_PAGE_CATEGORY_TYPE: 'adapterPageCategoryList',
  ADAPTER_ENTRY: 'adapterEntry',
}

const REGISTER_MAP = {
  [REGISTER_TYPE.ADAPTER_PAGE_TYPE]: {
    filePath: getPath('src/modules/extends/gen/common/pageType.ts'),
    getContent: getPageTypeContent,
  },
  [REGISTER_TYPE.ADAPTER_PAGE_CATEGORY_TYPE]: {
    filePath: getPath('src/modules/extends/gen/common/pageCategoryType.ts'),
    getContent: getPageCategoryTypeContent,
  },
  [REGISTER_TYPE.PAGE_TYPE]: {
    filePath: formatPath('pages/genSoftware/constant/pageType.js'),
    getContent: getPageTypeContent,
  },
  [REGISTER_TYPE.PAGE_LIST]: {
    filePath: formatPath('pages/genSoftware/constant/pageList.js'),
    getContent: getPageListContent,
  },
  [REGISTER_TYPE.TEMPLATE_MAP]: {
    filePath: formatPath('pages/genSoftware/pageDesign/template/index.js'),
    getContent: getTemplateMapContent,
  },
  [REGISTER_TYPE.PAGE_CATEGORY_TYPE]: {
    filePath: formatPath('pages/genSoftware/constant/pageCategoryType.js'),
    getContent: getPageCategoryTypeContent,
  },
  [REGISTER_TYPE.PAGE_CATEGORY_LIST]: {
    filePath: formatPath('pages/genSoftware/constant/pageCategoryList.js'),
    getContent: getPageCategoryListContent,
  },
  [REGISTER_TYPE.ADAPTER_ENTRY]: {
    filePath: getPath('src/modules/extends/gen/adapter/index.ts'),
    getContent: getAdapterEntryContent,
  },
}
function transformCode(code) {
  return {
      camelCaseCode: camelCase(code),
      constantCaseCode: constantCase(code),
      pascalCaseCode: pascalCase(code),
  }
}

function getAdapterFileName(code){
  return `${camelCase(code)}Adapter`
}

function getPageCategoryTypeContent(param){
  const { code } = param
  const {constantCaseCode,camelCaseCode} = transformCode(code)
  return {
    [CONTENT_TYPE.CONTENT]: `${constantCaseCode}: '${camelCaseCode}',`
  }
}
function getPageCategoryListContent(param){
  const { name, code } = param
  const { constantCaseCode } = transformCode(code)
  return {
    [CONTENT_TYPE.CONTENT]: `{\n    value: CATEGORY_TYPE.${constantCaseCode},\n    label: '${name}',\n  },`
  }
}
function getPageTypeContent(param){
  const { code } = param
  const {constantCaseCode,camelCaseCode} = transformCode(code)
  return {
    [CONTENT_TYPE.CONTENT]: `${constantCaseCode}: '${camelCaseCode}',`
  }
}
function getPageListContent(param){
  const { name, code, categoryType } = param
  const { constantCaseCode } = transformCode(code)
  const constantCaseCategoryType = constantCase(categoryType)
  return {
    [CONTENT_TYPE.CONTENT]: `{\n    category: CATEGORY_TYPE.${constantCaseCategoryType},\n    value: PAGE_TYPE.${constantCaseCode},\n    label: '${name}',\n  },`
  }
}
function getTemplateMapContent(param){
  const { code } = param
  const { constantCaseCode,pascalCaseCode,camelCaseCode } = transformCode(code)
  return  {
    [CONTENT_TYPE.REQUIRE_CONTENT]: `import ${pascalCaseCode} from './${camelCaseCode}/${pascalCaseCode}.vue'`,
    [CONTENT_TYPE.CONTENT]: `[PAGE_TYPE.${constantCaseCode}]: ${pascalCaseCode},`
  }
}
function getAdapterEntryContent(param){
  const { code } = param
  const { constantCaseCode,pascalCaseCode,camelCaseCode } = transformCode(code)
  const adapterMapName = `${constantCaseCode}_ADAPTER_MAP`
  return  {
    [CONTENT_TYPE.REQUIRE_CONTENT]: `import { ${adapterMapName} } from './${camelCaseCode}/index'`,
    [CONTENT_TYPE.CONTENT]: `[CATEGORY_TYPE.${constantCaseCode}]: ${adapterMapName},`
  }
}

function getAdapterCategoryMapContent(param){
  const { code } = param
  const { constantCaseCode } = transformCode(code)
  const adapterName = getAdapterFileName(code)
  return  {
    [CONTENT_TYPE.REQUIRE_CONTENT]: `import { ${adapterName} } from './${adapterName}'`,
    [CONTENT_TYPE.CONTENT]: `[PAGE_TYPE.${constantCaseCode}]:${adapterName},`
  }
}

function createComponentTemplateFile(filename, fileContent) {
  const filepath = formatPath(`pages/genSoftware/pageDesign/template/${filename}/${pascalCase(filename)}.vue`)
  fse.ensureFileSync(filepath)
  fs.writeFileSync(filepath, fileContent)
}
function createComponentTemplateEjsFile(dirPath,filename) {
  const filepath = getPath(`public/template/v4/page/${dirPath}/${filename}/${filename}.ejs`)
  fse.ensureFileSync(filepath)
  fs.writeFileSync(filepath, `<template>\n  <div><%=name%>-${filename}</div>\n</template>\n<script>\nexport default {\n  name: '<%= pageName%>'\n}\n</script>`)
}
function createAdapterImplementFile(dirPath,filename) {
  const filepath = getPath(`src/modules/extends/gen/adapter/${dirPath}/${getAdapterFileName(filename)}.ts`)
  fse.ensureFileSync(filepath)
  fs.writeFileSync(filepath, `export function ${getAdapterFileName(filename)}(param){ \n  const { name,pageName, detailParam } = param\n  const  { templateParam } = detailParam\n  // if(!templateParam || !Object.keys(templateParam)?.length){\n  //   return null\n  // }\n  return param \n}`)
}
function createAdapterMapFile(dirPath) {
  const filepath = getPath(`src/modules/extends/gen/adapter/${dirPath}/index.ts`)
  fse.ensureFileSync(filepath)
  fs.writeFileSync(filepath, `import {PAGE_TYPE} from '../../common/pageType'\n/* Software Gen Code Require Placeholder */\n\nexport const ${constantCase(dirPath)}_ADAPTER_MAP = {\n  /* Software Gen Code Placeholder */\n}`)
}

function execRegister(type,param,option){
  const {filePath,getContent} = REGISTER_MAP[type]
  register(filePath, getContent(param),option)
}


async function quickGenComponentTemplate(param) {
  const { code,name,categoryType } = param
  const {camelCaseCode} = transformCode(code)
  const templateFileContent = `<template>\n    <div class="common-page">${code}-${name}</div>\n</template>`
  createComponentTemplateFile(camelCaseCode,templateFileContent)
  execRegister(REGISTER_TYPE.PAGE_TYPE,param)
  execRegister(REGISTER_TYPE.PAGE_LIST,param)
  execRegister(REGISTER_TYPE.TEMPLATE_MAP, param)
  createComponentTemplateEjsFile(camelCase(categoryType),camelCaseCode)

  // 适配器注册
  quickGenComponentTemplateAdapter(param)
}

async function quickGenComponentTemplateAdapter(param){
  const { code,name,categoryType } = param
  const {camelCaseCode} = transformCode(code)
    // 注册适配器常量
    execRegister(REGISTER_TYPE.ADAPTER_PAGE_TYPE,param)
    // 创建适配器文件
    createAdapterImplementFile(camelCase(categoryType),camelCaseCode)
    // filePath是动态的
    const filePath = getPath(`src/modules/extends/gen/adapter/${categoryType}/index.ts`)
    const getContent = getAdapterCategoryMapContent
    register(filePath, getContent(param))
}

async function quickGenCategoryTypeAdapter(param) {
  const { code } = param
  execRegister(REGISTER_TYPE.ADAPTER_PAGE_CATEGORY_TYPE,param)
  // 创建适配器文件入口文件
  createAdapterMapFile(camelCase(code))
  // 在最外层适配器入口进行注册
  execRegister(REGISTER_TYPE.ADAPTER_ENTRY,param)
}


async function quickGenCategoryType(param) {
  execRegister(REGISTER_TYPE.PAGE_CATEGORY_TYPE,param)
  execRegister(REGISTER_TYPE.PAGE_CATEGORY_LIST, param)

  // 适配器注册
  quickGenCategoryTypeAdapter(param)
}

module.exports = {
  quickGenComponentTemplate,
  quickGenCategoryType,
  quickGenComponentTemplateAdapter,
  quickGenCategoryTypeAdapter
}
