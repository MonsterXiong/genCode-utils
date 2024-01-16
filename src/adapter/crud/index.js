const { nanoid } = require('nanoid')
const { getDialog } = require("./getDialog");
const { getEntry } = require("./getEntry");
const { getQuery } = require("./getQuery");
const { getTable } = require("./getTable");
const { getFormatRequestList } = require('../../common');
const { camelCase } = require('../../utils/commonUtil');
const { PAGE_TYPE_ENUM } = require('../../enum');
async function getCrudAdapterData(sourceData) {
  const { menuInfo, functionList, elementList } = sourceData
  const { code: menuCode } = menuInfo
  const dirpath = menuCode ? menuCode : nanoid()
  const template = PAGE_TYPE_ENUM.CRUD
  const fileParam = { dirpath: camelCase(dirpath), template }
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