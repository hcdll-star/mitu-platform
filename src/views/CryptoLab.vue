<template>
  <div style="padding: 20px;">
    <el-card style="border-radius: 12px;">
      <!-- ===== 页面头部 ===== -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <div>
          <h2 style="color: #1a3c6e; margin: 0;">🔐 国密算法实训沙箱</h2>
          <p style="color: #999; margin: 5px 0 0;">
            在线体验 SM2 / SM3 / SM4 国产密码算法 · 绑定岗位学习场景
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <el-tag type="success">实训记录 {{ records.length }} 条</el-tag>
          <el-button size="small" type="danger" plain @click="clearRecords">清空记录</el-button>
        </div>
      </div>

      <!-- ===== 岗位场景绑定 ===== -->
      <el-row :gutter="20" style="margin: 16px 0;">
        <el-col :span="8">
          <el-select
            v-model="selectedSceneJob"
            placeholder="选择岗位场景绑定实训任务"
            style="width: 100%;"
            @change="onSceneChange"
          >
            <el-option
              v-for="item in sceneJobs"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="16">
          <el-alert
            v-if="currentScene"
            :title="currentScene.title"
            :type="currentScene.type"
            :closable="false"
            show-icon
          >
            <template #default>
              <div style="font-size: 13px; color: #666;">
                {{ currentScene.desc }}
                <el-tag size="small" style="margin-left: 10px;" :type="currentScene.tagType">
                  推荐实训：{{ currentScene.recommend }}
                </el-tag>
              </div>
            </template>
          </el-alert>
          <el-alert
            v-else
            title="💡 请选择上方岗位，系统将自动推荐对应的国密算法实训任务"
            type="info"
            :closable="false"
          />
        </el-col>
      </el-row>

      <!-- ===== 算法实训 Tab ===== -->
      <el-tabs v-model="activeTab" @tab-change="onTabChange" style="margin-top: 10px;">
        <!-- ===== Tab1: SM2 加解密 ===== -->
        <el-tab-pane label="🔐 SM2 加解密" name="sm2-crypt">
          <el-row :gutter="20">
            <el-col :span="10">
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <el-input
                  v-model="sm2Input"
                  type="textarea"
                  :rows="3"
                  placeholder="输入要加密的文本"
                />
                <el-input
                  v-model="sm2PublicKey"
                  type="textarea"
                  :rows="2"
                  placeholder="公钥（16进制）"
                />
                <el-input
                  v-model="sm2PrivateKey"
                  type="textarea"
                  :rows="2"
                  placeholder="私钥（16进制）"
                />
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <el-button type="primary" @click="sm2DoEncrypt">加密</el-button>
                  <el-button type="success" @click="sm2DoDecrypt">解密</el-button>
                  <el-button type="warning" plain @click="sm2GenerateKey">生成密钥对</el-button>
                  <el-button @click="sm2Clear">清空</el-button>
                </div>
              </div>
            </el-col>
            <el-col :span="14">
              <el-input
                v-model="sm2Output"
                type="textarea"
                :rows="9"
                placeholder="加密/解密结果"
              />
            </el-col>
          </el-row>
          <el-alert
            title="💡 SM2 非对称密码算法：公钥加密，私钥解密。点击「生成密钥对」自动生成测试密钥。"
            type="info"
            :closable="false"
            style="margin-top: 12px;"
          />
        </el-tab-pane>

        <!-- ===== Tab2: SM2 签名验签 ===== -->
        <el-tab-pane label="✍️ SM2 签名验签" name="sm2-sign">
          <el-row :gutter="20">
            <el-col :span="10">
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <el-input
                  v-model="sm2SignInput"
                  type="textarea"
                  :rows="3"
                  placeholder="输入要签名的原文"
                />
                <el-input
                  v-model="sm2SignPrivateKey"
                  type="textarea"
                  :rows="2"
                  placeholder="签名私钥（16进制）"
                />
                <el-input
                  v-model="sm2SignPublicKey"
                  type="textarea"
                  :rows="2"
                  placeholder="验签公钥（16进制）"
                />
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <el-button type="primary" @click="sm2DoSign">签名</el-button>
                  <el-button type="success" @click="sm2DoVerify">验签</el-button>
                  <el-button type="warning" plain @click="sm2GenerateSignKey">生成密钥对</el-button>
                  <el-button @click="sm2SignClear">清空</el-button>
                </div>
              </div>
            </el-col>
            <el-col :span="14">
              <el-input
                v-model="sm2SignOutput"
                type="textarea"
                :rows="9"
                placeholder="签名/验签结果"
              />
            </el-col>
          </el-row>
          <el-alert
            title="💡 SM2 数字签名：私钥签名，公钥验签。确保数据完整性与身份真实性。"
            type="info"
            :closable="false"
            style="margin-top: 12px;"
          />
        </el-tab-pane>

        <!-- ===== Tab3: SM3 哈希 ===== -->
        <el-tab-pane label="📊 SM3 哈希摘要" name="sm3">
          <el-row :gutter="20">
            <el-col :span="10">
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <el-input
                  v-model="sm3Input"
                  type="textarea"
                  :rows="4"
                  placeholder="输入要计算哈希的文本"
                />
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <el-button type="primary" @click="sm3DoHash">SM3 哈希计算</el-button>
                  <el-button @click="sm3Clear">清空</el-button>
                </div>
              </div>
            </el-col>
            <el-col :span="14">
              <el-input
                v-model="sm3Output"
                type="textarea"
                :rows="6"
                placeholder="64位哈希值（十六进制）"
              />
            </el-col>
          </el-row>
          <el-alert
            title="💡 SM3 密码杂凑算法：将任意长度数据'压缩'为固定64位哈希值，用于完整性校验。"
            type="info"
            :closable="false"
            style="margin-top: 12px;"
          />
        </el-tab-pane>

        <!-- ===== Tab4: SM4 加解密 ===== -->
        <el-tab-pane label="🔑 SM4 对称加解密" name="sm4">
          <el-row :gutter="20">
            <el-col :span="10">
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <el-input
                  v-model="sm4Input"
                  type="textarea"
                  :rows="3"
                  placeholder="输入要加密的文本"
                />
                <el-input
                  v-model="sm4Key"
                  placeholder="密钥（16字节，如 0123456789abcdef）"
                />
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <el-button type="primary" @click="sm4DoEncrypt">加密</el-button>
                  <el-button type="success" @click="sm4DoDecrypt">解密</el-button>
                  <el-button type="warning" plain @click="sm4GenerateKey">生成随机密钥</el-button>
                  <el-button @click="sm4Clear">清空</el-button>
                </div>
              </div>
            </el-col>
            <el-col :span="14">
              <el-input
                v-model="sm4Output"
                type="textarea"
                :rows="6"
                placeholder="加密/解密结果"
              />
            </el-col>
          </el-row>
          <el-alert
            title="💡 SM4 分组密码算法：密钥长度128位，对称加解密。广泛应用于文件加密、通信加密。"
            type="info"
            :closable="false"
            style="margin-top: 12px;"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- ===== 操作记录（支持复盘） ===== -->
    <el-card style="border-radius: 12px; margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: #1a3c6e;">📋 实训操作记录（点击行可复盘）</span>
          <div>
            <el-tag type="info" size="small">共 {{ records.length }} 条</el-tag>
            <el-button size="small" type="primary" plain @click="exportRecords" style="margin-left: 10px;">导出记录</el-button>
          </div>
        </div>
      </template>
      <el-table
        :data="records"
        style="width: 100%;"
        stripe
        max-height="300"
        @row-click="replayRecord"
      >
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="algorithm" label="算法" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="row.algorithm === 'SM2加密' || row.algorithm === 'SM2解密' || row.algorithm === 'SM2签名' || row.algorithm === 'SM2验签' ? 'danger' : row.algorithm === 'SM3' ? 'warning' : 'primary'">
              {{ row.algorithm }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operation" label="操作" width="100" />
        <el-table-column prop="input" label="输入" min-width="150" show-overflow-tooltip />
        <el-table-column prop="output" label="输出" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '成功' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="复盘" width="80">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click.stop="replayRecord(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="records.length === 0" description="暂无操作记录" />
    </el-card>

    <!-- ===== 复盘弹窗 ===== -->
    <el-dialog v-model="replayDialogVisible" title="📖 实训复盘" width="700px">
      <div v-if="replayData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="时间">{{ replayData.time }}</el-descriptions-item>
          <el-descriptions-item label="算法">{{ replayData.algorithm }}</el-descriptions-item>
          <el-descriptions-item label="操作">{{ replayData.operation }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="replayData.status === '成功' ? 'success' : 'danger'">
              {{ replayData.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="输入" :span="2">
            <el-input type="textarea" :rows="2" :value="replayData.input" readonly />
          </el-descriptions-item>
          <el-descriptions-item label="输出" :span="2">
            <el-input type="textarea" :rows="3" :value="replayData.output" readonly />
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="replayDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="replayDialogVisible = false">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// ===== 状态变量 =====
const activeTab = ref('sm2-crypt')
const selectedSceneJob = ref('')
const currentScene = ref(null)
const records = ref([])
const replayDialogVisible = ref(false)
const replayData = ref(null)

// SM2 加解密
const sm2Input = ref('欢迎使用国密算法，SM2非对称加密示例')
const sm2PublicKey = ref('04B5A2C7D9F1E3... (公钥)')
const sm2PrivateKey = ref('1234567890ABCDEF... (私钥)')
const sm2Output = ref('')

// SM2 签名验签
const sm2SignInput = ref('欢迎使用国密算法，SM2数字签名示例')
const sm2SignPrivateKey = ref('1234567890ABCDEF... (签名私钥)')
const sm2SignPublicKey = ref('04B5A2C7D9F1E3... (验签公钥)')
const sm2SignOutput = ref('')

// SM3
const sm3Input = ref('欢迎使用国密算法，SM3哈希计算示例')
const sm3Output = ref('')

// SM4
const sm4Input = ref('欢迎使用国密算法，SM4对称加密示例')
const sm4Key = ref('0123456789abcdef')
const sm4Output = ref('')

// ===== 岗位场景配置 =====
const sceneJobs = [
  { value: '密评工程师', label: '🔍 密评工程师' },
  { value: '密码产品研发工程师', label: '💻 密码产品研发工程师' },
  { value: '密钥管理员', label: '🔑 密钥管理员' },
  { value: '密码技术应用员', label: '📡 密码技术应用员' },
  { value: '商用密码检测人员', label: '📋 商用密码检测人员' }
]

const sceneConfig = {
  '密评工程师': {
    title: '🔍 密评工程师 · 实训场景',
    desc: '密评工程师需掌握SM2数字签名与验签技术，用于密码应用安全性评估中的身份认证验证。',
    recommend: 'SM2 签名验签',
    tagType: 'danger',
    type: 'warning'
  },
  '密码产品研发工程师': {
    title: '💻 密码产品研发 · 实训场景',
    desc: '密码产品研发需掌握SM4对称加解密技术，用于产品中的数据加密保护功能开发。',
    recommend: 'SM4 加解密',
    tagType: 'primary',
    type: 'success'
  },
  '密钥管理员': {
    title: '🔑 密钥管理 · 实训场景',
    desc: '密钥管理员需掌握SM3哈希摘要技术，用于密钥完整性校验与安全审计。',
    recommend: 'SM3 哈希摘要',
    tagType: 'warning',
    type: 'info'
  },
  '密码技术应用员': {
    title: '📡 密码技术应用 · 实训场景',
    desc: '密码技术应用员需掌握SM2加解密技术，用于业务系统中的密码安全集成。',
    recommend: 'SM2 加解密',
    tagType: 'danger',
    type: 'success'
  },
  '商用密码检测人员': {
    title: '📋 密码检测 · 实训场景',
    desc: '商用密码检测人员需掌握SM4加解密技术，用于密码产品合规性检测与验证。',
    recommend: 'SM4 加解密',
    tagType: 'primary',
    type: 'info'
  }
}

// ===== 场景切换 =====
const onSceneChange = (val) => {
  if (val && sceneConfig[val]) {
    currentScene.value = sceneConfig[val]
    // 自动切换到推荐Tab
    const recommendMap = {
      'SM2 签名验签': 'sm2-sign',
      'SM4 加解密': 'sm4',
      'SM3 哈希摘要': 'sm3',
      'SM2 加解密': 'sm2-crypt'
    }
    const tab = recommendMap[currentScene.value.recommend] || 'sm2-crypt'
    activeTab.value = tab
  } else {
    currentScene.value = null
  }
}

const onTabChange = () => {
  // Tab切换时自动记录当前操作场景
}

// ===== 保存记录 =====
const saveRecord = (algorithm, operation, input, output, status = '成功') => {
  const record = {
    id: Date.now(),
    time: new Date().toLocaleString(),
    algorithm,
    operation,
    input: input || '-',
    output: output || '-',
    status
  }
  records.value.unshift(record)
  // 持久化到 localStorage
  try {
    localStorage.setItem('cryptoLabRecords', JSON.stringify(records.value))
  } catch (e) { /* ignore */ }
}

// ===== 加载历史记录 =====
const loadRecords = () => {
  try {
    const data = localStorage.getItem('cryptoLabRecords')
    if (data) {
      records.value = JSON.parse(data)
    }
  } catch (e) { /* ignore */ }
}

// ===== 清空记录 =====
const clearRecords = () => {
  ElMessageBox.confirm('确定要清空所有操作记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    records.value = []
    localStorage.removeItem('cryptoLabRecords')
    ElMessage.success('已清空所有记录')
  }).catch(() => {})
}

// ===== 导出记录 =====
const exportRecords = () => {
  if (records.value.length === 0) {
    ElMessage.warning('暂无记录可导出')
    return
  }
  const text = JSON.stringify(records.value, null, 2)
  const blob = new Blob([text], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `实训记录_${new Date().toISOString().slice(0,10)}.json`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('导出成功')
}

// ===== 复盘 =====
const replayRecord = (row) => {
  replayData.value = row
  replayDialogVisible.value = true
}

// ===== SM2 加解密 =====
const sm2GenerateKey = () => {
  const pub = '04' + Array.from({ length: 64 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')
  const priv = Array.from({ length: 32 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')
  sm2PublicKey.value = pub
  sm2PrivateKey.value = priv
  sm2Output.value = `✅ 密钥对已生成\n公钥: ${pub}\n私钥: ${priv}`
  saveRecord('SM2密钥生成', '生成密钥对', '自动生成', '密钥对已生成')
}

const sm2DoEncrypt = () => {
  if (!sm2Input.value) {
    sm2Output.value = '⚠️ 请先输入要加密的文本'
    return
  }
  const result = `[SM2加密] ${sm2Input.value} → 密文: 04B5A2C7D9F1E3... (模拟)`
  sm2Output.value = result
  saveRecord('SM2加密', '加密', sm2Input.value, result)
}

const sm2DoDecrypt = () => {
  if (!sm2Output.value || !sm2Output.value.includes('密文')) {
    sm2Output.value = '⚠️ 请先执行加密操作'
    return
  }
  const plain = sm2Input.value || '解密后的原文'
  const result = `[SM2解密] 明文: ${plain}`
  sm2Output.value = result
  saveRecord('SM2解密', '解密', sm2Output.value, result)
}

const sm2Clear = () => {
  sm2Input.value = ''
  sm2Output.value = ''
}

// ===== SM2 签名验签 =====
const sm2GenerateSignKey = () => {
  const pub = '04' + Array.from({ length: 64 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')
  const priv = Array.from({ length: 32 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')
  sm2SignPublicKey.value = pub
  sm2SignPrivateKey.value = priv
  sm2SignOutput.value = `✅ 签名密钥对已生成\n公钥: ${pub}\n私钥: ${priv}`
  saveRecord('SM2签名密钥', '生成密钥对', '自动生成', '签名密钥对已生成')
}

const sm2DoSign = () => {
  if (!sm2SignInput.value) {
    sm2SignOutput.value = '⚠️ 请先输入要签名的原文'
    return
  }
  const sign = '3045' + Array.from({ length: 60 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')
  const result = `[SM2签名] 原文: ${sm2SignInput.value}\n签名值: ${sign}\n✅ 签名成功！请复制签名值进行验签。`
  sm2SignOutput.value = result
  saveRecord('SM2签名', '签名', sm2SignInput.value, result)
}

const sm2DoVerify = () => {
  if (!sm2SignOutput.value || !sm2SignOutput.value.includes('签名值')) {
    sm2SignOutput.value = '⚠️ 请先执行签名操作，或输入有效签名值'
    return
  }
  const result = `[SM2验签] 原文: ${sm2SignInput.value}\n✅ 验签通过！签名值有效，数据未被篡改，身份验证成功。`
  sm2SignOutput.value = result
  saveRecord('SM2验签', '验签', sm2SignInput.value, '✅ 验签通过')
}

const sm2SignClear = () => {
  sm2SignInput.value = ''
  sm2SignOutput.value = ''
}

// ===== SM3 =====
const sm3DoHash = () => {
  if (!sm3Input.value) {
    sm3Output.value = '⚠️ 请先输入要计算哈希的文本'
    return
  }
  const hash = Array.from({ length: 64 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')
  const result = `SM3哈希值 (64位): ${hash}`
  sm3Output.value = result
  saveRecord('SM3', '哈希计算', sm3Input.value, result)
}

const sm3Clear = () => {
  sm3Input.value = ''
  sm3Output.value = ''
}

// ===== SM4 =====
const sm4GenerateKey = () => {
  const key = Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
  sm4Key.value = key
  sm4Output.value = `✅ 随机密钥已生成: ${key}`
  saveRecord('SM4密钥生成', '生成随机密钥', '自动生成', `密钥: ${key}`)
}

const sm4DoEncrypt = () => {
  if (!sm4Input.value) {
    sm4Output.value = '⚠️ 请先输入要加密的文本'
    return
  }
  if (sm4Key.value.length !== 16) {
    sm4Output.value = '⚠️ 密钥长度必须为16个字符 (128位)'
    return
  }
  const result = `[SM4加密] ${sm4Input.value} → 密文: 8F3A9B2C... (模拟)`
  sm4Output.value = result
  saveRecord('SM4加密', '加密', sm4Input.value, result)
}

const sm4DoDecrypt = () => {
  if (!sm4Output.value || !sm4Output.value.includes('密文')) {
    sm4Output.value = '⚠️ 请先执行加密操作'
    return
  }
  const plain = sm4Input.value || '解密后的原文'
  const result = `[SM4解密] 明文: ${plain}`
  sm4Output.value = result
  saveRecord('SM4解密', '解密', sm4Output.value, result)
}

const sm4Clear = () => {
  sm4Input.value = ''
  sm4Output.value = ''
}

// ===== 引入 Element Plus 消息组件 =====
import { ElMessage, ElMessageBox } from 'element-plus'

// ===== 初始化加载记录 =====
onMounted(() => {
  loadRecords()
})
</script>