<template>
  <div style="padding: 20px;">
    <el-card style="border-radius: 12px;">
      <!-- ===== 页面头部 ===== -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <h2 style="color: #1a3c6e; margin: 0;">📝 密码能力智能自测</h2>
          <p style="color: #999; margin: 5px 0 0;">
            完成测评 · 精准定位知识短板 · 生成个性化学习路径
          </p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <el-tag type="info" size="large">
            {{ answeredCount }} / {{ questions.length }} 已答
          </el-tag>
        </div>
      </div>

      <!-- ===== 进度条 ===== -->
      <el-progress
        v-if="!showReport"
        :percentage="Math.round((answeredCount / questions.length) * 100)"
        :color="progressColor"
        style="margin: 16px 0;"
      />

      <!-- ===== 难度提示 ===== -->
      <el-alert
        v-if="!showReport"
        title="📌 测评包含 20 道题目，覆盖 5 个能力维度，建议 15-20 分钟内完成"
        type="info"
        :closable="false"
        style="margin-bottom: 16px;"
      />

      <!-- ===== 题目列表 ===== -->
      <div v-if="!showReport" style="max-height: 550px; overflow-y: auto; padding-right: 10px;">
        <div
          v-for="(q, index) in questions"
          :key="index"
          style="margin-bottom: 24px; padding: 16px; border: 1px solid #e8ecf1; border-radius: 10px;"
          :style="{ borderLeft: `4px solid ${dimensionColorMap[q.dimension]}` }"
        >
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
            <div>
              <el-tag size="small" :type="q.difficulty === '初级' ? 'info' : q.difficulty === '中级' ? 'warning' : 'danger'" style="margin-right: 8px;">
                {{ q.difficulty }}
              </el-tag>
              <el-tag size="small" :type="dimensionTagMap[q.dimension]" style="margin-right: 8px;">
                {{ q.dimension }}
              </el-tag>
              <span style="font-weight: 500;">{{ index + 1 }}. {{ q.title }}</span>
            </div>
            <el-tag v-if="q.selected" size="small" type="success" style="flex-shrink: 0;">已答</el-tag>
          </div>

          <el-radio-group
            v-model="q.selected"
            @change="onAnswerChange"
            style="margin-top: 12px; width: 100%;"
          >
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 30px; padding-left: 4px;">
              <el-radio
                v-for="(opt, oi) in q.options"
                :key="oi"
                :label="opt"
                :value="opt"
                style="white-space: nowrap;"
              />
            </div>
          </el-radio-group>
        </div>
      </div>

      <!-- ===== 提交按钮 ===== -->
      <div v-if="!showReport" style="text-align: center; margin-top: 20px;">
        <el-button
          type="primary"
          size="large"
          :disabled="answeredCount < questions.length"
          @click="submitAssessment"
          style="width: 280px;"
        >
          {{ answeredCount < questions.length ? `还剩 ${questions.length - answeredCount} 题未答` : '📊 提交测评' }}
        </el-button>
        <p v-if="answeredCount < questions.length" style="color: #999; font-size: 12px; margin-top: 6px;">
          请完成所有题目后再提交，未答题目不计分
        </p>
      </div>

      <!-- ===== 能力分析报告 ===== -->
      <div v-if="showReport" style="margin-top: 10px;">
        <el-divider>
          <span style="font-size: 20px; font-weight: bold; color: #1a3c6e;">📊 能力分析报告</span>
        </el-divider>

        <!-- 总分 -->
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f0f4f9 0%, #e8ecf1 100%); border-radius: 12px; margin-bottom: 20px;">
          <div style="font-size: 48px; font-weight: bold; color: #1a3c6e;">{{ totalScore }}<span style="font-size: 24px; color: #999;">/100</span></div>
          <div style="font-size: 18px; color: #666; margin-top: 4px;">{{ totalLevel }}</div>
          <div style="font-size: 14px; color: #999; margin-top: 4px;">
            正确 {{ correctCount }} 题 · 错误 {{ questions.length - correctCount }} 题
          </div>
        </div>

        <!-- 各维度得分 -->
        <el-row :gutter="15" style="margin-bottom: 20px;">
          <el-col :span="4" v-for="dim in dimensionResults" :key="dim.name">
            <el-card shadow="hover" style="text-align: center; border-radius: 10px;">
              <div style="font-size: 28px; font-weight: bold; color: dim.color;">{{ dim.score }}</div>
              <div style="color: #999; font-size: 12px;">{{ dim.name }}</div>
              <el-progress :percentage="dim.percent" :color="dim.color" :stroke-width="6" />
              <el-tag size="small" :type="dim.level === '优秀' ? 'success' : dim.level === '良好' ? 'warning' : 'danger'" style="margin-top: 4px;">
                {{ dim.level }}
              </el-tag>
            </el-card>
          </el-col>
        </el-row>

        <!-- 雷达图 -->
        <div id="radarContainer" style="width: 100%; height: 350px; margin-top: 10px;"></div>

        <!-- ===== 知识短板定位 ===== -->
        <el-card style="margin-top: 20px; background: #fdf6ec; border-color: #e6a23c;">
          <template #header>
            <span style="font-weight: bold; color: #e6a23c;">🎯 知识短板定位</span>
          </template>
          <div v-if="weakDimensions.length > 0">
            <p style="color: #666;">
              以下维度需要重点加强：
              <el-tag
                v-for="dim in weakDimensions"
                :key="dim.name"
                type="danger"
                size="large"
                style="margin: 0 6px;"
              >
                {{ dim.name }}（{{ dim.score }}分）
              </el-tag>
            </p>
            <p style="color: #999; font-size: 13px; margin-top: 6px;">
              💡 建议优先学习下方推荐内容，补齐短板
            </p>
          </div>
          <div v-else>
            <p style="color: #67c23a;">✅ 各维度表现均衡，继续保持！</p>
          </div>
        </el-card>

        <!-- ===== 个性化学习路径 ===== -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <span style="font-weight: bold; color: #1a3c6e;">🗺️ 个性化学习路径</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(item, idx) in learningPath"
              :key="idx"
              :type="item.type"
              :icon="item.icon"
              :hollow="true"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                <div>
                  <span style="font-weight: 500;">{{ item.title }}</span>
                  <p style="color: #666; font-size: 13px; margin: 4px 0 0;">{{ item.desc }}</p>
                </div>
                <el-tag size="small" :type="item.tagType" style="flex-shrink: 0;">
                  {{ item.tag }}
                </el-tag>
              </div>
              <div v-if="item.links" style="margin-top: 6px; display: flex; gap: 10px; flex-wrap: wrap;">
                <a
                  v-for="link in item.links"
                  :key="link.name"
                  :href="link.url"
                  target="_blank"
                  style="color: #1a4f8a; font-size: 12px; text-decoration: none;"
                >
                  📎 {{ link.name }}
                </a>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- ===== 题目回顾（含答案与解析） ===== -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <span style="font-weight: bold; color: #1a3c6e;">📋 题目回顾 · 答案与解析</span>
          </template>
          <div style="max-height: 500px; overflow-y: auto; padding-right: 10px;">
            <div
              v-for="(q, index) in questions"
              :key="index"
              style="margin-bottom: 20px; padding: 14px; border: 1px solid #e8ecf1; border-radius: 8px;"
              :style="{ borderLeft: `4px solid ${q.selected === q.answer ? '#67c23a' : '#f56c6c'}` }"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                <div>
                  <el-tag size="small" :type="q.difficulty === '初级' ? 'info' : q.difficulty === '中级' ? 'warning' : 'danger'" style="margin-right: 8px;">
                    {{ q.difficulty }}
                  </el-tag>
                  <el-tag size="small" :type="dimensionTagMap[q.dimension]" style="margin-right: 8px;">
                    {{ q.dimension }}
                  </el-tag>
                  <span style="font-weight: 500;">{{ index + 1 }}. {{ q.title }}</span>
                </div>
                <el-tag size="small" :type="q.selected === q.answer ? 'success' : 'danger'">
                  {{ q.selected === q.answer ? '✅ 正确' : '❌ 错误' }}
                </el-tag>
              </div>

              <!-- 选项展示 -->
              <div style="margin: 8px 0 6px 16px; font-size: 14px;">
                <div
                  v-for="opt in q.options"
                  :key="opt"
                  style="padding: 2px 0;"
                  :style="{ color: opt === q.answer ? '#67c23a' : (opt === q.selected && opt !== q.answer ? '#f56c6c' : '#333'), fontWeight: opt === q.answer ? 'bold' : 'normal' }"
                >
                  <span v-if="opt === q.answer">✅ </span>
                  <span v-else-if="opt === q.selected && opt !== q.answer">❌ </span>
                  <span v-else>· </span>
                  {{ opt }}
                  <span v-if="opt === q.answer" style="color: #67c23a; font-size: 12px;">（正确答案）</span>
                  <span v-if="opt === q.selected && opt !== q.answer" style="color: #f56c6c; font-size: 12px;">（你的选择）</span>
                </div>
              </div>

              <!-- 解析 -->
              <div style="margin-top: 8px; padding: 10px; background: #f5f7fa; border-radius: 6px; font-size: 13px; color: #555;">
                💡 <strong>解析：</strong>{{ q.explanation }}
              </div>
            </div>
          </div>
        </el-card>

        <!-- 重新测评 -->
        <div style="text-align: center; margin-top: 24px;">
          <el-button type="primary" plain @click="resetAssessment">重新测评</el-button>
          <el-button type="success" plain @click="exportReport">导出报告</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const showReport = ref(false)
