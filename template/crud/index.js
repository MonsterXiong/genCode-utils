const changeCase = require('change-case')
const { nanoid } = require('nanoid')

const { getDialog } = require("./script/getDialog");
const { getEntry } = require("./script/getEntry");
const { getQuery } = require("./script/getQuery");
const { getTable } = require("./script/getTable");
const { getFormatRequestList } = require('../../src/common');
function getCrudAdapterData(sourceData) {
  const { menuInfo, functionList, elementList,dataPriInfo } = sourceData
  const { code: menuCode } = menuInfo
  const dirpath = menuCode ? menuCode : nanoid()
  const template = menuInfo.pageInfo.type
  const fileParam = { dirpath: changeCase.camelCase(dirpath), template }
  return {
    services:getFormatRequestList(sourceData),
    pages:[
      getQuery(fileParam, sourceData),
      getDialog({ ...fileParam, name: 'editDialog' }),
      getDialog({ ...fileParam, name: 'createDialog' }),
      getTable(fileParam, sourceData),
      getEntry(fileParam, sourceData)
    ]
  }
}

module.exports = {
  getCrudAdapterData
}