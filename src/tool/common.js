const { CONTENT_PLACE_HOLDER_STR } = require("./placeholderConstant")
function updateData(sourceContent, replaceContent, placeholderStr = CONTENT_PLACE_HOLDER_STR) {
    // 是否存在替换的内容,存在则覆盖更新,不存在则在占位符出进行更新
    const replaceContentIndex = sourceContent.indexOf(replaceContent)
    let updateContent = replaceContent + '\n'
    if (placeholderStr == CONTENT_PLACE_HOLDER_STR) {
        updateContent += `\t`
    }
    if (replaceContentIndex == -1) {
        updateContent += placeholderStr
        return sourceContent.replace(placeholderStr, updateContent)
    } else {
        updateContent += "// ------"
        return sourceContent.replace(replaceContent,updateContent)
    }
}


module.exports = {
    updateData
}