const totalScore = ref(0)
const correctCount = ref(0)
const totalLevel = ref('')
const dimensionResults = ref([])
const weakDimensions = ref([])
const learningPath = ref([])

// ===== 维度配置 =====
const dimensions = ['密码理论基础', '国密算法掌握', '密评与合规', '标准规范认知', '安全意识与实践']
const dimensionColorMap = {
  '密码理论基础': '#2d8cf0',
  '国密算法掌握': '#19be6b',
  '密评与合规': '#ff9900',
  '标准规范认知': '#9b59b6',
  '安全意识与实践': '#e74c3c'
}
const dimensionTagMap = {
  '密码理论基础': 'primary',
  '国密算法掌握': 'success',
  '密评与合规': 'warning',
  '标准规范认知': 'info',
  '安全意识与实践': 'danger'
}

// ===== 题库（含解析） =====
const questions = ref([
  // ===== 密码理论基础 =====
  {
    dimension: '密码理论基础',
    difficulty: '初级',
    title: '密码学中，以下哪个是"明文"的正确含义？',
    options: ['未经加密的原始信息', '加密后的信息', '解密后的信息', '传输中的信息'],
    selected: '',
    answer: '未经加密的原始信息',
    explanation: '明文是密码学中的基础概念，指未经任何加密处理的原始可读信息。加密后称为密文，解密后还原为明文。'
  },
  {
    dimension: '密码理论基础',
    difficulty: '初级',
    title: '以下哪个是我国自主设计的非对称密码算法？',
    options: ['RSA', 'ECC', 'SM2', 'ECDSA'],
    selected: '',
    answer: 'SM2',
    explanation: 'SM2是我国国家密码管理局发布的椭圆曲线公钥密码算法，属于非对称密码体制。RSA和ECC是国际算法。'
  },
  {
    dimension: '密码理论基础',
    difficulty: '中级',
    title: '密码学中的"完整性"指的是什么？',
    options: ['信息只有授权者才能看', '信息未被篡改', '信息发送者身份真实', '信息可被追溯'],
    selected: '',
    answer: '信息未被篡改',
    explanation: '完整性是信息安全三大目标之一，指数据在传输或存储过程中未被未经授权的方式篡改或破坏。'
  },
  {
    dimension: '密码理论基础',
    difficulty: '中级',
    title: '以下哪种攻击方式针对哈希算法的碰撞性？',
    options: ['中间人攻击', '生日攻击', '重放攻击', '字典攻击'],
    selected: '',
    answer: '生日攻击',
    explanation: '生日攻击利用哈希函数的碰撞特性，基于生日悖论寻找两个不同输入产生相同哈希值，威胁哈希算法的安全性。'
  },
  // ===== 国密算法掌握 =====
  {
    dimension: '国密算法掌握',
    difficulty: '初级',
    title: 'SM4 算法的密钥长度是多少位？',
    options: ['64位', '128位', '192位', '256位'],
    selected: '',
    answer: '128位',
    explanation: 'SM4是我国自主设计的分组密码算法，密钥长度为128位，分组长度也为128位，采用32轮Feistel结构。'
  },
  {
    dimension: '国密算法掌握',
    difficulty: '初级',
    title: 'SM3 算法的输出哈希值长度是多少位？',
    options: ['128位', '160位', '224位', '256位'],
    selected: '',
    answer: '256位',
    explanation: 'SM3是我国密码杂凑算法，输出长度为256位的哈希值，用于数字签名、完整性校验等场景。'
  },
  {
    dimension: '国密算法掌握',
    difficulty: '中级',
    title: 'SM2 算法基于以下哪种数学难题？',
    options: ['大整数分解', '椭圆曲线离散对数', '离散对数', '格密码'],
    selected: '',
    answer: '椭圆曲线离散对数',
    explanation: 'SM2基于椭圆曲线离散对数问题（ECDLP），在同等安全强度下密钥长度更短、计算效率更高。'
  },
  {
    dimension: '国密算法掌握',
    difficulty: '高级',
    title: '以下关于 SM4 算法的说法，正确的是？',
    options: ['Feistel结构，32轮迭代', 'SPN结构，64轮迭代', 'Feistel结构，16轮迭代', 'SPN结构，32轮迭代'],
    selected: '',
    answer: 'Feistel结构，32轮迭代',
    explanation: 'SM4采用Feistel网络结构，共32轮迭代，每轮使用不同的轮密钥，保证了算法的安全性和扩散性。'
  },
  // ===== 密评与合规 =====
  {
    dimension: '密评与合规',
    difficulty: '初级',
    title: '密评工作的核心依据标准是？',
    options: ['GM/T 0002', 'GM/T 0054', 'GM/T 0010', 'GM/T 0012'],
    selected: '',
    answer: 'GM/T 0054',
    explanation: 'GM/T 0054《信息系统密码应用基本要求》是密评工作的核心标准，规定了信息系统密码应用的安全要求。'
  },
  {
    dimension: '密评与合规',
    difficulty: '中级',
    title: '密评报告中通常不包含以下哪项内容？',
    options: ['密码算法验证结果', '网络拓扑结构', '安全配置检查结果', '整改建议'],
    selected: '',
    answer: '网络拓扑结构',
    explanation: '密评报告主要关注密码应用的合规性、正确性和有效性，网络拓扑结构属于网络架构设计范畴，不在密评核心内容中。'
  },
  {
    dimension: '密评与合规',
    difficulty: '中级',
    title: '以下哪个机构负责商用密码产品的检测认证？',
    options: ['国家密码管理局', '中国信息安全测评中心', '国家市场监管总局', '工业和信息化部'],
    selected: '',
    answer: '国家密码管理局',
    explanation: '国家密码管理局是商用密码产品检测认证的主管机构，负责制定密码政策、标准并监督管理密码产品。'
  },
  {
    dimension: '密评与合规',
    difficulty: '高级',
    title: '密评中"物理和环境安全"的测评要点是？',
    options: ['密码设备物理防护', '机房访问控制', '密码设备防拆机制', '以上都是'],
    selected: '',
    answer: '以上都是',
    explanation: '物理和环境安全测评包括密码设备的物理防护、机房的访问控制、设备的防拆防篡改机制等多个方面。'
  },
  // ===== 标准规范认知 =====
  {
    dimension: '标准规范认知',
    difficulty: '初级',
    title: 'GM/T 标准系列中，"T"代表的含义是？',
    options: ['推荐性标准', '强制性标准', '行业标准', '国家标准'],
    selected: '',
    answer: '推荐性标准',
    explanation: 'GM/T中的"T"表示"推荐性标准"（Tuijian），即非强制性标准，供行业自愿采用。'
  },
  {
    dimension: '标准规范认知',
    difficulty: '中级',
    title: '以下哪个标准规定了数字证书认证系统的密码协议？',
    options: ['GM/T 0010', 'GM/T 0012', 'GM/T 0054', 'GM/T 0051'],
    selected: '',
    answer: 'GM/T 0012',
    explanation: 'GM/T 0012《数字证书认证系统密码协议规范》规定了数字证书系统中使用的密码协议，是PKI体系的核心标准。'
  },
  {
    dimension: '标准规范认知',
    difficulty: '中级',
    title: 'GB/T 39786 与 GM/T 0054 的关系是？',
    options: ['完全相同的标准', 'GB/T是国家标准，GM/T是行业标准', 'GB/T是行标，GM/T是国标', '无关联'],
    selected: '',
    answer: 'GB/T是国家标准，GM/T是行业标准',
    explanation: 'GB/T 39786是国家推荐性标准（信息技术领域），GM/T 0054是密码行业推荐性标准，两者内容相近但归属不同。'
  },
  {
    dimension: '标准规范认知',
    difficulty: '高级',
    title: '以下哪个标准定义了密码设备的统一调用接口？',
    options: ['GM/T 0002', 'GM/T 0010', 'GM/T 0012', 'GM/T 0051'],
    selected: '',
    answer: 'GM/T 0010',
    explanation: 'GM/T 0010《密码设备应用接口规范》定义了应用系统与密码设备之间的接口，实现不同厂商密码设备的互操作性。'
  },
  // ===== 安全意识与实践 =====
  {
    dimension: '安全意识与实践',
    difficulty: '初级',
    title: '以下哪个是最弱的安全措施？',
    options: ['使用密码加密', '设置复杂密码', '定期更新密码', '使用默认密码'],
    selected: '',
    answer: '使用默认密码',
    explanation: '使用默认密码是最危险的安全实践之一，默认密码通常公开且容易被攻击者利用，是安全管理的重大隐患。'
  },
  {
    dimension: '安全意识与实践',
    difficulty: '中级',
    title: '密钥生命周期管理中，最关键的阶段是？',
    options: ['密钥生成', '密钥分发', '密钥存储', '以上都重要'],
    selected: '',
    answer: '以上都重要',
    explanation: '密钥生命周期中的生成、分发、存储、使用、备份、恢复、销毁每个阶段都至关重要，任何一个环节出问题都会影响密钥安全。'
  },
  {
    dimension: '安全意识与实践',
    difficulty: '中级',
    title: '以下哪种做法最能有效防御社会工程学攻击？',
    options: ['使用防病毒软件', '加强员工安全意识培训', '部署防火墙', '定期修改密码'],
    selected: '',
    answer: '加强员工安全意识培训',
    explanation: '社会工程学攻击利用的是人的心理弱点，技术手段难以防御，最有效的方法是提高人员的安全意识和识别能力。'
  },
  {
    dimension: '安全意识与实践',
    difficulty: '高级',
    title: '密码产品开发中最应该遵守的安全原则是？',
    options: ['只用开源库', '自行设计加密算法', '使用标准算法 + 安全设计', '加密越复杂越好'],
    selected: '',
    answer: '使用标准算法 + 安全设计',
    explanation: '密码产品开发应使用经过验证的标准算法，结合安全设计原则（如最小权限、纵深防御），而非自行设计算法或盲目追求复杂度。'
  }
])

