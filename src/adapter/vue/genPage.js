const { callMethod } = require("./callMethod")
const { callWatch } = require("./callWatch")
const { getTab } = require("../../common")

function genTemplate(template){
  // 从模板中获取
  // let code = `<template>`
  // code +=`${template}`
  // code += `\n</template>\n`
  // return code
  return template +'\n'
}
function isEmpty(list){
  return Array.isArray(list) && list.length > 0
}

function getScript(script){
  const { importList } = script
  let code = `<script>\n`
  if(isEmpty(importList)){
    code += genImport(importList)
  }
  code +=`export default {${getDefaultContent(script)}\n}`
  code += `\n</script>`
  return code
}

function getPage(scriptData){
  const {template,script} = scriptData
  let code = genTemplate(template) || ''
  code += getScript(script)
  return code
}
function genImport(list=[]){
  return list.reduce((res,item)=>res+=`${getImport(item)}\n`,'')
}
function getDefaultContent(scriptData) {
  const {name,dataList,componentList,watchList,methodList,mountList,propList} = scriptData
  let code = ""
  if (name){
    code += `\n${getTab()}name: '${name}',`
  }
  if(isEmpty(propList)){
    code += formatScriptAttr('props',':',getData(propList,2))
  }
  if(isEmpty(componentList)){
    code += formatScriptAttr('components',':',getComponent(componentList))
  }
  if(isEmpty(dataList)){
    code += `\n${getTab()}data() {\n${getTab(2)}return {\n${getData(dataList,3)}${getTab(2)}\n${getTab(2)}}\n${getTab()}},`
  }
  if(isEmpty(watchList)){
    code += formatScriptAttr('watch',':',getWatch(watchList))
  }
  if(isEmpty(mountList)){
    code += formatScriptAttr('async mounted','()',getMount(mountList))
  }
  if(isEmpty(methodList)){
    code += formatScriptAttr('methods',':',getMethod(methodList))
  }
  return code
}
function formatScriptAttr(attr,symbol,content){
  return `\n${getTab()}${attr}${symbol} {\n${content ? content : ''}\n${getTab()}},`
}
function getWatch(list=[]){
  return list.reduce((res,item,index,arr)=>res+=`${getWatchItem(item)}${index!==arr.length-1?'\n':''}`,'')
}
function getWatchItem(watch){
  const { type }= watch
  const specialWatchMap = callWatch()
  const action = specialWatchMap[type]
  if(typeof action !== 'function'){
    console.log('暂时不支持该类型',type);
    return
  }
  return action(watch)
}
function getComponent(list=[]){
  return list.reduce((res,item,index,arr)=>res+=`${getTab(2)}${item},${index!==arr.length-1?'\n':''}`,'')
}
function getMount(mountList=[]){
  let res = ''
  mountList.forEach((item,index)=>{
    if(item.type == 'callMethod'){
      res+=`${getTab(2)}${item.isAwait?'await':''} this.${item.content}()${index!=mountList.length-1?'\n':''}`
    }
  })
  return res
}
function getData(list=[],indent){
  return list.reduce((res,item,index,arr)=>res+=`${getTab(indent)}${item.name}: ${getDataItem(item,indent)},${index!==arr.length-1?'\n':''}`,'')
}
function getDataItem(dataItem,indent){
  const {name,type,initValue} = dataItem
  if(type == 'object'){
    if(Array.isArray(initValue) && initValue.length){
      let result = `{\n`
      initValue.forEach((item)=>{
        result+=`${getTab(indent+1)}${item.name}: ${getDataItem(item)},\n`
      })
      result += `${getTab(indent)}}`
      return result
    }
  }
  if(type == 'array'){
    if(Array.isArray(initValue) && initValue.length){
      let result = `[`
      initValue.forEach(item=>{
        result+=genDataItem(item)
      })
      result += `],`
    }
  }
  return `${initValue}`
}
function getImport(importData){
  const {isDefault,from,content} = importData
  return `import ${isDefault?'':'{ '}${content}${isDefault?'':' }'} from '${from}'`
}
function getMethod(list=[]){
  return list.reduce((res,item,index,arr)=>res+=`${getMethodItem(item)}${index!==arr.length-1?'\n':''}`,'')
}
function getMethodItem(method){
  const {type}= method
  const specialMethodMap = callMethod()
  const action = specialMethodMap[type]
  if(typeof action !== 'function'){
    console.log('暂时不支持该类型',type);
    return
  }
  return action(method)
}


module.exports = {
  getPage,
}