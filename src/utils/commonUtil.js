// 包含null,undefined,Symbol,string,number,boolean,BigInt
function isSimpleValue(value) {
    return value === null || value === undefined || (typeof value !== 'object');
}
// 判断是否为对象
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

module.exports = {
    isSimpleValue,
    isObject
}