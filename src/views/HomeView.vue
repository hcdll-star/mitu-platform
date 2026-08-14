<template>
  <div>
    <!-- ====== 顶部 Banner ====== -->
    <el-card shadow="never" style="background: linear-gradient(135deg, #0b2b5c 0%, #1a4f8a 100%); border: none; border-radius: 16px; padding: 40px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <div style="color: white;">
          <h1 style="font-size: 36px; margin: 0; letter-spacing: 2px;">🔐 密途</h1>
          <p style="font-size: 18px; opacity: 0.85; margin: 10px 0 5px;">
            商用密码职业标准知识图谱 · 能力自测科普平台
          </p>
          <p style="font-size: 14px; opacity: 0.6;">集职业查询 · 标准科普 · 能力测评 · 国密实训于一体</p>
        </div>
        <div style="display: flex; gap: 30px; background: rgba(255,255,255,0.1); padding: 20px 30px; border-radius: 12px; backdrop-filter: blur(4px);">
          <div style="text-align: center; color: white;">
            <div style="font-size: 28px; font-weight: bold; color: #ffd700;">{{ stats.jobs }}</div>
            <div style="font-size: 13px; opacity: 0.7;">收录岗位</div>
          </div>
          <el-divider direction="vertical" style="border-color: rgba(255,255,255,0.2);" />
          <div style="text-align: center; color: white;">
            <div style="font-size: 28px; font-weight: bold; color: #ffd700;">{{ stats.standards }}</div>
            <div style="font-size: 13px; opacity: 0.7;">商用密码标准</div>
          </div>
          <el-divider direction="vertical" style="border-color: rgba(255,255,255,0.2);" />
          <div style="text-align: center; color: white;">
            <div style="font-size: 28px; font-weight: bold; color: #ffd700;">{{ stats.users }}</div>
            <div style="font-size: 13px; opacity: 0.7;">已服务学员</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ====== 快速入口卡片 ====== -->
    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :span="6" v-for="item in quickEntries" :key="item.path">
        <el-card shadow="hover" style="cursor: pointer; border-radius: 12px; text-align: center; padding: 20px 10px;" @click="goTo(item.path)">
          <div style="font-size: 36px; line-height: 1.2;">{{ item.icon }}</div>
          <h3 style="margin: 12px 0 4px; color: #1a3c6e;">{{ item.name }}</h3>
          <p style="color: #999; font-size: 13px; margin: 0;">{{ item.desc }}</p>
          <el-tag size="small" type="primary" style="margin-top: 10px;">立即体验 →</el-tag>
        </el-card>
      </el-col>
    </el-row>

    <!-- ====== 下拉框 + 单选 + 超链接 示例展示区 ====== -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" style="border-radius: 12px; height: 100%;">
          <template #header>
            <span style="font-weight: bold;">📌 按岗位类型筛选</span>
          </template>
          <el-select v-model="selectedJobType" placeholder="请选择岗位类型" style="width: 100%;" clearable>
            <el-option v-for="item in jobTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <div style="margin-top: 12px; color: #666; font-size: 14px;">
            当前选择：<el-tag size="small">{{ selectedJobType || '未选择' }}</el-tag>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" style="border-radius: 12px; height: 100%;">
          <template #header>
            <span style="font-weight: bold;">⚡ 技能掌握程度</span>
          </template>
          <el-radio-group v-model="skillLevel" style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
            <el-radio label="beginner">入门级</el-radio>
            <el-radio label="intermediate">进阶级</el-radio>
            <el-radio label="expert">专家级</el-radio>
          </el-radio-group>
          <div style="margin-top: 12px; color: #666; font-size: 14px;">
            当前等级：<el-tag :type="skillLevelTagType">{{ skillLevelLabel }}</el-tag>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" style="border-radius: 12px; height: 100%;">
          <template #header>
            <span style="font-weight: bold;">🔗 快速链接</span>
          </template>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a href="#" @click.prevent="goTo('/jobs')" style="color: #1a4f8a; text-decoration: none; font-weight: 500;">
              📋 查看全部岗位 →
            </a>
            <a href="#" @click.prevent="goTo('/standards')" style="color: #1a4f8a; text-decoration: none; font-weight: 500;">
              📖 浏览商用密码标准 →
            </a>
            <a href="#" @click.prevent="goTo('/lab')" style="color: #1a4f8a; text-decoration: none; font-weight: 500;">
              🔐 在线国密实训 →
            </a>
            <a href="#" @click.prevent="goTo('/assessment')" style="color: #1a4f8a; text-decoration: none; font-weight: 500;">
              📝 能力自测 →
            </a>
            <el-divider style="margin: 4px 0;" />
            <a href="https://www.oscca.gov.cn/" target="_blank" style="color: #999; text-decoration: none; font-size: 13px;">
              国家密码管理局官网 ↗
            </a>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goTo = (path) => { router.push(path) }

// ===== 统计数字 =====
const stats = ref({
  jobs: 5,
  standards: 6,
  users: 1280
})

// ===== 快速入口 =====
const quickEntries = [
  { path: '/jobs', name: '岗位检索', icon: '🔍', desc: '查询密码行业岗位要求' },
  { path: '/standards', name: '标准查询', icon: '📚', desc: '检索GM/T商用密码标准' },
  { path: '/graph', name: '知识图谱', icon: '🕸️', desc: '岗位-技能-标准三维关联' },
  { path: '/lab', name: '国密实训', icon: '🔐', desc: 'SM2/SM3/SM4在线实操' }
]

// ===== 下拉框 =====
const selectedJobType = ref('')
const jobTypeOptions = [
  { label: '测评类岗位', value: 'assessment' },
  { label: '研发类岗位', value: 'dev' },
  { label: '管理类岗位', value: 'manage' },
  { label: '应用类岗位', value: 'apply' }
]

// ===== 单选 =====
const skillLevel = ref('intermediate')
const skillLevelLabel = computed(() => {
  const map = { beginner: '入门级', intermediate: '进阶级', expert: '专家级' }
  return map[skillLevel.value] || '未选择'
})
const skillLevelTagType = computed(() => {
  const map = { beginner: 'info', intermediate: 'warning', expert: 'success' }
  return map[skillLevel.value] || 'info'
})
</script>