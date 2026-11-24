<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import SideNav from '@/components/SideNav.vue'
import TopBar from '@/components/TopBar.vue'
import StageAxis from '@/components/StageAxis.vue'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { stageOfParam } from '@/data/org'

const route = useRoute()
const router = useRouter()
const isHome = computed(() => route.name === 'home')
/* 登录页为独立全屏布局，不渲染侧栏 / 顶栏 */
const isAuthPage = computed(() => route.meta.public === true)

/* 导航顺序：首页 0 → 部门概览 10 → 待办 20 → 阶段 31–41（按 S1–S11） */
function orderOf(r: RouteLocationNormalized): number {
  const stage = stageOfParam(r.params.stage)
  if (stage) return 30 + Number(stage.no.slice(1))
  if (r.name === 'dept-todo') return 20
  if (r.name === 'dept-overview') return 10
  if (r.name === 'home') return 0
  return 25
}

/* 往前导航内容自右进入，后退则自左进入 */
const pageDir = ref<'next' | 'prev'>('next')
router.beforeEach((to, from) => {
  if (!from.name || to.fullPath === from.fullPath) return
  pageDir.value = orderOf(to) < orderOf(from) ? 'prev' : 'next'
})
</script>

<template>
  <RouterView v-if="isAuthPage" v-slot="{ Component, route }">
    <component :is="Component" :key="route.fullPath" />
  </RouterView>

  <div v-else class="shell">
    <SideNav />
    <div class="main">
      <TopBar />
      <StageAxis v-if="!isHome" />
      <main class="content">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="`page-${pageDir}`" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </Transition>
        </RouterView>
        <footer class="foot">Bonbon Admin 管理后台 · 仅用于视觉方向确认，数据均为演示内容</footer>
      </main>
    </div>
  </div>

  <Toaster />
</template>
