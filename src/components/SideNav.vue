<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Ico from '@/components/Ico.vue'
import { departments, isDepartmentKey } from '@/data/org'
import type { DepartmentKey } from '@/types/domain'

const route = useRoute()
const router = useRouter()

/**
 * 选中块形状（视口 92 × 96，本体 64 高，上下各留 16 给反向圆角）：
 * 左侧为正常圆角，闭合无开口；右侧直接铺到导轨边缘并与内容区相接，
 * 上沿 / 下沿各用一个 R16 反向圆角向外张开，弧线与边线相切，连续无尖点。
 */
const pillPath =
  'M0 32A16 16 0 0 1 16 16H76A16 16 0 0 0 92 0V96A16 16 0 0 0 76 80H16A16 16 0 0 1 0 64Z'

const isHome = computed(() => route.name === 'home')
const currentDeptKey = computed<DepartmentKey | null>(() => {
  const key = route.params.dept
  return isDepartmentKey(key) ? key : null
})

function goHome(): void {
  if (isHome.value) return
  router.push('/home')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goDept(key: DepartmentKey): void {
  if (key === currentDeptKey.value) return
  router.push(`/dept/${key}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <aside class="aside">
    <n-tooltip placement="right" :delay="200">
      <template #trigger>
        <div class="brand"><div class="brand-mark">B</div></div>
      </template>
      Bonbon Admin · 运营中台
    </n-tooltip>

    <nav class="nav">
      <div class="nav-list">
        <n-tooltip placement="right" :delay="120">
          <template #trigger>
            <button
              class="nav-item"
              :class="{ active: isHome }"
              aria-label="首页"
              :aria-current="isHome ? 'page' : undefined"
              @click="goHome"
            >
              <svg
                v-if="isHome"
                class="nav-pill"
                viewBox="0 0 92 96"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path class="nav-pill-shape" :d="pillPath" />
              </svg>
              <Ico class="nav-ico" name="home" :size="21" />
            </button>
          </template>
          首页
        </n-tooltip>

        <n-tooltip v-for="d in departments" :key="d.key" placement="right" :delay="120">
          <template #trigger>
            <button
              class="nav-item"
              :class="{ active: currentDeptKey === d.key }"
              :aria-label="d.name"
              :aria-current="currentDeptKey === d.key ? 'page' : undefined"
              @click="goDept(d.key)"
            >
              <svg
                v-if="currentDeptKey === d.key"
                class="nav-pill"
                viewBox="0 0 92 96"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path class="nav-pill-shape" :d="pillPath" />
              </svg>
              <Ico class="nav-ico" :name="d.icon" :size="21" />
            </button>
          </template>
          {{ d.name }}
        </n-tooltip>
      </div>
    </nav>
  </aside>
</template>
