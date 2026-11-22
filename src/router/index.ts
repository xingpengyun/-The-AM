import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import DeptOverview from '@/views/DeptOverview.vue'
import StageBoard from '@/views/StageBoard.vue'
import DeptTodo from '@/views/DeptTodo.vue'
import {
  defaultDepartmentKey,
  departmentByKey,
  isDepartmentKey,
  isStageKey,
  stageOfParam
} from '@/data/org'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'home', component: DeptOverview, props: { global: true } },
  { path: '/dept/:dept', name: 'dept-overview', component: DeptOverview },
  { path: '/dept/:dept/stage/:stage', name: 'dept-stage', component: StageBoard },
  { path: '/dept/:dept/todo', name: 'dept-todo', component: DeptTodo },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

/* 部门 / 阶段参数校验：非法参数回落到默认部门或概览 */
router.beforeEach((to) => {
  const dept = to.params.dept
  const deptKey = typeof dept === 'string' ? dept : ''
  if (dept && !isDepartmentKey(deptKey)) {
    return { path: `/dept/${defaultDepartmentKey}` }
  }
  const stage = to.params.stage
  if (stage && !isStageKey(typeof stage === 'string' ? stage : '')) {
    return { name: 'dept-overview', params: { dept } }
  }
  return true
})

router.afterEach((to) => {
  if (to.name === 'home') {
    document.title = 'Bonbon Admin · 首页'
    return
  }
  const deptKey = typeof to.params.dept === 'string' ? to.params.dept : ''
  const dept = isDepartmentKey(deptKey) ? departmentByKey[deptKey] : null
  const stage = stageOfParam(to.params.stage)
  const parts = ['Bonbon Admin']
  if (dept) parts.push(dept.name)
  if (stage) parts.push(`${stage.no} ${stage.name}`)
  document.title = parts.join(' · ')
})

export default router
