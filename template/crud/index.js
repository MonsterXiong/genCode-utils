const changeCase = require('change-case')
const { nanoid } = require('nanoid')

const { getDialog } = require("./script/getDialog");
const { getEntry } = require("./script/getEntry");
const { getQuery } = require("./script/getQuery");
const { getTable } = require("./script/getTable");
const { getFormatRequestList } = require('../../src/common');
async function getCrudAdapterData(sourceData) {
  const { menuInfo, functionList, elementList,dataPriInfo } = sourceData
  const { code: menuCode } = menuInfo
  const dirpath = menuCode ? menuCode : nanoid()
  const template = menuInfo.pageInfo.type
  const fileParam = { dirpath: changeCase.camelCase(dirpath), template }
  return {
    services:getFormatRequestList(sourceData),
    pages:[
      await getQuery(fileParam, sourceData),
      await getDialog({ ...fileParam, name: 'editDialog' },sourceData),
      await getDialog({ ...fileParam, name: 'createDialog' },sourceData),
      await getTable(fileParam, sourceData),
      await getEntry(fileParam, sourceData)
    ].filter(item=>!!item)
  }
}

module.exports = {
  getCrudAdapterData
}