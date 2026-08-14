<template>
  <div style="padding: 20px;">
    <el-card style="border-radius: 12px;">
      <!-- 页面头部 -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <h2 style="color: #1a3c6e; margin: 0;">🕸️ 岗位-技能-标准 三维知识图谱</h2>
          <p style="color: #999; margin: 5px 0 0;">
            选择岗位自动匹配所需标准与技能 · 查询标准展示关联岗位
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <el-tag type="info">岗位 {{ allNodes.filter(n => n.category === 0).length }} 个</el-tag>
          <el-tag type="success">技能 {{ allNodes.filter(n => n.category === 1).length }} 个</el-tag>
          <el-tag type="warning">标准 {{ allNodes.filter(n => n.category === 2).length }} 个</el-tag>
        </div>
      </div>

      <!-- 双向联动面板 -->
      <el-row :gutter="20" style="margin: 20px 0;">
        <!-- 左侧：岗位 → 标准匹配 -->
        <el-col :span="12">
          <el-card shadow="hover" style="border-radius: 10px; height: 100%;">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: #1a3c6e;">🔍 岗位 → 标准匹配</span>
                <el-tag size="small" type="primary">选择岗位自动匹配</el-tag>
              </div>
            </template>
            <el-select
              v-model="selectedJob"
              placeholder="请选择密码岗位..."
              style="width: 100%;"
              @change="onJobSelect"
              clearable
            >
              <el-option
                v-for="job in jobList"
                :key="job.id"
                :label="job.name"
                :value="job.id"
              />
            </el-select>

            <div v-if="selectedJobData" style="margin-top: 16px;">
              <el-divider />
              <h4 style="color: #1a3c6e; margin: 0 0 8px 0;">📋 匹配结果</h4>
              <div style="margin-bottom: 10px;">
                <span style="font-size: 13px; color: #666;">必备技能：</span>
                <el-tag v-for="skill in selectedJobData.skills" :key="skill" size="small" type="success" style="margin: 2px;">{{ skill }}</el-tag>
              </div>
              <div>
                <span style="font-size: 13px; color: #666;">对应标准：</span>
                <el-tag v-for="std in selectedJobData.standards" :key="std" size="small" type="warning" style="margin: 2px; cursor: pointer;" @click="onStandardClick(std)">{{ std }}</el-tag>
              </div>
              <div style="margin-top: 10px;">
                <span style="font-size: 13px; color: #666;">晋升路线：</span>
                <el-text size="small" type="info">{{ selectedJobData.career }}</el-text>
              </div>
              <el-button type="primary" size="small" style="margin-top: 12px; width: 100%;" @click="focusGraph(selectedJobData.name, 'job')">图谱中高亮此岗位 →</el-button>
            </div>
            <div v-else style="text-align: center; color: #999; padding: 30px 0;">
              <p>👆 请从上方选择岗位</p>
              <p style="font-size: 13px;">系统将自动匹配必备标准与技能要求</p>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：标准 → 岗位关联 -->
        <el-col :span="12">
          <el-card shadow="hover" style="border-radius: 10px; height: 100%;">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: #1a3c6e;">📚 标准 → 岗位查询</span>
                <el-tag size="small" type="warning">查询标准展示关联岗位</el-tag>
              </div>
            </template>
            <el-select
              v-model="selectedStandard"
              placeholder="请选择商用密码标准..."
              style="width: 100%;"
              @change="onStandardSelect"
              clearable
            >
              <el-option
                v-for="std in standardList"
                :key="std.id"
                :label="std.id + ' ' + std.name"
                :value="std.id"
              />
            </el-select>

            <div v-if="selectedStandardData" style="margin-top: 16px;">
              <el-divider />
              <h4 style="color: #1a3c6e; margin: 0 0 8px 0;">👤 关联岗位</h4>
              <div>
                <span style="font-size: 13px; color: #666;">要求掌握此标准的岗位：</span>
                <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px;">
                  <el-tag v-for="job in selectedStandardData.relatedJobs" :key="job" size="large" type="primary" style="cursor: pointer;" @click="onJobClick(job)">{{ job }}</el-tag>
                </div>
              </div>
              <div style="margin-top: 10px;">
                <span style="font-size: 13px; color: #666;">标准解读：</span>
                <el-text size="small" type="info" style="display: block; margin-top: 4px;">{{ selectedStandardData.explanation }}</el-text>
              </div>
              <el-button type="primary" size="small" style="margin-top: 12px; width: 100%;" @click="focusGraph(selectedStandard, 'standard')">图谱中高亮此标准 →</el-button>
            </div>
            <div v-else style="text-align: center; color: #999; padding: 30px 0;">
              <p>👆 请从上方选择标准</p>
              <p style="font-size: 13px;">系统将展示要求掌握此标准的所有岗位</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- ECharts 知识图谱 -->
      <div id="graphContainer" style="width: 100%; height: 550px; margin-top: 10px; border: 1px solid #f0f0f0; border-radius: 10px;"></div>

      <!-- 图例 -->
      <div style="display: flex; gap: 30px; justify-content: center; margin-top: 12px; flex-wrap: wrap;">
        <span><el-tag size="small" type="primary">■ 岗位类</el-tag></span>
        <span><el-tag size="small" type="success">■ 技能类</el-tag></span>
        <span><el-tag size="small" type="warning">■ 标准类</el-tag></span>
        <span style="color: #999; font-size: 12px;">💡 拖拽查看 · 点击高亮关联</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const selectedJob = ref('')
