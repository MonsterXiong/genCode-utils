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
}

const REGISTER_MAP = {
  [REGISTER_TYPE.PAGE_TYPE]: {
    filePath: formatPath('pages/tool/genCode/constant/pageType.js'),
    getContent: getPageTypeContent,
  },
  [REGISTER_TYPE.PAGE_LIST]: {
    filePath: formatPath('pages/tool/genCode/constant/pageList.js'),
    getContent: getPageListContent,
  },
  [REGISTER_TYPE.TEMPLATE_MAP]: {
    filePath: formatPath('pages/tool/genCode/pageDesign/template/index.js'),
    getContent: getTemplateMapContent,
  },
  [REGISTER_TYPE.PAGE_CATEGORY_TYPE]: {
    filePath: formatPath('pages/tool/genCode/constant/pageCategoryType.js'),
    getContent: getPageCategoryTypeContent,
  },
  [REGISTER_TYPE.PAGE_CATEGORY_LIST]: {
    filePath: formatPath('pages/tool/genCode/constant/pageCategoryList.js'),
    getContent: getPageCategoryListContent,
  },
}
function transformCode(code) {
  return {
      camelCaseCode: camelCase(code),
      constantCaseCode: constantCase(code),
      pascalCaseCode: pascalCase(code),
  }
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

function createComponentTemplateFile(filename, fileContent) {
  const filepath = formatPath(`pages/tool/genCode/pageDesign/template/${filename}.vue`)
  fse.ensureFileSync(filepath)
  fs.writeFileSync(filepath, fileContent)
}

function execRegister(type,param,option){
  const {filePath,getContent} = REGISTER_MAP[type]
  register(filePath, getContent(param),option)
}


async function quickGenComponentTemplate(param) {
  const { code,name } = param
  const {pascalCaseCode,camelCaseCode} = transformCode(code)
  const filename = `${camelCaseCode}/${pascalCaseCode}`
  const templateFileContent = `<template>\n    <div>${code}-${name}</div>\n</template>`
  createComponentTemplateFile(filename,templateFileContent)
  execRegister(REGISTER_TYPE.PAGE_TYPE,param)
  execRegister(REGISTER_TYPE.PAGE_LIST,param)
  execRegister(REGISTER_TYPE.TEMPLATE_MAP,param)
  // 创建文件夹以及文件
}


async function quickGenCategoryType(param) {
  execRegister(REGISTER_TYPE.PAGE_CATEGORY_TYPE,param)
  execRegister(REGISTER_TYPE.PAGE_CATEGORY_LIST,param)
}

module.exports = {
  quickGenComponentTemplate,
  quickGenCategoryType
}
