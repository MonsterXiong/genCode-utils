const changeCase = require('change-case')
const { nanoid } = require('nanoid')

const { getDialog } = require("./getDialog");
const { getEntry } = require("./getEntry");
const { getQuery } = require("./getQuery");
const { getTable } = require("./getTable");

function getCrudAdapterData(sourceData) {
  const { menuInfo, functionList, elementList } = sourceData
  const { code: menuCode } = menuInfo
  const dirpath = menuCode ? menuCode : nanoid()
  const template = menuInfo.pageInfo.type
  const fileParam = { dirpath: changeCase.camelCase(dirpath), template }
  return {
    services:[],
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