const selectedStandard = ref('')
const selectedJobData = ref(null)
const selectedStandardData = ref(null)
const allNodes = ref([])

const jobList = ref([
  { id: 'job1', name: '密评工程师' },
  { id: 'job2', name: '密码产品研发工程师' },
  { id: 'job3', name: '密钥管理员' },
  { id: 'job4', name: '密码技术应用员' },
  { id: 'job5', name: '商用密码检测人员' }
])

const standardList = ref([
  { id: 'GM/T 0002', name: 'SM4 分组密码算法' },
  { id: 'GM/T 0003', name: 'SM2 椭圆曲线公钥密码算法' },
  { id: 'GM/T 0004', name: 'SM3 密码杂凑算法' },
  { id: 'GM/T 0054', name: '信息系统密码应用基本要求' },
  { id: 'GM/T 0010', name: '密码设备应用接口规范' },
  { id: 'GM/T 0012', name: '数字证书认证系统密码协议规范' },
  { id: 'GM/T 0051', name: '密钥管理基础设施(KMI)建设指南' },
  { id: 'SJ/T 11818', name: '密码技术应用员 职业技能标准' },
  { id: 'GB/T 39786', name: '信息系统密码应用基本要求' }
])

const standardDetails = ref({
  'GM/T 0002': { name: 'SM4 分组密码算法', relatedJobs: ['密码产品研发工程师', '密码技术应用员'], explanation: 'SM4是我国自主设计的分组密码算法，用于数据加密保护，广泛应用于文件加密、数据库加密等场景。' },
  'GM/T 0003': { name: 'SM2 椭圆曲线公钥密码算法', relatedJobs: ['密评工程师', '密码产品研发工程师'], explanation: 'SM2是我国自主设计的非对称密码算法，基于椭圆曲线密码学，用于数字签名、身份认证等场景。' },
  'GM/T 0004': { name: 'SM3 密码杂凑算法', relatedJobs: ['密评工程师', '密码技术应用员'], explanation: 'SM3是消息摘要算法，用于数据完整性校验和数字签名，是国密体系中的基础哈希算法。' },
  'GM/T 0054': { name: '信息系统密码应用基本要求', relatedJobs: ['密评工程师', '商用密码检测人员'], explanation: '这是密评工作的核心标准，规定了信息系统在密码应用方面应达到的安全要求。' },
  'GM/T 0010': { name: '密码设备应用接口规范', relatedJobs: ['密码产品研发工程师', '商用密码检测人员'], explanation: '定义了应用系统与密码设备之间的接口规范，让不同厂家的密码设备能按统一方式被调用。' },
  'GM/T 0012': { name: '数字证书认证系统密码协议规范', relatedJobs: ['密钥管理员', '密码技术应用员'], explanation: '规定了数字证书认证系统如何安全地使用密码协议，确保网络身份的真实性。' },
  'GM/T 0051': { name: '密钥管理基础设施(KMI)建设指南', relatedJobs: ['密钥管理员', '安全主管'], explanation: '为密钥管理基础设施建设提供指导，涵盖密钥生成、分发、存储、使用等全生命周期管理。' },
  'SJ/T 11818': { name: '密码技术应用员 职业技能标准', relatedJobs: ['密码技术应用员', '密码产品研发工程师'], explanation: '国家人社部发布的密码技术应用员职业技能标准，明确职业定义、技能等级和考核规范。' },
  'GB/T 39786': { name: '信息系统密码应用基本要求', relatedJobs: ['密评工程师', '商用密码检测人员', '安全合规专员'], explanation: '密码测评领域的核心国家标准，是密评工作的根本依据。' }
})

