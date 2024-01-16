const crudAdapterData = [{
  filename: 'TestQuery',
  filetype: 'component',
  filepath: 'components/TestQuery.vue',
  dirpath: 'test',
  type: 'query',
  template: 'crud',
  params: {
    template: "",
    script: {
      name: 'TestQuery',
      importList: [],
      propList: [{
        name: 'queryForm',
        type: 'object',
        initValue: '{}',
      }],
      dataList: [],
      mountList: [],
      methodList: [{
        type: 'emit',
        name: 'onQuery',
        content: '',
        param: '',
      }, {
        type: 'emit',
        name: 'onAdd',
        content: '',
        param: '',
      }, {
        type: 'emit',
        name: 'onReset',
        content: '',
        param: '',
      }, {
        type: 'emit',
        name: 'onBatchDelete',
        content: '',
        param: '',
      }],
      componentList: [],
    }
  }
},
{
  filename: 'TestEditDialog',
  filetype: 'component',
  filepath: 'components/TestEditDialog.vue',
  dirpath: 'test',
  type: 'dialog',
  template: 'crud',
  params: {
    // template: templateDataMap['crud']['dialog'],
    template: "",
    script: {
      name: 'TestEditDialog',
      importList: [{
        isDefault: false,
        from: '@/common/constants',
        content: 'CommonDialogWidth, dictCategory'
      }, {
        isDefault: false,
        from: '@/services',
        content: 'TestService'
      }, {
        isDefault: true,
        from: '@/utils/tools',
        content: 'tools'
      }],
      propList: [],
      dataList: [{
        name: 'dialogWidth',
        type: 'string',
        initValue: 'CommonDialogWidth.smallForm',
      }, {
        name: 'dialogVisible',
        type: 'boolean',
        initValue: 'false',
      }, {
        name: 'title',
        type: 'string',
        initValue: '新增',
      }, {
        name: 'row',
        type: 'null',
        initValue: 'null',
      }, {
        name: 'formData',
        type: 'object',
        initValue: [{
          name: 'name',
          type: 'string',
          initValue: '""'
        }],
      }, {
        name: 'dictCategory',
        type: 'string',
        initValue: 'dictCategory',
      }],
      mountList: [],
      methodList: [{
        type: 'dialogShow',
        name: 'show',
        content: "",
        param: "{ row,title }"
      }, {
        type: 'onDialogClose',
        name: 'onDialogClose',
        content: "",
        param: ""
      }, {
        type: 'onReset',
        name: 'onReset',
        content: "",
        param: ""
      }, {
        type: 'dialogSubmit',
        name: 'onSubmitForm',
        content: "",
        param: "",
        pri: 'testId',
        updateServiceName: 'TestService',
        updateInterfaceName: 'updateTest',
        insertServiceName: 'TestService',
        insertInterfaceName: 'insertTest',
      }],
      componentList: [],
    }
  }
},
{
  filename: 'TestCreateDialog',
  filetype: 'component',
  filepath: 'components/TestCreateDialog.vue',
  dirpath: 'test',
  type: 'dialog',
  template: 'crud',
  params: {
    template: "",
    script: {
      name: 'TestCreateDialog',
      importList: [{
        isDefault: false,
        from: '@/common/constants',
        content: 'CommonDialogWidth, dictCategory'
      }, {
        isDefault: false,
        from: '@/services',
        content: 'TestService'
      }, {
        isDefault: true,
        from: '@/utils/tools',
        content: 'tools'
      }],
      propList: [],
      dataList: [{
        name: 'dialogWidth',
        type: 'string',
        initValue: 'CommonDialogWidth.smallForm',
      }, {
        name: 'dialogVisible',
        type: 'boolean',
        initValue: 'false',
      }, {
        name: 'title',
        type: 'string',
        initValue: '新增',
      }, {
        name: 'row',
        type: 'null',
        initValue: 'null',
      }, {
        name: 'formData',
        type: 'object',
        initValue: [{
          name: 'name',
          type: 'string',
          initValue: '""'
        }],
      }, {
        name: 'dictCategory',
        type: 'string',
        initValue: 'dictCategory',
      }],
      mountList: [],
      methodList: [{
        type: 'dialogShow',
        name: 'show',
        content: "",
        param: "{ row,title }"
      }, {
        type: 'onDialogClose',
        name: 'onDialogClose',
        content: "",
        param: ""
      }, {
        type: 'onReset',
        name: 'onReset',
        content: "",
        param: ""
      }, {
        type: 'dialogSubmit',
        name: 'onSubmitForm',
        content: "",
        param: "",
        pri: 'testId',
        updateServiceName: 'TestService',
        updateInterfaceName: 'updateTest',
        insertServiceName: 'TestService',
        insertInterfaceName: 'insertTest',
      }],
      componentList: [],
    }
  }
},
{
  filename: 'TestTable',
  filetype: 'component',
  filepath: 'components/TestTable.vue',
  dirpath: 'test',
  type: 'table',
  template: 'crud',
  params: {
    template: "",
    script: {
      name: 'TestTable',
      importList: [{
        isDefault: false,
        from: '@/common/constants',
        content: 'dictCategory'
      }],
      propList: [{
        name: 'tableData',
        type: 'object',
        initValue: '{}',
      }, {
        name: 'total',
        type: 'object',
        initValue: '{}',
      }, {
        name: 'pageInfo',
        type: 'object',
        initValue: '{}',
      }],
      dataList: [{
        name: 'dictCategory',
        type: 'string',
        initValue: 'dictCategory',
      }, {
        name: 'tableHeight',
        type: 'string',
        initValue: `'500px'`,
      }],
      mountList: [{
        isAwait: false,
        type: 'callMethod',
        content: 'setHeight'
      }],
      methodList: [{
        type: 'setHeight',
        name: 'setHeight',
        content: "",
        param: ""
      }, {
        type: 'emit',
        name: 'onEdit',
        content: '',
        param: 'row',
      }, {
        type: 'emit',
        name: 'onDelete',
        content: '',
        param: 'row',
      }, {
        type: 'pageInfoChange',
        name: 'onSizeChange',
        content: '',
        param: 'rows',
      }, {
        type: 'pageInfoChange',
        name: 'onSizeChange',
        content: '',
        param: 'page',
      }],
      componentList: [],
    }
  }
},
{
  filename: 'TestManage',
  filetype: 'component',
  filepath: 'TestManage.vue',
  dirpath: 'test',
  type: 'index',
  template: 'crud',
  // scriptData
  params: {
    template: "",
    script: {
      name: 'TestManage',
      importList: [],
      propList: [],
      dataList: [],
      mountList: [],
      methodList: [],
      componentList: [],
    }
  }
}]
