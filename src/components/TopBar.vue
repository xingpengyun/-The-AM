<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Ico from '@/components/Ico.vue'
import { DropdownMenu, type MenuItem } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tooltip } from '@/components/ui/tooltip'
import { toast } from '@/composables/useToast'
import { departmentOfParam, stageOfParam } from '@/data/org'
import { getSession, logout } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

/* 顶栏展示当前登录人（来自本地会话） */
const session = getSession()
const userName = session?.displayName ?? '邢鹏昀'
const userInitial = userName.slice(0, 1)
const userRole = session?.role === 'admin' ? '超级管理员' : '成员'
const topSearch = ref('')
const searchRef = ref<InstanceType<typeof Input> | null>(null)

const isHome = computed(() => route.name === 'home')
const isOverview = computed(() => route.name === 'overview')
const dept = computed(() => departmentOfParam(route.params.dept))
const stage = computed(() => stageOfParam(route.params.stage))

function goHome(): void {
  if (!isHome.value) router.push('/home')
}

const noticeOptions: MenuItem[] = [
  { key: 'n1', label: '订单 BB202611210089 已完成支付', icon: 'check' },
  { key: 'n2', label: '客户「林知远」提交了退款申请', icon: 'refund' },
  { key: 'n3', label: '本周经营周报已生成', icon: 'file' },
  { key: 'd1', separator: true },
  { key: 'all', label: '查看全部通知', icon: 'bell' }
]

const userOptions: MenuItem[] = [
  { key: 'profile', label: '个人中心', icon: 'user' },
  { key: 'settings', label: '账号设置', icon: 'settings' },
  { key: 'd2', separator: true },
  { key: 'logout', label: '退出登录', icon: 'logout' }
]

function notify(text: string): void {
  toast(text)
}

function onSearch(): void {
  if (!topSearch.value.trim()) {
    toast('请输入搜索关键词', 'warning')
    return
  }
  notify(`搜索「${topSearch.value.trim()}」（示例）`)
}

function onNotice(key: string): void {
  if (key === 'all') notify('通知中心为示例模块')
  else notify('通知详情为示例内容')
}

function onUser(key: string): void {
  if (key === 'logout') {
    logout()
    toast('已退出登录', 'success')
    router.replace({ name: 'login' })
    return
  }
  notify(`「${key === 'profile' ? '个人中心' : '账号设置'}」为示例入口`)
}

function onKeydown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
    e.preventDefault()
    searchRef.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="topbar">
    <div class="crumb">
      <nav class="flex items-center gap-1.5 text-[12px] text-muted-foreground" aria-label="面包屑">
        <a class="crumb-link" href="/home" @click.prevent="goHome">首页</a>
        <template v-if="isOverview">
          <span class="opacity-60">/</span>
          <span class="text-foreground">总览</span>
        </template>
        <template v-else-if="!isHome">
          <span class="opacity-60">/</span>
          <span class="text-foreground">{{ dept.name }}</span>
        </template>
        <template v-if="!isHome && !isOverview && stage">
          <span class="opacity-60">/</span>
          <span class="text-foreground">{{ stage.no }} {{ stage.name }}</span>
        </template>
      </nav>
    </div>

    <div class="topsearch relative flex-1">
      <Ico
        name="search"
        :size="15"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref="searchRef"
        v-model="topSearch"
        placeholder="搜索订单、客户或功能…"
        class="h-[34px] bg-muted pl-8 pr-16"
        @enter="onSearch"
      />
      <span class="kbd pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">Ctrl K</span>
    </div>

    <div class="top-actions">
      <Tooltip content="帮助中心">
        <template #trigger>
          <button class="icon-btn" aria-label="帮助中心" @click="notify('帮助中心为示例交互')">
            <Ico name="help" :size="17" />
          </button>
        </template>
      </Tooltip>

      <DropdownMenu :items="noticeOptions" @select="onNotice">
        <template #trigger>
          <button class="icon-btn" aria-label="通知">
            <Ico name="bell" :size="17" />
            <span class="dot"></span>
          </button>
        </template>
      </DropdownMenu>

      <span class="top-divider"></span>

      <DropdownMenu :items="userOptions" @select="onUser">
        <template #trigger>
          <button class="user">
            <span class="user-initial">
              {{ userInitial }}
            </span>
            <span class="user-meta"><b>{{ userName }}</b><i>{{ userRole }}</i></span>
            <Ico name="chevron-down" :size="13" class="user-chev" />
          </button>
        </template>
      </DropdownMenu>
    </div>
  </header>
</template>