const jobDetails = ref({
  'job1': { name: '密评工程师', skills: ['SM2/SM3/SM4应用', '密评方案编制', '风险评估方法论', 'GB/T 39786', '密码合规审计'], standards: ['GM/T 0054', 'GM/T 0012', 'GM/T 0010'], career: '初级密评 → 中级密评 → 高级密评 → 密评专家/技术总监' },
  'job2': { name: '密码产品研发工程师', skills: ['Java/C++/Go', 'SM2/SM3/SM4算法实现', 'PKI/CA体系', 'TLS/SSL协议', 'Linux系统编程'], standards: ['GM/T 0002', 'GM/T 0003', 'GM/T 0004', 'GM/T 0010', 'GM/T 0012'], career: '初级开发 → 中级开发 → 高级开发/架构师 → 技术总监' },
  'job3': { name: '密钥管理员', skills: ['密钥管理', '访问控制', '安全审计', 'HSM硬件使用', 'ISO 27001'], standards: ['GM/T 0051', 'GM/T 0012', 'GM/T 0010'], career: '密钥管理员 → 安全主管 → 安全经理 → 首席安全官(CSO)' },
  'job4': { name: '密码技术应用员', skills: ['密码算法应用', '系统集成', '安全方案设计', 'Linux运维', 'Shell/Python脚本'], standards: ['GM/T 0010', 'GM/T 0012', 'GM/T 0054'], career: '初级应用员 → 高级应用员 → 技术专家 → 解决方案架构师' },
  'job5': { name: '商用密码检测人员', skills: ['密码检测', '合规评估', '测试工具使用', '自动化测试', '密码协议分析'], standards: ['GM/T 0010', 'GM/T 0054', 'GM/T 0012'], career: '初级检测员 → 中级检测员 → 高级检测员 → 检测组长/检测专家' }
})

const onJobSelect = (jobId) => {
  if (!jobId) { selectedJobData.value = null; renderGraph(); return }
  selectedJobData.value = jobDetails.value[jobId]
  selectedStandard.value = ''
  selectedStandardData.value = null
  renderGraph(jobDetails.value[jobId]?.name, 'job')
}

const onStandardSelect = (stdId) => {
  if (!stdId) { selectedStandardData.value = null; renderGraph(); return }
  selectedStandardData.value = standardDetails.value[stdId]
  selectedJob.value = ''
  selectedJobData.value = null
  renderGraph(stdId, 'standard')
}

const onStandardClick = (stdName) => {
  const found = standardList.value.find(s => s.id === stdName)
  if (found) { selectedStandard.value = found.id; onStandardSelect(found.id) }
}

const onJobClick = (jobName) => {
  const found = jobList.value.find(j => j.name === jobName)
  if (found) { selectedJob.value = found.id; onJobSelect(found.id) }
}

