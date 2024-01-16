const changeCase = require('change-case')
// 包含null,undefined,Symbol,string,number,boolean,BigInt
function isSimpleValue(value) {
    return value === null || value === undefined || (typeof value !== 'object');
}
// 判断是否为对象
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

function pascalCase(str){
    return changeCase.pascalCase(str)
}
function camelCase(str){
    return changeCase.camelCase(str)
}
function constantCase(str){
    return changeCase.constantCase(str)
}

module.exports = {
    isSimpleValue,
    isObject,
    pascalCase,
    camelCase,
    constantCase
}