// ===== 已答数量 =====
const answeredCount = computed(() => {
  return questions.value.filter(q => q.selected).length
})

// ===== 进度颜色 =====
const progressColor = computed(() => {
  const pct = (answeredCount.value / questions.value.length) * 100
  if (pct < 50) return '#e6a23c'
  if (pct < 80) return '#2d8cf0'
  return '#67c23a'
})

const onAnswerChange = () => {}

// ===== 提交测评 =====
const submitAssessment = () => {
  const total = questions.value.length
  let correct = 0
  const dimScores = {}

  dimensions.forEach(dim => {
    const qs = questions.value.filter(q => q.dimension === dim)
    const correctInDim = qs.filter(q => q.selected === q.answer).length
    dimScores[dim] = Math.round((correctInDim / qs.length) * 100)
  })

  questions.value.forEach(q => {
    if (q.selected === q.answer) correct++
  })
  correctCount.value = correct
  totalScore.value = Math.round((correct / total) * 100)

  if (totalScore.value >= 90) totalLevel.value = '🏆 优秀 · 密码知识全面扎实'
  else if (totalScore.value >= 75) totalLevel.value = '🌟 良好 · 具备较好的密码基础'
  else if (totalScore.value >= 60) totalLevel.value = '📖 合格 · 有明确提升空间'
  else totalLevel.value = '📚 待加强 · 建议系统学习密码知识'

  dimensionResults.value = dimensions.map(dim => {
    const score = dimScores[dim] || 0
    let level = '待加强'
    if (score >= 80) level = '优秀'
    else if (score >= 60) level = '良好'
    return {
      name: dim,
      score: score,
      percent: score,
      color: dimensionColorMap[dim],
      level: level
    }
  })

  weakDimensions.value = dimensionResults.value.filter(d => d.score < 60)

  generateLearningPath()

  showReport.value = true

  nextTick(() => {
    renderRadar()
    ElMessage.success('✅ 测评完成！')
  })
}

