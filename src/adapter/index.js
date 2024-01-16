const { getCrudAdapterData } = require("./crud");
const { getMenuAdapterData } = require("./menu");
const { getRouteAdapterData } = require("./route");
const { getRouteConstantAdapterData } = require("./routeConstant");
const { getServiceAdapterData } = require("./service");
const { getProjectAdapterData } = require("./project");

module.exports = {
  getCrudAdapterData,
  getServiceAdapterData,
  getMenuAdapterData,
  getRouteAdapterData,
  getRouteConstantAdapterData,
  getProjectAdapterData
}