<template>
  <div style="padding: 20px;">
    <el-card style="border-radius: 12px;">
      <!-- ===== 页面头部 ===== -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <h2 style="color: #1a3c6e; margin: 0;">⚙️ 后台管理中心</h2>
          <p style="color: #999; margin: 5px 0 0;">
            管理平台数据 · 监控系统运行状态
          </p>
        </div>
        <el-tag type="success" size="large">🟢 系统运行正常</el-tag>
      </div>

      <!-- ===== 统计概览 ===== -->
      <el-row :gutter="15" style="margin: 20px 0;">
        <el-col :span="4" v-for="stat in stats" :key="stat.label">
          <el-card shadow="hover" style="text-align: center; border-radius: 10px;">
            <div style="font-size: 28px; font-weight: bold; color: stat.color;">{{ stat.count }}</div>
            <div style="color: #999; font-size: 13px;">{{ stat.label }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- ===== Tab 管理 ===== -->
      <el-tabs v-model="activeTab" style="margin-top: 10px;">
        <!-- ===== Tab1: 岗位管理 ===== -->
        <el-tab-pane label="📋 岗位管理" name="jobs">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="color: #999; font-size: 13px;">共 {{ jobData.length }} 个岗位</span>
            <el-button type="primary" size="small" @click="openAddDialog('job')">+ 新增岗位</el-button>
          </div>
          <el-table :data="jobData" stripe>
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="岗位名称" />
            <el-table-column prop="type" label="岗位类型" />
            <el-table-column prop="level" label="级别" />
            <el-table-column prop="skills" label="技能要求" min-width="180" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openEditDialog('job', row)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteItem('job', row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ===== Tab2: 标准管理 ===== -->
        <el-tab-pane label="📚 标准管理" name="standards">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="color: #999; font-size: 13px;">共 {{ standardData.length }} 项标准</span>
            <el-button type="primary" size="small" @click="openAddDialog('standard')">+ 新增标准</el-button>
          </div>
          <el-table :data="standardData" stripe>
            <el-table-column prop="id" label="标准编号" width="140" />
            <el-table-column prop="name" label="标准名称" />
            <el-table-column prop="category" label="分类" />
            <el-table-column prop="level" label="标准级别" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openEditDialog('standard', row)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteItem('standard', row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ===== Tab3: 题库管理 ===== -->
        <el-tab-pane label="📝 题库管理" name="questions">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="color: #999; font-size: 13px;">共 {{ questionData.length }} 道题目</span>
            <el-button type="primary" size="small" @click="openAddDialog('question')">+ 新增题目</el-button>
          </div>
          <el-table :data="questionData" stripe>
            <el-table-column prop="id" label="题号" width="60" />
            <el-table-column prop="dimension" label="维度" width="120" />
            <el-table-column prop="difficulty" label="难度" width="80" />
            <el-table-column prop="title" label="题目" min-width="200" />
            <el-table-column prop="answer" label="正确答案" width="120" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openEditDialog('question', row)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteItem('question', row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ===== Tab4: 科普内容管理 ===== -->
        <el-tab-pane label="📖 科普内容管理" name="science">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="color: #999; font-size: 13px;">共 {{ scienceData.length }} 条科普内容</span>
            <el-button type="primary" size="small" @click="openAddDialog('science')">+ 新增科普</el-button>
          </div>
          <el-table :data="scienceData" stripe>
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="title" label="标题" min-width="180" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已发布' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openEditDialog('science', row)">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteItem('science', row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ===== Tab5: 用户访问日志 ===== -->
        <el-tab-pane label="📊 用户访问日志" name="logs">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <span style="color: #999; font-size: 13px;">近7天访问记录</span>
            <el-button size="small" @click="refreshLogs">刷新</el-button>
          </div>
          <el-table :data="logData" stripe max-height="400">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="user" label="用户" width="120" />
            <el-table-column prop="page" label="访问页面" min-width="150" />
            <el-table-column prop="action" label="操作" width="120" />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ===== Tab6: 测评记录统计 ===== -->
        <el-tab-pane label="📈 测评记录" name="assessments">
          <div style="display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap;">
            <el-card shadow="hover" style="flex:1; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2d8cf0;">{{ assessmentStats.total }}</div>
              <div style="color: #999; font-size: 13px;">总测评次数</div>
            </el-card>
            <el-card shadow="hover" style="flex:1; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #67c23a;">{{ assessmentStats.avgScore }}</div>
              <div style="color: #999; font-size: 13px;">平均分</div>
            </el-card>
            <el-card shadow="hover" style="flex:1; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #e6a23c;">{{ assessmentStats.passRate }}%</div>
              <div style="color: #999; font-size: 13px;">通过率（≥60分）</div>
            </el-card>
            <el-card shadow="hover" style="flex:1; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #9b59b6;">{{ assessmentStats.users }}</div>
              <div style="color: #999; font-size: 13px;">参与人数</div>
            </el-card>
          </div>
          <el-table :data="assessmentRecords" stripe max-height="350">
            <el-table-column prop="time" label="测评时间" width="180" />
            <el-table-column prop="user" label="用户" width="120" />
            <el-table-column prop="score" label="得分" width="100">
              <template #default="{ row }">
                <el-tag :type="row.score >= 60 ? 'success' : 'danger'" size="small">
                  {{ row.score }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="correctCount" label="正确数" width="80" />
            <el-table-column prop="totalCount" label="总题数" width="80" />
            <el-table-column prop="level" label="等级" min-width="150" />
            <el-table-column prop="duration" label="用时(分钟)" width="100" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- ===== 新增/编辑弹窗 ===== -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="100px" style="padding-right: 20px;">
        <!-- 岗位表单 -->
        <template v-if="dialogType === 'job'">
          <el-form-item label="岗位名称">
            <el-input v-model="formData.name" placeholder="请输入岗位名称" />
          </el-form-item>
          <el-form-item label="岗位类型">
            <el-select v-model="formData.type" placeholder="请选择岗位类型" style="width: 100%;">
              <el-option label="测评类" value="测评类" />
              <el-option label="研发类" value="研发类" />
              <el-option label="管理类" value="管理类" />
              <el-option label="应用类" value="应用类" />
            </el-select>
          </el-form-item>
          <el-form-item label="岗位级别">
            <el-select v-model="formData.level" placeholder="请选择岗位级别" style="width: 100%;">
              <el-option label="初级" value="初级" />
              <el-option label="中级" value="中级" />
              <el-option label="高级" value="高级" />
              <el-option label="专家级" value="专家级" />
            </el-select>
          </el-form-item>
          <el-form-item label="技能要求">
            <el-input v-model="formData.skills" placeholder="多个技能用逗号分隔，如：SM2/SM3/SM4应用,密评方案编制" />
          </el-form-item>
        </template>

        <!-- 标准表单 -->
        <template v-if="dialogType === 'standard'">
          <el-form-item label="标准编号">
            <el-input v-model="formData.id" placeholder="如：GM/T 0054" />
          </el-form-item>
          <el-form-item label="标准名称">
            <el-input v-model="formData.name" placeholder="请输入标准名称" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%;">
              <el-option label="算法标准" value="算法标准" />
              <el-option label="测评标准" value="测评标准" />
              <el-option label="管理标准" value="管理标准" />
              <el-option label="基础标准" value="基础标准" />
              <el-option label="密评规范" value="密评规范" />
            </el-select>
          </el-form-item>
          <el-form-item label="标准级别">
            <el-select v-model="formData.level" placeholder="请选择标准级别" style="width: 100%;">
              <el-option label="国家标准" value="国家标准" />
              <el-option label="行业标准" value="行业标准" />
              <el-option label="推荐性国家标准" value="推荐性国家标准" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 题库表单 -->
        <template v-if="dialogType === 'question'">
          <el-form-item label="所属维度">
            <el-select v-model="formData.dimension" placeholder="请选择维度" style="width: 100%;">
              <el-option label="密码理论基础" value="密码理论基础" />
              <el-option label="国密算法掌握" value="国密算法掌握" />
              <el-option label="密评与合规" value="密评与合规" />
              <el-option label="标准规范认知" value="标准规范认知" />
              <el-option label="安全意识与实践" value="安全意识与实践" />
            </el-select>
          </el-form-item>
          <el-form-item label="难度">
            <el-select v-model="formData.difficulty" placeholder="请选择难度" style="width: 100%;">
              <el-option label="初级" value="初级" />
              <el-option label="中级" value="中级" />
              <el-option label="高级" value="高级" />
            </el-select>
          </el-form-item>
          <el-form-item label="题目">
            <el-input v-model="formData.title" type="textarea" :rows="2" placeholder="请输入题目" />
          </el-form-item>
          <el-form-item label="选项A">
            <el-input v-model="formData.optA" placeholder="请输入选项A" />
          </el-form-item>
          <el-form-item label="选项B">
            <el-input v-model="formData.optB" placeholder="请输入选项B" />
          </el-form-item>
          <el-form-item label="选项C">
            <el-input v-model="formData.optC" placeholder="请输入选项C" />
          </el-form-item>
          <el-form-item label="选项D">
            <el-input v-model="formData.optD" placeholder="请输入选项D" />
          </el-form-item>
          <el-form-item label="正确答案">
            <el-input v-model="formData.answer" placeholder="请输入完整正确答案文本" />
          </el-form-item>
          <el-form-item label="解析">
            <el-input v-model="formData.explanation" type="textarea" :rows="2" placeholder="请输入题目解析" />
          </el-form-item>
        </template>

        <!-- 科普内容表单 -->
        <template v-if="dialogType === 'science'">
          <el-form-item label="标题">
            <el-input v-model="formData.title" placeholder="请输入科普内容标题" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%;">
              <el-option label="密码科普" value="密码科普" />
              <el-option label="标准解读" value="标准解读" />
              <el-option label="职业指导" value="职业指导" />
              <el-option label="技术分享" value="技术分享" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容">
            <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="请输入科普内容正文" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%;">
              <el-option label="已发布" value="已发布" />
              <el-option label="草稿" value="草稿" />
            </el-select>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveItem">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ===== 状态 =====
const activeTab = ref('jobs')
const dialogVisible = ref(false)
const dialogType = ref('') // job | standard | question | science
const dialogMode = ref('add') // add | edit
const editId = ref(null)

// ===== 统计概览 =====
const stats = computed(() => [
  { label: '岗位数', count: jobData.value.length, color: '#2d8cf0' },
  { label: '标准数', count: standardData.value.length, color: '#19be6b' },
  { label: '题库数', count: questionData.value.length, color: '#ff9900' },
  { label: '科普内容', count: scienceData.value.length, color: '#9b59b6' },
  { label: '总访问量', count: logData.value.length + 120, color: '#e74c3c' },
  { label: '测评记录', count: assessmentRecords.value.length, color: '#1a3c6e' }
])

// ===== 岗位数据 =====
const jobData = ref([
  { id: 1, name: '密评工程师', type: '测评类', level: '中级', skills: 'SM2/SM3/SM4应用,密评方案编制,风险评估' },
  { id: 2, name: '密码产品研发工程师', type: '研发类', level: '中级', skills: 'Java/C++/Go,SM2/SM3/SM4算法实现,PKI/CA' },
  { id: 3, name: '密钥管理员', type: '管理类', level: '初级', skills: '密钥管理,访问控制,安全审计,HSM' },
  { id: 4, name: '密码技术应用员', type: '应用类', level: '初级', skills: '密码算法应用,系统集成,安全方案设计' },
  { id: 5, name: '商用密码检测人员', type: '测评类', level: '中级', skills: '密码检测,合规评估,测试工具使用' }
])

// ===== 标准数据 =====
const standardData = ref([
  { id: 'GM/T 0002', name: 'SM4 分组密码算法', category: '算法标准', level: '国家标准' },
  { id: 'GM/T 0003', name: 'SM2 椭圆曲线公钥密码算法', category: '算法标准', level: '国家标准' },
  { id: 'GM/T 0054', name: '信息系统密码应用基本要求', category: '测评标准', level: '行业标准' },
  { id: 'GM/T 0010', name: '密码设备应用接口规范', category: '基础标准', level: '行业标准' },
  { id: 'SJ/T 11818', name: '密码技术应用员 职业技能标准', category: '职业技能', level: '推荐性国家标准' }
])

// ===== 题库数据 =====
const questionData = ref([
  { id: 1, dimension: '密码理论基础', difficulty: '初级', title: '密码学中，以下哪个是"明文"的正确含义？', answer: '未经加密的原始信息', explanation: '明文是密码学中的基础概念...' },
  { id: 2, dimension: '国密算法掌握', difficulty: '初级', title: '以下哪个是我国自主设计的非对称密码算法？', answer: 'SM2', explanation: 'SM2是我国国家密码管理局发布的...' },
  { id: 3, dimension: '密评与合规', difficulty: '初级', title: '密评工作的核心依据标准是？', answer: 'GM/T 0054', explanation: 'GM/T 0054是密评工作的核心标准...' },
  { id: 4, dimension: '标准规范认知', difficulty: '中级', title: '以下哪个标准规定了数字证书认证系统的密码协议？', answer: 'GM/T 0012', explanation: 'GM/T 0012规定了数字证书系统中...' },
  { id: 5, dimension: '安全意识与实践', difficulty: '中级', title: '密钥生命周期管理中，最关键的阶段是？', answer: '以上都重要', explanation: '密钥生命周期每个阶段都至关重要...' }
])

// ===== 科普内容数据 =====
const scienceData = ref([
  { id: 1, title: '商用密码算法体系概述', category: '密码科普', status: '已发布', content: '我国商用密码算法体系由SM2/SM3/SM4等算法组成...' },
  { id: 2, title: '密评工作流程详解', category: '标准解读', status: '已发布', content: '密评工作包括测评准备、方案编制、现场测评...' },
  { id: 3, title: '密码职业发展路径指南', category: '职业指导', status: '草稿', content: '密码行业职业发展路径包括技术路线和管理路线...' },
  { id: 4, title: 'SM4算法在物联网中的应用', category: '技术分享', status: '已发布', content: 'SM4算法在物联网设备数据加密中发挥重要作用...' }
])

// ===== 用户访问日志 =====
const logData = ref([
  { time: '2026-08-14 14:23:05', user: '匿名用户', page: '首页', action: '浏览', ip: '192.168.1.101', status: '成功' },
  { time: '2026-08-14 14:20:12', user: '张同学', page: '岗位检索', action: '搜索', ip: '192.168.1.102', status: '成功' },
  { time: '2026-08-14 14:15:33', user: '李同学', page: '能力测评', action: '提交测评', ip: '192.168.1.103', status: '成功' },
  { time: '2026-08-14 14:10:48', user: '王同学', page: '知识图谱', action: '点击节点', ip: '192.168.1.104', status: '成功' },
  { time: '2026-08-14 14:05:22', user: '匿名用户', page: '国密实训', action: 'SM4加密', ip: '192.168.1.105', status: '成功' },
  { time: '2026-08-14 13:58:10', user: '赵同学', page: '标准查询', action: '筛选', ip: '192.168.1.106', status: '失败' },
  { time: '2026-08-14 13:50:45', user: '刘同学', page: '后台管理', action: '登录', ip: '192.168.1.107', status: '成功' }
])

// ===== 测评记录 =====
const assessmentRecords = ref([
  { time: '2026-08-14 14:15:33', user: '李同学', score: 85, correctCount: 17, totalCount: 20, level: '良好', duration: 12 },
  { time: '2026-08-14 13:30:20', user: '张同学', score: 55, correctCount: 11, totalCount: 20, level: '待加强', duration: 18 },
  { time: '2026-08-14 12:10:45', user: '王同学', score: 92, correctCount: 18, totalCount: 20, level: '优秀', duration: 9 },
  { time: '2026-08-13 16:45:12', user: '赵同学', score: 68, correctCount: 13, totalCount: 20, level: '良好', duration: 14 },
  { time: '2026-08-13 15:20:08', user: '刘同学', score: 45, correctCount: 9, totalCount: 20, level: '待加强', duration: 20 }
])

// ===== 测评统计 =====
const assessmentStats = computed(() => {
  const total = assessmentRecords.value.length
  if (total === 0) return { total: 0, avgScore: 0, passRate: 0, users: 0 }
  const sum = assessmentRecords.value.reduce((s, r) => s + r.score, 0)
  const pass = assessmentRecords.value.filter(r => r.score >= 60).length
  const users = new Set(assessmentRecords.value.map(r => r.user)).size
  return {
    total: total,
    avgScore: Math.round(sum / total),
    passRate: Math.round((pass / total) * 100),
    users: users
  }
})

// ===== 表单数据 =====
const formData = reactive({
  name: '',
  type: '',
  level: '',
  skills: '',
  id: '',
  category: '',
  dimension: '',
  difficulty: '',
  title: '',
  optA: '',
  optB: '',
  optC: '',
  optD: '',
  answer: '',
  explanation: '',
  content: '',
  status: ''
})

// ===== 弹窗标题 =====
const dialogTitle = computed(() => {
  const mode = dialogMode.value === 'add' ? '新增' : '编辑'
  const map = { job: '岗位', standard: '标准', question: '题目', science: '科普内容' }
  return `${mode}${map[dialogType.value] || ''}`
})

// ===== 打开新增弹窗 =====
const openAddDialog = (type) => {
  dialogType.value = type
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// ===== 打开编辑弹窗 =====
const openEditDialog = (type, row) => {
  dialogType.value = type
  dialogMode.value = 'edit'
  editId.value = row.id
  resetForm()

  if (type === 'job') {
    formData.name = row.name
    formData.type = row.type
    formData.level = row.level
    formData.skills = row.skills
  } else if (type === 'standard') {
    formData.id = row.id
    formData.name = row.name
    formData.category = row.category
    formData.level = row.level
  } else if (type === 'question') {
    formData.dimension = row.dimension
    formData.difficulty = row.difficulty
    formData.title = row.title
    formData.answer = row.answer
    formData.explanation = row.explanation || ''
    // 选项中如果有逗号分隔，尝试拆分
    if (row.options) {
      const opts = row.options.split(',')
      formData.optA = opts[0] || ''
      formData.optB = opts[1] || ''
      formData.optC = opts[2] || ''
      formData.optD = opts[3] || ''
    }
  } else if (type === 'science') {
    formData.title = row.title
    formData.category = row.category
    formData.content = row.content
    formData.status = row.status
  }

  dialogVisible.value = true
}

// ===== 重置表单 =====
const resetForm = () => {
  formData.name = ''
  formData.type = ''
  formData.level = ''
  formData.skills = ''
  formData.id = ''
  formData.category = ''
  formData.dimension = ''
  formData.difficulty = ''
  formData.title = ''
  formData.optA = ''
  formData.optB = ''
  formData.optC = ''
  formData.optD = ''
  formData.answer = ''
  formData.explanation = ''
  formData.content = ''
  formData.status = ''
}

// ===== 保存 =====
const saveItem = () => {
  const type = dialogType.value

  if (type === 'job') {
    if (!formData.name) return ElMessage.warning('请输入岗位名称')
    if (dialogMode.value === 'add') {
      const newId = Math.max(...jobData.value.map(j => j.id)) + 1
      jobData.value.push({
        id: newId,
        name: formData.name,
        type: formData.type || '未分类',
        level: formData.level || '初级',
        skills: formData.skills || ''
      })
      ElMessage.success('新增岗位成功')
    } else {
      const item = jobData.value.find(j => j.id === editId.value)
      if (item) {
        item.name = formData.name
        item.type = formData.type || item.type
        item.level = formData.level || item.level
        item.skills = formData.skills || item.skills
        ElMessage.success('编辑岗位成功')
      }
    }
  } else if (type === 'standard') {
    if (!formData.id || !formData.name) return ElMessage.warning('请填写标准编号和名称')
    if (dialogMode.value === 'add') {
      standardData.value.push({
        id: formData.id,
        name: formData.name,
        category: formData.category || '未分类',
        level: formData.level || '行业标准'
      })
      ElMessage.success('新增标准成功')
    } else {
      const item = standardData.value.find(s => s.id === editId.value)
      if (item) {
        item.id = formData.id
        item.name = formData.name
        item.category = formData.category || item.category
        item.level = formData.level || item.level
        ElMessage.success('编辑标准成功')
      }
    }
  } else if (type === 'question') {
    if (!formData.title || !formData.answer) return ElMessage.warning('请填写题目和正确答案')
    const options = [formData.optA, formData.optB, formData.optC, formData.optD].filter(o => o)
    if (options.length < 2) return ElMessage.warning('请至少填写2个选项')
    if (dialogMode.value === 'add') {
      const newId = Math.max(...questionData.value.map(q => q.id), 0) + 1
      questionData.value.push({
        id: newId,
        dimension: formData.dimension || '未分类',
        difficulty: formData.difficulty || '初级',
        title: formData.title,
        options: options.join(','),
        answer: formData.answer,
        explanation: formData.explanation || ''
      })
      ElMessage.success('新增题目成功')
    } else {
      const item = questionData.value.find(q => q.id === editId.value)
      if (item) {
        item.dimension = formData.dimension || item.dimension
        item.difficulty = formData.difficulty || item.difficulty
        item.title = formData.title
        item.answer = formData.answer
        item.explanation = formData.explanation || item.explanation
        ElMessage.success('编辑题目成功')
      }
    }
  } else if (type === 'science') {
    if (!formData.title || !formData.content) return ElMessage.warning('请填写标题和内容')
    if (dialogMode.value === 'add') {
      const newId = Math.max(...scienceData.value.map(s => s.id), 0) + 1
      scienceData.value.push({
        id: newId,
        title: formData.title,
        category: formData.category || '密码科普',
        content: formData.content,
        status: formData.status || '草稿'
      })
      ElMessage.success('新增科普内容成功')
    } else {
      const item = scienceData.value.find(s => s.id === editId.value)
      if (item) {
        item.title = formData.title
        item.category = formData.category || item.category
        item.content = formData.content
        item.status = formData.status || item.status
        ElMessage.success('编辑科普内容成功')
      }
    }
  }

  dialogVisible.value = false
}

// ===== 删除 =====
const deleteItem = (type, id) => {
  const nameMap = { job: '岗位', standard: '标准', question: '题目', science: '科普内容' }
  ElMessageBox.confirm(`确定要删除该${nameMap[type]}吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (type === 'job') {
      jobData.value = jobData.value.filter(j => j.id !== id)
    } else if (type === 'standard') {
      standardData.value = standardData.value.filter(s => s.id !== id)
    } else if (type === 'question') {
      questionData.value = questionData.value.filter(q => q.id !== id)
    } else if (type === 'science') {
      scienceData.value = scienceData.value.filter(s => s.id !== id)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// ===== 刷新日志 =====
const refreshLogs = () => {
  ElMessage.success('日志已刷新')
}

// ===== 初始化 =====
onMounted(() => {
  // 加载完成提示
})
</script>