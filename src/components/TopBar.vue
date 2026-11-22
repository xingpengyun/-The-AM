<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { DropdownOption } from 'naive-ui'
import { useMessage } from 'naive-ui'
import Ico from '@/components/Ico.vue'
import { departmentOfParam, stageOfParam } from '@/data/org'
import { getSession, logout } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const message = useMessage()

/* 顶栏展示当前登录人（来自本地会话） */
const session = getSession()
const userName = session?.displayName ?? '邢鹏昀'
const userInitial = userName.slice(0, 1)
const userRole = session?.role === 'admin' ? '超级管理员' : '成员'
const topSearch = ref('')
const searchRef = ref<{ focus?: () => void } | null>(null)

const isHome = computed(() => route.name === 'home')
const dept = computed(() => departmentOfParam(route.params.dept))
const stage = computed(() => stageOfParam(route.params.stage))

function goHome(): void {
  if (!isHome.value) router.push('/home')
}

const noticeOptions: DropdownOption[] = [
  { key: 'n1', label: '订单 BB202611210089 已完成支付', icon: () => h(Ico, { name: 'check', size: 15 }) },
  { key: 'n2', label: '客户「林知远」提交了退款申请', icon: () => h(Ico, { name: 'refund', size: 15 }) },
  { key: 'n3', label: '本周经营周报已生成', icon: () => h(Ico, { name: 'file', size: 15 }) },
  { type: 'divider', key: 'd1' },
  { key: 'all', label: '查看全部通知', icon: () => h(Ico, { name: 'bell', size: 15 }) }
]

const userOptions: DropdownOption[] = [
  { key: 'profile', label: '个人中心', icon: () => h(Ico, { name: 'user', size: 15 }) },
  { key: 'settings', label: '账号设置', icon: () => h(Ico, { name: 'settings', size: 15 }) },
  { type: 'divider', key: 'd2' },
  { key: 'logout', label: '退出登录', icon: () => h(Ico, { name: 'logout', size: 15 }) }
]

function notify(text: string): void {
  message.info(text, { duration: 2200 })
}

function onSearch(): void {
  if (!topSearch.value.trim()) {
    message.warning('请输入搜索关键词')
    return
  }
  notify(`搜索「${topSearch.value.trim()}」（示例）`)
}

function onNotice(key: string | number): void {
  if (key === 'all') notify('通知中心为示例模块')
  else notify('通知详情为示例内容')
}

function onUser(key: string | number): void {
  if (key === 'logout') {
    logout()
    message.success('已退出登录')
    router.replace({ name: 'login' })
    return
  }
  notify(`「${key === 'profile' ? '个人中心' : '账号设置'}」为示例入口`)
}

function onKeydown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
    e.preventDefault()
    if (searchRef.value && searchRef.value.focus) searchRef.value.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="topbar">
    <div class="crumb">
      <n-breadcrumb>
        <n-breadcrumb-item>
          <a class="crumb-link" href="/home" @click.prevent="goHome">首页</a>
        </n-breadcrumb-item>
        <n-breadcrumb-item v-if="!isHome">{{ dept.name }}</n-breadcrumb-item>
        <n-breadcrumb-item v-if="!isHome && stage">{{ stage.no }} {{ stage.name }}</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <div class="topsearch">
      <n-input
        ref="searchRef"
        v-model:value="topSearch"
        placeholder="搜索订单、客户或功能…"
        clearable
        @keyup.enter="onSearch"
      >
        <template #prefix><Ico name="search" :size="15" /></template>
        <template #suffix><span class="kbd">Ctrl K</span></template>
      </n-input>
    </div>

    <div class="top-actions">
      <n-tooltip trigger="hover">
        <template #trigger>
          <button class="icon-btn" aria-label="帮助中心" @click="notify('帮助中心为示例交互')">
            <Ico name="help" :size="17" />
          </button>
        </template>
        帮助中心
      </n-tooltip>

      <n-dropdown :options="noticeOptions" trigger="click" @select="onNotice">
        <button class="icon-btn" aria-label="通知">
          <Ico name="bell" :size="17" />
          <span class="dot"></span>
        </button>
      </n-dropdown>

      <span class="top-divider"></span>

      <n-dropdown :options="userOptions" trigger="click" @select="onUser">
        <button class="user">
          <n-avatar round :size="30" class="user-avatar">{{ userInitial }}</n-avatar>
          <span class="user-meta"><b>{{ userName }}</b><i>{{ userRole }}</i></span>
          <Ico name="chevron-down" :size="13" class="user-chev" />
        </button>
      </n-dropdown>
    </div>
  </header>
</template>
