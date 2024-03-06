const { PAGE_TYPE_ENUM } = require("../../enum/pageType")
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
    let labelType = label
    if (!PAGE_ADAPTER_MAP[label]) {
        labelType = PAGE_TYPE_ENUM.EMPTY
    }
    const pagesCode = await PAGE_ADAPTER_MAP[labelType](page)
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