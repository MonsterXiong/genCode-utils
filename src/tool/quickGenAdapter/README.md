# quickGenAdapter
参数：传入type和name
用于快速生成适配器的架子

type:如果是page，则会在adapter/page下生成一个新的页面组件适配目录和文件，同时会在adapter/page/getPagesCode.js下注册;否则会直接生成项目下的适配器，即在adapter/index.js下生成一个新的目录的文件，同时在adapter/index.js进行适配器注册