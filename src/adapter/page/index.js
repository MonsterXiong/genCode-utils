const { isObject } = require("../../utils/commonUtil")
const { PAGE_ADAPTER_MAP } = require("./pageAdapterMap")
function initPageData(pageData) {
    if (Array.isArray(pageData)) {
        return pageData
    } else if (isObject(pageData)) {
        return [pageData]
    } else {
        throw new Error('pageData 不符合要求')
    }
}

async function getPagesCode(page) {
    const { pageInfo: { label } } = page
    const pagesCode = await PAGE_ADAPTER_MAP[label](page)
    return pagesCode
}

async function getPageAdapterData(pageData) {
    const pageList = initPageData(pageData)
    const pagesCode = []
    for await (const page of pageList) {
        pagesCode.push(await getPagesCode(page))
    }
    return pagesCode
}



module.exports = {
    getPageAdapterData
}