const renderGraph = (highlightTarget = null, type = null) => {
  const chartDom = document.getElementById('graphContainer')
  if (!chartDom) return
  const myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom)

  const nodes = [
    { id: 'job1', name: '密评工程师', category: 0, symbolSize: 54 },
    { id: 'job2', name: '密码产品研发\n工程师', category: 0, symbolSize: 54 },
    { id: 'job3', name: '密钥管理员', category: 0, symbolSize: 50 },
    { id: 'job4', name: '密码技术应用员', category: 0, symbolSize: 50 },
    { id: 'job5', name: '商用密码检测人员', category: 0, symbolSize: 50 },
    { id: 'skill1', name: 'SM2/SM3/SM4\n应用', category: 1, symbolSize: 38 },
    { id: 'skill2', name: '密评方案编制', category: 1, symbolSize: 36 },
    { id: 'skill3', name: 'PKI/CA体系', category: 1, symbolSize: 36 },
    { id: 'skill4', name: '密钥管理', category: 1, symbolSize: 36 },
    { id: 'skill5', name: '密码检测', category: 1, symbolSize: 36 },
    { id: 'skill6', name: '系统集成', category: 1, symbolSize: 36 },
    { id: 'skill7', name: '风险评估', category: 1, symbolSize: 36 },
    { id: 'skill8', name: 'Java/C++/Go', category: 1, symbolSize: 36 },
    { id: 'std1', name: 'GM/T 0002\nSM4', category: 2, symbolSize: 44 },
    { id: 'std2', name: 'GM/T 0003\nSM2', category: 2, symbolSize: 44 },
    { id: 'std3', name: 'GM/T 0004\nSM3', category: 2, symbolSize: 44 },
    { id: 'std4', name: 'GM/T 0054\n密评', category: 2, symbolSize: 44 },
    { id: 'std5', name: 'GM/T 0010\n接口规范', category: 2, symbolSize: 44 },
    { id: 'std6', name: 'GM/T 0012\n证书协议', category: 2, symbolSize: 44 },
    { id: 'std7', name: 'GM/T 0051\n密钥管理', category: 2, symbolSize: 44 },
    { id: 'std8', name: 'GB/T 39786', category: 2, symbolSize: 40 }
  ]

  const links = [
    { source: 'job1', target: 'skill1' }, { source: 'job1', target: 'skill2' }, { source: 'job1', target: 'skill7' },
    { source: 'job2', target: 'skill1' }, { source: 'job2', target: 'skill3' }, { source: 'job2', target: 'skill8' },
    { source: 'job3', target: 'skill4' },
    { source: 'job4', target: 'skill1' }, { source: 'job4', target: 'skill6' },
    { source: 'job5', target: 'skill5' }, { source: 'job5', target: 'skill7' },
    { source: 'skill1', target: 'std1' }, { source: 'skill1', target: 'std2' }, { source: 'skill1', target: 'std3' },
    { source: 'skill2', target: 'std4' },
    { source: 'skill3', target: 'std6' },
    { source: 'skill4', target: 'std7' },
    { source: 'skill5', target: 'std5' }, { source: 'skill5', target: 'std8' },
    { source: 'skill6', target: 'std5' },
    { source: 'skill7', target: 'std4' },
    { source: 'skill8', target: 'std2' }
  ]

  allNodes.value = nodes

  // ===== 高亮逻辑 - 传递性高亮（岗位→技能→标准 全链路） =====
  let highlightNodes = []
  if (highlightTarget) {
    if (type === 'job') {
      // 1. 找到岗位节点
      const jobNode = nodes.find(n => n.name.replace(/\n/g, '') === highlightTarget)
      if (jobNode) {
        // 添加岗位本身
        highlightNodes.push(jobNode.id)
        // 2. 找到岗位直接连接的技能节点
        const skillIds = []
        links.forEach(l => {
          if (l.source === jobNode.id) {
            highlightNodes.push(l.target)
            skillIds.push(l.target)
          }
          if (l.target === jobNode.id) {
            highlightNodes.push(l.source)
            skillIds.push(l.source)
          }
        })
        // 3. 通过技能节点找到关联的标准节点（传递性）
        skillIds.forEach(skillId => {
          links.forEach(l => {
            if (l.source === skillId) highlightNodes.push(l.target)
            if (l.target === skillId) highlightNodes.push(l.source)
          })
        })
      }
    } else if (type === 'standard') {
      // 1. 找到标准节点
      const stdNode = nodes.find(n => n.name.replace(/\n/g, '').includes(highlightTarget))
      if (stdNode) {
        // 添加标准本身
        highlightNodes.push(stdNode.id)
        // 2. 找到标准直接连接的技能节点
        const skillIds = []
        links.forEach(l => {
          if (l.source === stdNode.id) {
            highlightNodes.push(l.target)
            skillIds.push(l.target)
          }
          if (l.target === stdNode.id) {
            highlightNodes.push(l.source)
            skillIds.push(l.source)
          }
        })
        // 3. 通过技能节点找到关联的岗位节点（传递性）
        skillIds.forEach(skillId => {
          links.forEach(l => {
            if (l.source === skillId) highlightNodes.push(l.target)
            if (l.target === skillId) highlightNodes.push(l.source)
          })
        })
      }
    }
    // 去重
    highlightNodes = [...new Set(highlightNodes)]
  }

  const option = {
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `<strong>${params.name}</strong><br/>${params.data.category === 0 ? '🏢 岗位类' : params.data.category === 1 ? '🛠️ 技能类' : '📋 标准类'}`
        }
        return `${params.data.source} → ${params.data.target}`
      }
    },
    legend: {
      data: ['岗位类', '技能类', '标准类'],
      top: 0, left: 'center', icon: 'circle', textStyle: { fontSize: 13 }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      force: { repulsion: 400, edgeLength: [150, 250], gravity: 0.08, friction: 0.1 },
      roam: true,
      draggable: true,
      data: nodes.map(n => ({
        ...n,
        itemStyle: {
          color: n.category === 0 ? '#2d8cf0' : n.category === 1 ? '#19be6b' : '#ff9900',
          shadowBlur: highlightNodes.includes(n.id) ? 20 : 0,
          shadowColor: highlightNodes.includes(n.id) ? '#ffd700' : 'transparent',
          borderColor: highlightNodes.includes(n.id) ? '#ffd700' : 'transparent',
          borderWidth: highlightNodes.includes(n.id) ? 3 : 0
        },
        label: {
          fontSize: highlightNodes.includes(n.id) ? 15 : 12,
          fontWeight: highlightNodes.includes(n.id) ? 'bold' : 'normal'
        }
      })),
      links: links,
      categories: [
        { name: '岗位类', itemStyle: { color: '#2d8cf0' } },
        { name: '技能类', itemStyle: { color: '#19be6b' } },
        { name: '标准类', itemStyle: { color: '#ff9900' } }
      ],
      label: { show: true, position: 'bottom', fontSize: 11, color: '#333', lineHeight: 16 },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 8],
      lineStyle: { color: '#aaa', width: 1.5, curveness: 0.2, opacity: 0.7 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 3, color: '#1a3c6e' } }
    }]
  }

  myChart.setOption(option, true)
  myChart.resize()

  myChart.off('click')
  myChart.on('click', (params) => {
    if (params.dataType === 'node') {
      const nodeName = params.name.replace(/\n/g, '')
      const job = jobList.value.find(j => j.name === nodeName)
      if (job) { selectedJob.value = job.id; onJobSelect(job.id) } else {
        const std = standardList.value.find(s => nodeName.includes(s.id) || nodeName.includes(s.name.replace(/\n/g, '')))
        if (std) { selectedStandard.value = std.id; onStandardSelect(std.id) }
      }
    }
  })

  window.addEventListener('resize', () => { myChart.resize() })
}

const focusGraph = (target, type) => {
  renderGraph(target, type)
  const container = document.getElementById('graphContainer')
  if (container) { container.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
}

onMounted(() => { nextTick(() => { renderGraph() }) })
</script>