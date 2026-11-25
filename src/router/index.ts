import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import DeptOverview from '@/views/DeptOverview.vue'
import StageBoard from '@/views/StageBoard.vue'
import DeptTodo from '@/views/DeptTodo.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import SettingsView from '@/views/SettingsView.vue'
import PermissionsView from '@/views/PermissionsView.vue'
import { getSession, isLoggedIn } from '@/utils/auth'
import { toast } from '@/composables/useToast'
import {
  defaultDepartmentKey,
  departmentByKey,
  isDepartmentKey,
  isStageKey,
  stageOfParam
} from '@/data/org'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { public: true } },
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'home', component: DeptOverview, props: { global: true } },
  { path: '/dept/:dept', name: 'dept-overview', component: DeptOverview },
  { path: '/dept/:dept/stage/:stage', name: 'dept-stage', component: StageBoard },
  { path: '/dept/:dept/todo', name: 'dept-todo', component: DeptTodo },
  { path: '/settings', name: 'settings', component: SettingsView },
  {
    path: '/settings/permissions',
    name: 'settings-permissions',
    component: PermissionsView,
    meta: { admin: true }
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

/* 登录守卫：未登录先进登录页（带回跳地址）；已登录不再停留在登录页 */
router.beforeEach((to) => {
  const logged = isLoggedIn()
  if (to.meta.public !== true && !logged) {
    const redirect = to.fullPath && to.fullPath !== '/' ? to.fullPath : undefined
    return { name: 'login', query: redirect ? { redirect } : {} }
  }
  if (to.meta.public === true && logged) {
    return { name: 'home' }
  }
  if (to.meta.admin === true && getSession()?.role !== 'admin') {
    toast('仅管理员可访问人员权限', 'warning')
    return { name: 'home' }
  }
  return true
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

  /* 可查看范围：受限账号只能进入授权部门，且不展示全局首页 */
  const session = getSession()
  const scope =
    session && session.role !== 'admin' && session.departments?.length
      ? session.departments.filter(isDepartmentKey)
      : null
  if (scope && scope.length > 0) {
    if (to.name === 'home') {
      return { name: 'dept-overview', params: { dept: scope[0] } }
    }
    if (deptKey && !scope.some((key) => key === deptKey)) {
      toast('当前账号无权查看该部门', 'warning')
      return { name: 'dept-overview', params: { dept: scope[0] } }
    }
  }
  return true
})

router.afterEach((to) => {
  if (to.name === 'login') {
    document.title = 'Bonbon Admin · 登录'
    return
  }
  if (to.name === 'home') {
    document.title = 'Bonbon Admin · 首页'
    return
  }
  if (to.name === 'register') {
    document.title = 'Bonbon Admin · 注册'
    return
  }
  if (to.name === 'settings') {
    document.title = 'Bonbon Admin · 设置'
    return
  }
  if (to.name === 'settings-permissions') {
    document.title = 'Bonbon Admin · 人员权限'
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