// ===== 生成学习路径 =====
const generateLearningPath = () => {
  const path = []

  if (totalScore.value < 60) {
    path.push({
      title: '📚 夯实密码学基础',
      desc: '从密码学基本概念入手，理解对称加密、非对称加密、哈希算法的原理与应用场景。',
      type: 'primary',
      icon: '📖',
      tag: '必修',
      tagType: 'danger',
      links: [
        { name: 'B站搜索：密码学入门', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E7%A0%81%E5%AD%A6%E5%85%A5%E9%97%A8' },
        { name: '豆瓣搜索：密码学导论', url: 'https://book.douban.com/subject_search?search_text=%E5%AF%86%E7%A0%81%E5%AD%A6%E5%AF%BC%E8%AE%BA' }
      ]
    })
  }

  weakDimensions.value.forEach(dim => {
    const recommendations = {
      '密码理论基础': {
        title: '🔐 加强：密码理论基础',
        desc: '重点学习密码学核心概念，包括加密体制分类、密码攻击模型、安全服务定义。',
        tag: '短板强化',
        tagType: 'danger',
        links: [
          { name: 'B站搜索：密码学基础', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E7%A0%81%E5%AD%A6%E5%9F%BA%E7%A1%80' },
          { name: '标准库：GM/T 标准体系概述', url: '#' }
        ]
      },
      '国密算法掌握': {
        title: '🔐 加强：国密算法掌握',
        desc: '系统学习 SM2/SM3/SM4 三大国密算法的原理、实现与应用场景，结合实训沙箱练习。',
        tag: '短板强化',
        tagType: 'danger',
        links: [
          { name: '国密实训沙箱：SM2/SM3/SM4', url: '#' },
          { name: 'B站搜索：国密算法', url: 'https://search.bilibili.com/all?keyword=%E5%9B%BD%E5%AF%86%E7%AE%97%E6%B3%95' }
        ]
      },
      '密评与合规': {
        title: '📋 加强：密评与合规',
        desc: '深入学习密评工作流程、GM/T 0054 标准要求，掌握密评报告编制方法。',
        tag: '短板强化',
        tagType: 'danger',
        links: [
          { name: '标准库：GM/T 0054 全文', url: '#' },
          { name: 'B站搜索：密评工程师', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E8%AF%84%E5%B7%A5%E7%A8%8B%E5%B8%88' }
        ]
      },
      '标准规范认知': {
        title: '📖 加强：标准规范认知',
        desc: '熟悉 GM/T 系列标准体系，了解各标准编号、名称、核心内容与适用场景。',
        tag: '短板强化',
        tagType: 'danger',
        links: [
          { name: '标准库：GM/T 标准分类', url: '#' },
          { name: 'B站搜索：GM/T 标准', url: 'https://search.bilibili.com/all?keyword=GM%2FT%E6%A0%87%E5%87%86' }
        ]
      },
      '安全意识与实践': {
        title: '🛡️ 加强：安全意识与实践',
        desc: '强化密码安全意识，学习密钥管理最佳实践、社会工程防御、安全开发规范。',
        tag: '短板强化',
        tagType: 'danger',
        links: [
          { name: 'B站搜索：安全意识 密钥管理', url: 'https://search.bilibili.com/all?keyword=%E5%AE%89%E5%85%A8%E6%84%8F%E8%AF%86' },
          { name: '标准库：GM/T 0051 密钥管理', url: '#' }
        ]
      }
    }
    if (recommendations[dim.name]) {
      path.push(recommendations[dim.name])
    }
  })

  const strongDims = dimensionResults.value.filter(d => d.score >= 80)
  if (strongDims.length > 0 && weakDimensions.value.length < 3) {
    path.push({
      title: '🚀 进阶提升',
      desc: `您在 ${strongDims.map(d => d.name).join('、')} 等维度表现优秀，建议挑战高级密码技术实践。`,
      type: 'success',
      icon: '🌟',
      tag: '进阶推荐',
      tagType: 'success',
      links: [
        { name: '高级密码学论文', url: 'https://search.cnki.net/search/?q=%E5%95%86%E7%94%A8%E5%AF%86%E7%A0%81' },
        { name: '密码产品开发实战', url: 'https://search.bilibili.com/all?keyword=%E5%AF%86%E7%A0%81%E4%BA%A7%E5%93%81%E5%BC%80%E5%8F%91' }
      ]
    })
  }

  if (totalScore.value >= 75) {
    path.push({
      title: '💼 推荐岗位方向',
      desc: '你的能力画像适合从事 密评工程师 / 密码产品研发工程师 等核心密码岗位，建议结合岗位标准持续精进。',
      type: 'info',
      icon: '🎯',
      tag: '职业匹配',
      tagType: 'primary',
      links: [
        { name: '查看岗位检索 →', url: '/jobs' },
        { name: '查看知识图谱 →', url: '/graph' }
      ]
    })
  } else if (totalScore.value >= 50) {
    path.push({
      title: '💼 推荐岗位方向',
      desc: '你的能力画像适合从事 密码技术应用员 / 密钥管理员 等应用型岗位，建议加强技术实操练习。',
      type: 'info',
      icon: '🎯',
      tag: '职业匹配',
      tagType: 'primary',
      links: [
        { name: '查看岗位检索 →', url: '/jobs' },
        { name: '国密实训沙箱 →', url: '/lab' }
      ]
    })
  } else {
    path.push({
      title: '💼 建议先夯实基础',
      desc: '建议从密码技术应用员岗位入门标准开始学习，逐步提升密码理论水平与实践能力。',
      type: 'warning',
      icon: '📌',
      tag: '入门建议',
      tagType: 'warning',
      links: [
        { name: '查看岗位检索 →', url: '/jobs' },
        { name: '标准查询 →', url: '/standards' }
      ]
    })
  }

  learningPath.value = path
}

// ===== 雷达图 =====
const renderRadar = () => {
  const chartDom = document.getElementById('radarContainer')
  if (!chartDom) return
  const myChart = echarts.init(chartDom)

  const option = {
    radar: {
      indicator: dimensions.map(d => ({ name: d, max: 100 })),
      shape: 'polygon',
      center: ['50%', '50%'],
      radius: '65%',
      axisName: { color: '#333', fontSize: 13, fontWeight: 'bold' }
    },
    series: [{
      type: 'radar',
      data: [{
        value: dimensionResults.value.map(d => d.score),
        name: '能力得分',
        areaStyle: { color: 'rgba(26, 60, 110, 0.2)' },
        lineStyle: { color: '#1a3c6e', width: 3 },
        itemStyle: { color: '#1a3c6e' }
      }],
      symbol: 'circle',
      symbolSize: 8
    }]
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => { myChart.resize() })
}

// ===== 导出报告 =====
const exportReport = () => {
  const report = {
    time: new Date().toLocaleString(),
    totalScore: totalScore.value,
    totalLevel: totalLevel.value,
    correctCount: correctCount.value,
    dimensionResults: dimensionResults.value,
    weakDimensions: weakDimensions.value,
    learningPath: learningPath.value,
    questions: questions.value.map(q => ({
      title: q.title,
      selected: q.selected,
      answer: q.answer,
      explanation: q.explanation,
      isCorrect: q.selected === q.answer
    }))
  }
  const text = JSON.stringify(report, null, 2)
  const blob = new Blob([text], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `能力分析报告_${new Date().toISOString().slice(0,10)}.json`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('报告导出成功')
}

// ===== 重新测评 =====
const resetAssessment = () => {
  questions.value.forEach(q => { q.selected = '' })
  showReport.value = false
  totalScore.value = 0
  correctCount.value = 0
  totalLevel.value = ''
  dimensionResults.value = []
  weakDimensions.value = []
  learningPath.value = []
  ElMessage.info('已重置，请重新作答')
}

onMounted(() => {
  ElMessage.info('💡 共 20 题，完成所有题目后提交生成报告')
})
</script>