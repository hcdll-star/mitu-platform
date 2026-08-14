<template>
  <div style="min-height: 100vh; background: #f0f4f9;">
    <!-- 顶部导航栏 -->
    <el-header style="background: linear-gradient(135deg, #0b2b5c 0%, #1a4f8a 100%); display: flex; align-items: center; padding: 0 30px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
      <!-- Logo + 平台名称 -->
      <div style="display: flex; align-items: center; gap: 12px; cursor: pointer;" @click="goTo('/')">
        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #ffd700;">🔐</div>
        <div>
          <h2 style="color: white; margin: 0; font-size: 20px; letter-spacing: 1px;">密途</h2>
          <span style="color: rgba(255,255,255,0.6); font-size: 11px;">商用密码职业标准知识图谱</span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <div style="margin-left: 50px; display: flex; gap: 5px; flex-wrap: wrap;">
        <el-button
          v-for="item in menuItems"
          :key="item.path"
          :type="currentPath === item.path ? 'primary' : 'text'"
          :style="currentPath === item.path ? navActiveStyle : navTextStyle"
          @click="goTo(item.path)"
        >
          {{ item.icon }} {{ item.name }}
        </el-button>
      </div>

      <!-- 右侧 -->
      <div style="margin-left: auto; display: flex; align-items: center; gap: 15px;">
        <el-tag size="small" style="background: rgba(255,255,255,0.15); border: none; color: #ffd700;">全国密码技术竞赛</el-tag>
        <el-avatar :size="32" style="background: #ffd700; color: #0b2b5c; font-weight: bold;">团</el-avatar>
      </div>
    </el-header>

    <!-- 页面内容 -->
    <div style="padding: 24px; max-width: 1400px; margin: 0 auto;">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()
const currentPath = computed(() => route.path)

const menuItems = [
  { path: '/', name: '首页', icon: '🏠' },
  { path: '/jobs', name: '岗位检索', icon: '🔍' },
  { path: '/standards', name: '标准查询', icon: '📚' },
  { path: '/graph', name: '知识图谱', icon: '🕸️' },
  { path: '/lab', name: '国密实训', icon: '🔐' },
  { path: '/assessment', name: '能力测评', icon: '📝' },
  { path: '/admin', name: '后台管理', icon: '⚙️' }
]

const navTextStyle = {
  color: 'rgba(255,255,255,0.8)',
  border: 'none',
  fontSize: '14px',
  padding: '8px 16px'
}

const navActiveStyle = {
  background: 'rgba(255,255,255,0.2)',
  color: '#ffffff',
  border: 'none',
  fontSize: '14px',
  padding: '8px 16px',
  fontWeight: 'bold'
}

const goTo = (path) => { router.push(path) }
</script>