import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: () => import('../views/JobSearch.vue'),
    },
    {
      path: '/standards',
      name: 'standards',
      component: () => import('../views/StandardSearch.vue'),
    },
    {
      path: '/graph',
      name: 'graph',
      component: () => import('../views/KnowledgeGraph.vue'),
    },
    {
      path: '/lab',
      name: 'lab',
      component: () => import('../views/CryptoLab.vue'),
    },
    {
      path: '/assessment',
      name: 'assessment',
      component: () => import('../views/Assessment.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin.vue'),
    },
  ],
})

export default router