const { isSimpleValue, isObject } = require("./commonUtil");

function uniqueArray(arr, objAttr) {
    if (!Array.isArray(arr)) {
        return
    }
    // 全为简单类型
    if (arr.every(item => isSimpleValue(item))) {
        return [...new Set(arr)]
    }
    // 全为数组对象
    if (arr.every(item => isObject(item))) {
        let labelMap = new Map();
        arr.forEach(item => {
            const attr = item[objAttr];
            if (!attr) {
                throw new Error('请指定去重的key')
            }
            if (!labelMap.has(attr)) {
                labelMap.set(attr, item);
            }
        })
        return Array.from(labelMap.values());
    }
    throw new Error('请检查数据项，保持数组数据类型一致')
}

module.exports = {
    uniqueArray
}
