<template>
  <div style="padding: 20px;">
    <el-card style="border-radius: 12px;">
      <!-- 页面头部 -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <h2 style="color: #1a3c6e; margin: 0;">🔍 密码职业岗位检索</h2>
          <p style="color: #999; margin: 5px 0 0;">查询商用密码行业岗位要求、发展前景与学习资源</p>
        </div>
        <el-tag type="info" size="large">共 {{ filteredJobs.length }} 个岗位</el-tag>
      </div>

      <!-- 搜索和筛选栏 -->
      <div style="display: flex; gap: 15px; margin: 20px 0; flex-wrap: wrap; align-items: center;">
        <el-input
          v-model="searchKeyword"
          placeholder="输入岗位名称搜索..."
          style="width: 280px;"
          clearable
          @input="handleSearch"
        />
        <el-select v-model="selectedLevel" placeholder="岗位级别" clearable style="width: 140px;" @change="handleSearch">
          <el-option label="初级" value="初级" />
          <el-option label="中级" value="中级" />
          <el-option label="高级" value="高级" />
          <el-option label="专家级" value="专家级" />
        </el-select>
        <el-select v-model="selectedType" placeholder="岗位类型" clearable style="width: 140px;" @change="handleSearch">
          <el-option label="测评类" value="测评类" />
          <el-option label="研发类" value="研发类" />
          <el-option label="管理类" value="管理类" />
          <el-option label="应用类" value="应用类" />
        </el-select>
        <el-button type="primary" @click="resetFilter">重置筛选</el-button>
      </div>

      <!-- 岗位卡片列表 -->
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="8" v-for="job in filteredJobs" :key="job.id" style="margin-bottom: 20px;">
          <el-card shadow="hover" style="border-radius: 12px; height: 100%; cursor: pointer;" @click="showDetail(job)">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h3 style="color: #1a3c6e; margin: 0; font-size: 18px;">{{ job.name }}</h3>
              <el-tag size="small" :type="job.level === '初级' ? 'info' : job.level === '中级' ? 'warning' : 'danger'">
                {{ job.level }}
              </el-tag>
            </div>
            <div style="margin: 8px 0; display: flex; gap: 12px; flex-wrap: wrap;">
              <el-tag size="small" type="success">💰 {{ job.salary }}</el-tag>
              <el-tag size="small" type="primary">{{ job.type }}</el-tag>
            </div>
            <p style="color: #666; font-size: 14px; margin: 8px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              {{ job.desc }}
            </p>
            <div style="margin: 8px 0;">
              <el-tag v-for="skill in job.skills.slice(0, 3)" :key="skill" size="small" style="margin: 2px;">
                {{ skill }}
              </el-tag>
              <el-tag v-if="job.skills.length > 3" size="small" type="info">+{{ job.skills.length - 3 }}</el-tag>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
              <span style="color: #999; font-size: 12px;">🏢 {{ job.companies.slice(0, 2).join('、') }}{{ job.companies.length > 2 ? ' 等' : '' }}</span>
              <el-button type="text" size="small" style="color: #1a4f8a;">查看详情 →</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="filteredJobs.length === 0" description="未找到匹配岗位" />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="dialogVisible" :title="currentJob?.name" width="750px" :close-on-click-modal="false">
      <div v-if="currentJob" style="max-height: 500px; overflow-y: auto; padding-right: 10px;">
        <el-descriptions :column="2" border style="margin-bottom: 20px;">
          <el-descriptions-item label="岗位级别">
            <el-tag :type="currentJob.level === '初级' ? 'info' : currentJob.level === '中级' ? 'warning' : 'danger'">
              {{ currentJob.level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="岗位类型">
            <el-tag type="primary">{{ currentJob.type }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="参考薪资">
            <el-tag type="success">{{ currentJob.salary }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="可去公司">
            {{ currentJob.companies.join('、') }}
          </el-descriptions-item>
          <el-descriptions-item label="职业发展前途" :span="2">
            <span style="color: #1a3c6e; font-weight: 500;">{{ currentJob.prospect }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="岗位职责" :span="2">
            {{ currentJob.desc }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="color: #1a3c6e; margin: 16px 0 8px;">🛠️ 必备技能</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          <el-tag v-for="skill in currentJob.skills" :key="skill" type="primary" size="large">
            {{ skill }}
          </el-tag>
        </div>

        <h4 style="color: #1a3c6e; margin: 16px 0 8px;">📋 对应商用密码标准</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          <el-tag v-for="std in currentJob.standards" :key="std" type="warning">
            {{ std }}
          </el-tag>
        </div>

        <h4 style="color: #1a3c6e; margin: 16px 0 8px;">📈 晋升路线</h4>
        <el-steps :active="3" finish-status="success" align-center style="margin-bottom: 16px;">
          <el-step v-for="step in currentJob.careerSteps" :key="step" :title="step" />
        </el-steps>

        <h4 style="color: #1a3c6e; margin: 16px 0 8px;">📖 推荐学习资源</h4>
        <el-row :gutter="15">
          <el-col :span="12" v-for="link in currentJob.studyLinks" :key="link.name">
            <el-card shadow="hover" style="margin-bottom: 12px; border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <el-tag size="small" :type="link.type === '视频' ? 'danger' : link.type === '书籍' ? 'primary' : 'success'">
                  {{ link.type }}
                </el-tag>
                <a :href="link.url" target="_blank" style="color: #1a4f8a; text-decoration: none; font-weight: 500; flex: 1;">
                  {{ link.name }}
                </a>
                <span style="color: #999;">→</span>
              </div>
              <div style="font-size: 12px; color: #999; margin-top: 4px; padding-left: 4px;">
                {{ link.desc }}
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible = false">了解其他岗位</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchKeyword = ref('')
const selectedLevel = ref('')
const selectedType = ref('')
const dialogVisible = ref(false)
const currentJob = ref(null)

const jobs = ref([
  {
    id: 1,
    name: '密评工程师',
    level: '中级',
    type: '测评类',
    salary: '15-25K/月',
    desc: '负责商用密码应用安全性评估，编制密评报告，协助信息系统密码合规建设，为政务、金融、能源等行业提供密码安全评估服务。',
    skills: ['SM2/SM3/SM4算法应用', '密评方案编制', '风险评估方法论', 'GB/T 39786', '密码合规审计'],
    standards: ['GM/T 0054', 'GM/T 0012', 'GM/T 0010'],
    companies: ['中科曙光', '奇安信', '深信服', '天融信', '国家密码检测中心'],
    prospect: '密码测评需求爆发式增长，密评人才缺口巨大，未来可向密评专家、安全咨询总监、密码合规负责人方向发展，薪资涨幅空间大。',
    careerSteps: ['初级密评', '中级密评', '高级密评', '密评专家/技术总监'],
    studyLinks: [
      { name: 'B站搜索：商用密码应用安全性评估', type: '视频', url: 'https://search.bilibili.com/all?keyword=%E5%95%86%E7%94%A8%E5%AF%86%E7%A0%81%E5%BA%94%E7%94%A8%E5%AE%89%E5%85%A8%E6%80%A7%E8%AF%84%E4%BC%B0', desc: 'B站UP主真实视频，搜索关键词直达' },
      { name: 'B站搜索：密评工程师 入门', type: '视频', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E8%AF%84%E5%B7%A5%E7%A8%8B%E5%B8%88', desc: 'B站UP主经验分享与实战教程' },
      { name: '豆瓣搜索：商用密码应用安全性评估', type: '书籍', url: 'https://book.douban.com/subject_search?search_text=%E5%95%86%E7%94%A8%E5%AF%86%E7%A0%81%E5%BA%94%E7%94%A8%E5%AE%89%E5%85%A8%E6%80%A7%E8%AF%84%E4%BC%B0', desc: '相关专业书籍推荐' },
      { name: '知网搜索：GM/T 0054 密评', type: '论文', url: 'https://search.cnki.net/search/?q=GM%2FT%200054%20%E5%95%86%E7%94%A8%E5%AF%86%E7%A0%81', desc: '学术论文与标准解读' }
    ]
  },
  {
    id: 2,
    name: '密码产品研发工程师',
    level: '中级',
    type: '研发类',
    salary: '18-30K/月',
    desc: '负责国密算法产品设计与开发，实现SM2/SM3/SM4等密码功能模块，参与密码机、密钥管理系统、安全网关等产品的研发工作。',
    skills: ['Java/C++/Go', 'SM2/SM3/SM4算法实现', 'PKI/CA体系', 'TLS/SSL协议', 'Linux系统编程'],
    standards: ['GM/T 0002', 'GM/T 0003', 'GM/T 0004', 'GM/T 0010', 'GM/T 0012'],
    companies: ['华为', '腾讯安全', '阿里巴巴安全部', '国密科技', '卫士通'],
    prospect: '国密产品全面替代浪潮下，密码研发人才需求旺盛，可发展为密码架构师、安全产品技术负责人、国密标准制定参与者。',
    careerSteps: ['初级开发', '中级开发', '高级开发/架构师', '技术总监/首席密码学家'],
    studyLinks: [
      { name: 'B站搜索：SM2 算法实现', type: '视频', url: 'https://search.bilibili.com/all?keyword=SM2%20%E7%AE%97%E6%B3%95', desc: 'B站UP主手写代码教学' },
      { name: 'B站搜索：SM4 国密 加密', type: '视频', url: 'https://search.bilibili.com/all?keyword=SM4%20%E5%9B%BD%E5%AF%86', desc: '国密算法工程实现教程' },
      { name: '豆瓣搜索：商用密码算法原理', type: '书籍', url: 'https://book.douban.com/subject_search?search_text=%E5%95%86%E7%94%A8%E5%AF%86%E7%A0%81%E7%AE%97%E6%B3%95', desc: '国密算法权威教材' },
      { name: '知网搜索：SM2 SM3 SM4 国密', type: '论文', url: 'https://search.cnki.net/search/?q=SM2%20SM3%20SM4%20%E5%9B%BD%E5%AF%86', desc: '密码算法研究论文' }
    ]
  },
  {
    id: 3,
    name: '密钥管理员',
    level: '初级',
    type: '管理类',
    salary: '12-18K/月',
    desc: '负责密钥全生命周期管理，包括密钥生成、分发、存储、使用、备份、恢复与销毁，保障密钥安全和合规使用。',
    skills: ['密钥管理', '访问控制', '安全审计', 'HSM硬件使用', 'ISO 27001'],
    standards: ['GM/T 0051', 'GM/T 0012', 'GM/T 0010'],
    companies: ['建设银行', '中国平安', '国家电网', '中国移动', '各大政务云平台'],
    prospect: '数据安全法实施后，密钥管理岗位需求持续增长，未来可发展为安全运营负责人、数据安全专家、CSO首席安全官。',
    careerSteps: ['密钥管理员', '安全主管', '安全经理', '首席安全官(CSO)'],
    studyLinks: [
      { name: 'B站搜索：密钥管理 密码学', type: '视频', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E9%92%A5%E7%AE%A1%E7%90%86', desc: 'B站UP主密钥管理实战讲解' },
      { name: 'B站搜索：HSM 硬件安全模块', type: '视频', url: 'https://search.bilibili.com/all?keyword=HSM%20%E5%AE%89%E5%85%A8', desc: '硬件密钥管理入门教程' },
      { name: '豆瓣搜索：密钥管理基础设施', type: '书籍', url: 'https://book.douban.com/subject_search?search_text=%E5%AF%86%E9%92%A5%E7%AE%A1%E7%90%86', desc: 'KMI建设指南相关书籍' },
      { name: '知网搜索：密钥生命周期 管理', type: '论文', url: 'https://search.cnki.net/search/?q=%E5%AF%86%E9%92%A5%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F', desc: '密钥管理学术论文' }
    ]
  },
  {
    id: 4,
    name: '密码技术应用员',
    level: '初级',
    type: '应用类',
    salary: '10-16K/月',
    desc: '负责商用密码技术在政务、金融、医疗等业务系统中的集成与应用，完成密码产品的部署、调试与运维工作。',
    skills: ['密码算法应用', '系统集成', '安全方案设计', 'Linux运维', 'Shell/Python脚本'],
    standards: ['GM/T 0010', 'GM/T 0012', 'GM/T 0054'],
    companies: ['浪潮信息', '东软集团', '神州数码', '各地大数据局', '数字政务运营商'],
    prospect: '密码应用全面推广，应用型人才需求量大，可发展为系统集成专家、密码解决方案架构师、技术交付总监。',
    careerSteps: ['初级应用员', '高级应用员', '技术专家', '解决方案架构师'],
    studyLinks: [
      { name: 'B站搜索：国密 SSL 配置', type: '视频', url: 'https://search.bilibili.com/all?keyword=%E5%9B%BD%E5%AF%86%20SSL', desc: 'B站UP主国密配置教学' },
      { name: 'B站搜索：密码产品 部署 运维', type: '视频', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E7%A0%81%E4%BA%A7%E5%93%81%20%E9%83%A8%E7%BD%B2', desc: '真实项目部署案例' },
      { name: '豆瓣搜索：商用密码应用技术', type: '书籍', url: 'https://book.douban.com/subject_search?search_text=%E5%95%86%E7%94%A8%E5%AF%86%E7%A0%81%E5%BA%94%E7%94%A8', desc: '密码应用技术教材' },
      { name: '知网搜索：国密 应用 集成', type: '论文', url: 'https://search.cnki.net/search/?q=%E5%9B%BD%E5%AF%86%20%E5%BA%94%E7%94%A8', desc: '国密应用集成论文' }
    ]
  },
  {
    id: 5,
    name: '商用密码检测人员',
    level: '中级',
    type: '测评类',
    salary: '14-22K/月',
    desc: '负责密码产品的合规性检测与验证，包括密码算法正确性验证、产品功能测试、安全性评估，出具检测报告。',
    skills: ['密码检测', '合规评估', '测试工具使用', '自动化测试', '密码协议分析'],
    standards: ['GM/T 0010', 'GM/T 0054', 'GM/T 0012'],
    companies: ['中国信息安全测评中心', '各地密码检测中心', '华测检测', '广电计量', '密码产品厂商质检部'],
    prospect: '密码产品检测认证需求持续增加，检测岗位稳定且专业性强，可发展为检测专家、实验室负责人、密码标准审查专家。',
    careerSteps: ['初级检测员', '中级检测员', '高级检测员', '检测组长/检测专家'],
    studyLinks: [
      { name: 'B站搜索：密码产品检测', type: '视频', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E7%A0%81%E6%A3%80%E6%B5%8B', desc: 'B站UP主密码检测流程讲解' },
      { name: 'B站搜索：GM/T 0010 接口规范', type: '视频', url: 'https://search.bilibili.com/all?keyword=GM%2FT%200010', desc: '密码设备接口规范解读' },
      { name: '豆瓣搜索：密码检测技术', type: '书籍', url: 'https://book.douban.com/subject_search?search_text=%E5%AF%86%E7%A0%81%E6%A3%80%E6%B5%8B', desc: '密码检测认证领域教材' },
      { name: '知网搜索：商用密码 检测 合规', type: '论文', url: 'https://search.cnki.net/search/?q=%E5%95%86%E7%94%A8%E5%AF%86%E7%A0%81%20%E6%A3%80%E6%B5%8B', desc: '检测标准与合规论文' }
    ]
  }
])

const filteredJobs = computed(() => {
  let result = jobs.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(job =>
      job.name.includes(keyword) ||
      job.desc.includes(keyword) ||
      job.skills.some(s => s.includes(keyword))
    )
  }
  if (selectedLevel.value) {
    result = result.filter(job => job.level === selectedLevel.value)
  }
  if (selectedType.value) {
    result = result.filter(job => job.type === selectedType.value)
  }
  return result
})

const handleSearch = () => {}
const resetFilter = () => {
  searchKeyword.value = ''
  selectedLevel.value = ''
  selectedType.value = ''
}
const showDetail = (job) => {
  currentJob.value = job
  dialogVisible.value = true
}
</script>