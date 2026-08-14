<template>
  <div style="padding: 20px;">
    <el-card style="border-radius: 12px;">
      <!-- ===== 页面头部 ===== -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <h2 style="color: #1a3c6e; margin: 0;">📚 商用密码标准知识库</h2>
          <p style="color: #999; margin: 5px 0 0;">
            结构化收录 GM/T 系列标准 · 国家职业技能标准 · 密评相关规范
          </p>
        </div>
        <el-tag type="info" size="large">共 {{ filteredStandards.length }} 项标准</el-tag>
      </div>

      <!-- ===== 全文检索 + 分类筛选 + 精准定位 ===== -->
      <div style="display: flex; gap: 15px; margin: 20px 0; flex-wrap: wrap; align-items: center;">
        <el-input
          v-model="searchKeyword"
          placeholder="🔍 全文检索：标准编号/名称/关键词..."
          style="width: 320px;"
          clearable
          @input="handleSearch"
        />
        <el-select v-model="selectedType" placeholder="标准类型" clearable style="width: 170px;" @change="handleSearch">
          <el-option label="GM/T 商用密码标准" value="GM/T系列" />
          <el-option label="国家职业技能标准" value="职业技能标准" />
          <el-option label="密评相关规范" value="密评规范" />
        </el-select>
        <el-select v-model="selectedCategory" placeholder="GM/T 细分分类" clearable style="width: 150px;" @change="handleSearch">
          <el-option label="算法标准" value="算法标准" />
          <el-option label="测评标准" value="测评标准" />
          <el-option label="管理标准" value="管理标准" />
          <el-option label="基础标准" value="基础标准" />
        </el-select>
        <el-select v-model="selectedLevel" placeholder="标准级别" clearable style="width: 150px;" @change="handleSearch">
          <el-option label="国家标准" value="国家标准" />
          <el-option label="行业标准" value="行业标准" />
          <el-option label="推荐性国家标准" value="推荐性国家标准" />
        </el-select>
        <el-button type="primary" @click="resetFilter">重置筛选</el-button>
        <el-tag size="small" type="success">精准定位：{{ filteredStandards.length }} 项匹配</el-tag>
      </div>

      <!-- ===== 标准列表表格 ===== -->
      <el-table
        :data="filteredStandards"
        style="width: 100%;"
        stripe
        @row-click="showDetail"
        :row-style="{ cursor: 'pointer' }"
      >
        <el-table-column prop="id" label="标准编号" width="200" />
        <el-table-column prop="name" label="标准名称" min-width="220" />
        <el-table-column prop="type" label="标准类型" width="150">
          <template #default="{ row }">
            <el-tag :type="row.type === 'GM/T系列' ? 'primary' : row.type === '职业技能标准' ? 'success' : 'warning'" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="细分分类" width="120">
          <template #default="{ row }">
            <el-tag :type="row.category === '算法标准' ? 'danger' : row.category === '测评标准' ? 'warning' : row.category === '管理标准' ? 'primary' : 'info'" size="small">
              {{ row.category || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="标准级别" width="140" />
        <el-table-column label="关联岗位" min-width="150">
          <template #default="{ row }">
            <el-tag v-for="job in row.relatedJobs" :key="job" size="small" style="margin: 2px;">
              {{ job }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click.stop="showDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredStandards.length === 0" description="未找到匹配的标准，请调整筛选条件" />
    </el-card>

    <!-- ===== 详情弹窗 ===== -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentStandard?.name"
      width="750px"
      :close-on-click-modal="false"
    >
      <div v-if="currentStandard" style="max-height: 500px; overflow-y: auto; padding-right: 10px;">
        <el-alert
          title="精准定位"
          type="success"
          :closable="false"
          style="margin-bottom: 16px;"
        >
          <template #default>
            <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 4px;">
              <span><strong>标准编号：</strong>{{ currentStandard.id }}</span>
              <span><strong>标准类型：</strong>{{ currentStandard.type }}</span>
              <span><strong>细分分类：</strong>{{ currentStandard.category || '-' }}</span>
              <span><strong>标准级别：</strong>{{ currentStandard.level }}</span>
            </div>
          </template>
        </el-alert>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="标准编号">{{ currentStandard.id }}</el-descriptions-item>
          <el-descriptions-item label="标准类型">
            <el-tag :type="currentStandard.type === 'GM/T系列' ? 'primary' : currentStandard.type === '职业技能标准' ? 'success' : 'warning'" size="small">
              {{ currentStandard.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="细分分类">
            <el-tag :type="currentStandard.category === '算法标准' ? 'danger' : currentStandard.category === '测评标准' ? 'warning' : 'primary'" size="small">
              {{ currentStandard.category || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标准级别">{{ currentStandard.level }}</el-descriptions-item>
          <el-descriptions-item label="发布日期" :span="2">{{ currentStandard.publishDate || '—' }}</el-descriptions-item>
          <el-descriptions-item label="适用岗位" :span="2">
            <el-tag v-for="job in currentStandard.relatedJobs" :key="job" size="small" style="margin: 2px;">
              {{ job }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h4 style="color: #1a3c6e; margin: 0 0 10px 0;">📖 科普解读</h4>
        <el-card shadow="never" style="background: #f5f7fa; border-radius: 8px; margin-bottom: 16px;">
          <p style="line-height: 1.8; margin: 0;">{{ currentStandard.explanation }}</p>
        </el-card>

        <h4 style="color: #1a3c6e; margin: 16px 0 10px 0;">💡 应用场景</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          <el-tag v-for="scene in currentStandard.scenarios" :key="scene" type="success">
            {{ scene }}
          </el-tag>
        </div>

        <h4 style="color: #1a3c6e; margin: 16px 0 10px 0;">🔗 推荐学习资源</h4>
        <div v-for="link in currentStandard.links" :key="link.name" style="margin-bottom: 8px;">
          <a :href="link.url" target="_blank" style="color: #1a4f8a; text-decoration: none; font-size: 14px;">
            📎 {{ link.name }}
          </a>
          <span style="color: #999; font-size: 12px; margin-left: 8px;">{{ link.desc }}</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible = false">继续浏览</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchKeyword = ref('')
const selectedType = ref('')
const selectedCategory = ref('')
const selectedLevel = ref('')
const dialogVisible = ref(false)
const currentStandard = ref(null)

const standards = ref([
  // ===== GM/T 系列 =====
  {
    id: 'GM/T 0002',
    name: 'SM4 分组密码算法',
    type: 'GM/T系列',
    category: '算法标准',
    level: '国家标准',
    publishDate: '2016-08-01',
    relatedJobs: ['密码产品研发工程师', '密码技术应用员'],
    explanation: 'SM4是我国自主设计的分组密码算法，用于数据加密保护。简单来说，它就像一把"数字锁"，把明文数据加密成密文，只有持有正确密钥的人才能解密查看。',
    scenarios: ['文件加密', '数据库加密', '通信加密', '硬盘加密'],
    links: [
      { name: 'B站搜索：SM4 国密 加密', url: 'https://search.bilibili.com/all?keyword=SM4%20%E5%9B%BD%E5%AF%86', desc: '国密算法工程实现教程' },
      { name: 'GM/T 0002 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },
  {
    id: 'GM/T 0003',
    name: 'SM2 椭圆曲线公钥密码算法',
    type: 'GM/T系列',
    category: '算法标准',
    level: '国家标准',
    publishDate: '2016-08-01',
    relatedJobs: ['密评工程师', '密码产品研发工程师'],
    explanation: 'SM2是我国自主设计的非对称密码算法，基于椭圆曲线密码学。它解决了密钥分发的难题——每个人有一对钥匙：公钥公开给别人加密，私钥自己保管解密。',
    scenarios: ['数字签名', '身份认证', '密钥交换', '电子政务'],
    links: [
      { name: 'B站搜索：SM2 算法实现', url: 'https://search.bilibili.com/all?keyword=SM2%20%E7%AE%97%E6%B3%95', desc: 'B站UP主手写代码教学' },
      { name: 'GM/T 0003 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },
  {
    id: 'GM/T 0004',
    name: 'SM3 密码杂凑算法',
    type: 'GM/T系列',
    category: '算法标准',
    level: '国家标准',
    publishDate: '2016-08-01',
    relatedJobs: ['密评工程师', '密码技术应用员'],
    explanation: 'SM3是消息摘要算法，能把任意长度的数据"压缩"成固定长度的哈希值，且很难逆向。它就像数据的"指纹"，任何微小的修改都会导致指纹完全不同。',
    scenarios: ['数据完整性校验', '数字签名', '随机数生成', '密码存储'],
    links: [
      { name: 'B站搜索：SM3 哈希算法', url: 'https://search.bilibili.com/all?keyword=SM3%20%E5%93%88%E5%B8%8C', desc: 'SM3原理与应用全解析' },
      { name: 'GM/T 0004 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },
  {
    id: 'GM/T 0054',
    name: '信息系统密码应用基本要求',
    type: 'GM/T系列',
    category: '测评标准',
    level: '行业标准',
    publishDate: '2021-03-01',
    relatedJobs: ['密评工程师', '商用密码检测人员'],
    explanation: '这是密评工作的核心标准，规定了信息系统在密码应用方面应该达到的安全要求。密评工程师按照这个标准来检查系统是否合规，是密码测评的"宪法"。',
    scenarios: ['密评', '合规检查', '安全建设', '等保2.0'],
    links: [
      { name: 'B站搜索：GM/T 0054 密评', url: 'https://search.bilibili.com/all?keyword=GM%2FT%200054', desc: '密评工程师必看标准解读' },
      { name: 'GM/T 0054 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },
  {
    id: 'GM/T 0010',
    name: '密码设备应用接口规范',
    type: 'GM/T系列',
    category: '基础标准',
    level: '行业标准',
    publishDate: '2012-11-01',
    relatedJobs: ['密码产品研发工程师', '商用密码检测人员'],
    explanation: '这个标准定义了应用系统与密码设备之间的接口规范，让不同厂家的密码设备能按统一方式被调用。就像USB接口一样，大家遵守同一个标准就能互通。',
    scenarios: ['密码机调用', '密码卡开发', '系统集成', '设备互测'],
    links: [
      { name: 'B站搜索：GM/T 0010 接口', url: 'https://search.bilibili.com/all?keyword=GM%2FT%200010', desc: '密码设备接口开发实战' },
      { name: 'GM/T 0010 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },
  {
    id: 'GM/T 0012',
    name: '数字证书认证系统密码协议规范',
    type: 'GM/T系列',
    category: '管理标准',
    level: '行业标准',
    publishDate: '2012-11-01',
    relatedJobs: ['密钥管理员', '密码技术应用员'],
    explanation: '这个标准规定了数字证书认证系统如何安全地使用密码协议，确保网络身份的真实性。简单说，就是让人在网上证明"我是我"的技术规范。',
    scenarios: ['PKI系统', '电子政务', '网上银行', '身份认证'],
    links: [
      { name: 'B站搜索：数字证书 PKI', url: 'https://search.bilibili.com/all?keyword=%E6%95%B0%E5%AD%97%E8%AF%81%E4%B9%A6%20PKI', desc: '从零理解数字证书认证系统' },
      { name: 'GM/T 0012 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },
  {
    id: 'GM/T 0051',
    name: '密钥管理基础设施（KMI）建设指南',
    type: 'GM/T系列',
    category: '管理标准',
    level: '行业标准',
    publishDate: '2020-12-01',
    relatedJobs: ['密钥管理员', '安全主管'],
    explanation: '这个标准为密钥管理基础设施的建设提供指导和规范。密钥管理是密码应用中最基础也是最关键的一环，涉及密钥全生命周期管理。',
    scenarios: ['密钥生命周期管理', 'HSM部署', '安全运营', '合规审计'],
    links: [
      { name: 'B站搜索：密钥管理 KMI', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E9%92%A5%E7%AE%A1%E7%90%86%20KMI', desc: '密钥管理基础设施入门' },
      { name: 'GM/T 0051 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },

  // ===== 国家职业技能标准 =====
  {
    id: 'SJ/T 11818',
    name: '密码技术应用员 国家职业技能标准',
    type: '职业技能标准',
    category: '职业技能',
    level: '推荐性国家标准',
    publishDate: '2023-05-01',
    relatedJobs: ['密码技术应用员', '密码产品研发工程师'],
    explanation: '这是国家人社部发布的密码技术应用员职业技能标准，明确了密码技术应用员的职业定义、职业技能等级、技能要求和考核规范。',
    scenarios: ['职业技能认定', '人才培养', '岗位评价', '培训考核'],
    links: [
      { name: 'B站搜索：密码技术应用员', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E7%A0%81%E6%8A%80%E6%9C%AF%E5%BA%94%E7%94%A8%E5%91%98', desc: '密码职业发展路径讲解' },
      { name: '国家职业技能标准查询系统', url: 'https://www.mohrss.gov.cn/', desc: '人社部官网查询' }
    ]
  },
  {
    id: 'SJ/T 11819',
    name: '商用密码检测员 国家职业技能标准',
    type: '职业技能标准',
    category: '职业技能',
    level: '推荐性国家标准',
    publishDate: '2023-05-01',
    relatedJobs: ['商用密码检测人员', '密评工程师'],
    explanation: '这个标准规定了商用密码检测员的职业技能要求，涵盖密码产品检测、密码合规评估、密码技术验证等核心工作内容。',
    scenarios: ['密码产品检测', '职业技能鉴定', '人才评价', '培训标准'],
    links: [
      { name: 'B站搜索：商用密码检测员', url: 'https://search.bilibili.com/all?keyword=%E5%95%86%E7%94%A8%E5%AF%86%E7%A0%81%E6%A3%80%E6%B5%8B', desc: '密码检测职业发展路径' },
      { name: '国家职业技能标准查询系统', url: 'https://www.mohrss.gov.cn/', desc: '人社部官网查询' }
    ]
  },

  // ===== 密评相关规范 =====
  {
    id: 'GB/T 39786',
    name: '信息安全技术 信息系统密码应用基本要求',
    type: '密评规范',
    category: '密评基础',
    level: '国家标准',
    publishDate: '2021-10-01',
    relatedJobs: ['密评工程师', '商用密码检测人员', '安全合规专员'],
    explanation: '这是密码测评领域的核心国家标准，规定了不同安全等级的信息系统在密码应用方面应达到的基本要求，是密评工作的根本依据。',
    scenarios: ['等保2.0', '密评', '合规建设', '安全规划设计'],
    links: [
      { name: 'B站搜索：GB/T 39786 密评', url: 'https://search.bilibili.com/all?keyword=GB%2FT%2039786', desc: '密评工程师核心标准解读' },
      { name: 'GB/T 39786 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },
  {
    id: 'GM/T 0117',
    name: '商用密码应用安全性评估 测评流程规范',
    type: '密评规范',
    category: '密评流程',
    level: '行业标准',
    publishDate: '2022-06-01',
    relatedJobs: ['密评工程师', '商用密码检测人员'],
    explanation: '这个规范细化了密评的具体操作流程，包括测评准备、方案编制、现场测评、报告编制等各环节的工作要求。',
    scenarios: ['密评项目执行', '测评流程管理', '报告编制', '质量管控'],
    links: [
      { name: 'B站搜索：密评 流程', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E8%AF%84%20%E6%B5%81%E7%A8%8B', desc: '密评项目全流程实战' },
      { name: 'GM/T 0117 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  },
  {
    id: 'GM/T 0118',
    name: '商用密码应用安全性评估 测评方法规范',
    type: '密评规范',
    category: '密评方法',
    level: '行业标准',
    publishDate: '2022-06-01',
    relatedJobs: ['密评工程师', '商用密码检测人员'],
    explanation: '这个规范详细规定了密评中各项技术测评和管理测评的具体方法，包括密码算法验证、密码协议分析、安全配置检查等测评技术。',
    scenarios: ['技术测评', '漏洞验证', '密码算法核查', '安全配置检查'],
    links: [
      { name: 'B站搜索：密评 方法', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E8%AF%84%20%E6%96%B9%E6%B3%95', desc: '密评技术实操教学' },
      { name: 'GM/T 0118 标准全文', url: 'https://www.oscca.gov.cn/', desc: '国家密码管理局官网' }
    ]
  }
])

const filteredStandards = computed(() => {
  let result = standards.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      item.id.toLowerCase().includes(keyword) ||
      item.name.includes(keyword) ||
      item.explanation.includes(keyword) ||
      item.scenarios.some(s => s.includes(keyword)) ||
      item.relatedJobs.some(j => j.includes(keyword))
    )
  }

  if (selectedType.value) {
    result = result.filter(item => item.type === selectedType.value)
  }

  if (selectedCategory.value) {
    result = result.filter(item => item.category === selectedCategory.value)
  }

  if (selectedLevel.value) {
    result = result.filter(item => item.level === selectedLevel.value)
  }

  return result
})

const handleSearch = () => {}

const resetFilter = () => {
  searchKeyword.value = ''
  selectedType.value = ''
  selectedCategory.value = ''
  selectedLevel.value = ''
}

const showDetail = (standard) => {
  currentStandard.value = standard
  dialogVisible.value = true
}
</script>