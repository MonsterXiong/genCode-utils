const templateDataMap = {
  'crud':{
    'query':`
  <el-form :model="queryForm" size="small" :inline="true" class="query-form-container">
    <el-form-item label="职称" prop="name">
      <el-input v-model.trim="formData.name" placeholder="请输入职称"></el-input>
    </el-form-item>
    <el-form-item label="职称等级" prop="level">
      <el-select v-model="formData.level" clearable placeholder="请输入职称等级">
        <el-option v-for="item in $root.getEnumByCode(dictCategory.TITLE_LEVEL) || []" :key="item.code" :label="item.name" :value="item.code"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <div class="btn-container">
        <el-button type="primary" icon="el-icon-search" @click="onQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="onReset">重置</el-button>
        <el-button type="success" icon="el-icon-circle-plus-outline" @click="onAdd">新增</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="onBatchDelete">批量删除</el-button>
      </div>
    </el-form-item>
  </el-form>`,
    'dialog':`
  <base-dialog :title="title" :visible.sync="dialogVisible" :before-close="handleDialogClose" :width="dialogWidth">
    <el-form ref="formRef" :model="formData" :rules="formDataRules" label-width="auto" size="small">
      <el-form-item label="职称" prop="name">
        <el-input v-model.trim="formData.name" placeholder="请输入职称"></el-input>
      </el-form-item>
      <el-form-item label="职称等级" prop="level">
        <el-select v-model="formData.level" clearable placeholder="请输入职称等级">
          <el-option v-for="item in $root.getEnumByCode(dictCategory.TITLE_LEVEL) || []" :key="item.code" :label="item.name" :value="item.code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model.trim="formData.description" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button size="mini" @click="handleDialogClose">取 消</el-button>
      <el-button size="mini" type="primary" @click="handleSubmitForm">确 定</el-button>
    </template>
  </base-dialog>`,
    'table':`
  <div class="common-container" ref="tableRef">
    <el-table :data="tableData" :height="tableHeight" size="mini" border style="width: 100%" v-bind="$attrs" v-on="$listeners">
      <el-table-column prop="name" align="center" label="职称">
      </el-table-column>
      <el-table-column prop="level" align="center" label="职称等级">
        <template slot-scope="scope">
          {{ $root.getEnumMeaning(dictCategory.TITLE_LEVEL, scope.row.level) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right">
        <template slot-scope="scope">
          <el-button @click="onEdit(scope.row)" type="text" size="small">编辑</el-button>
          <el-button @click="onDelete(scope.row)" class="delete-btn" type="text" size="small">删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrapper" ref="paginationRef">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageInfo.page"
        :page-sizes="[10, 20, 50, 100, 200]"
        :page-size="pageInfo.rows"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>`,
    'index':`
  <BasePage>
    <template #query>
      <ExpertProfessionalTitle0Query
        @onAdd="onAdd"
        @onQuery="queryTableData"
        @onBatchDelete="onBatchDelete"
        @onReset="onReset"
        :queryForm.sync="queryForm"
      ></ExpertProfessionalTitle0Query>
    </template>

    <ExpertProfessionalTitle0Table
      @selection-change="onSelectionChange"
      :pageInfo.sync="pageInfo"
      :tableData="tableData"
      :total="total"
      @onEdit="onEdit"
      @onDelete="onDelete"
    ></ExpertProfessionalTitle0Table>

    <ExpertProfessionalTitle0Dialog ref="dialogRef" @refresh="queryTableData"></ExpertProfessionalTitle0Dialog>
  </BasePage>`,
  }
}

module.exports = {
  templateDataMap
}