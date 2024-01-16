const { getTab } = require("../../common")


function getEntryPageInfo(watch){
  return `${getTab(2)}pageInfo: {
      handler(newValue) {
        this.queryTableData()
      },
      deep: true,
    },`
}

function callWatch(){
  return {
    'entryPageInfo':(watch)=>getEntryPageInfo(watch),
  }
}


module.exports= {
  callWatch
}