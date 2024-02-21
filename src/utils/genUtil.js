const { nanoid } = require('nanoid')
const { camelCase, pascalCase } = require('./commonUtil');

function getInitParam(menuInfo, defaultTemplate) {
    const { code, pageInfo } = menuInfo
    const dirpath = code ? code : nanoid()
    const template = pageInfo?.type || defaultTemplate
    const fileParam = { dirpath: camelCase(dirpath), template }
    return {
        dirpath,
        template,
        fileParam
    }
}


function outputPageInfo(menuInfo){
    const {name,pageInfo} = menuInfo
    const {label,name:componentInstance} = pageInfo
    console.log('------------------------------');
    console.log('当前页面为：',name);
    console.log('页面的组件类型为：',label);
    console.log('组件实例名称是：',componentInstance);
  }

module.exports = {
    getInitParam,
    outputPageInfo
}