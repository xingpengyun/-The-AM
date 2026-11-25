<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Ico from '@/components/Ico.vue'
import { Tooltip } from '@/components/ui/tooltip'
import { departments, isDepartmentKey } from '@/data/org'
import { getSession } from '@/utils/auth'
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
const isSettings = computed(() => route.path.startsWith('/settings'))
const currentDeptKey = computed<DepartmentKey | null>(() => {
  const key = route.params.dept
  return isDepartmentKey(key) ? key : null
})

/* 可查看部门：管理员或未限制账号返回 null（全部） */
const allowedKeys = computed<Set<DepartmentKey> | null>(() => {
  const session = getSession()
  if (!session || session.role === 'admin' || !session.departments?.length) return null
  const valid = session.departments.filter(isDepartmentKey)
  return valid.length ? new Set(valid) : null
})
const visibleDepartments = computed(() =>
  allowedKeys.value
    ? departments.filter((d) => allowedKeys.value?.has(d.key))
    : departments
)
const canSeeHome = computed(() => allowedKeys.value === null)

/* 选中项在导航里的序号：受限账号没有首页，部门从 0 开始 */
const activeIndex = computed(() => {
  if (isHome.value) return canSeeHome.value ? 0 : -1
  if (!currentDeptKey.value) return -1
  const index = visibleDepartments.value.findIndex((d) => d.key === currentDeptKey.value)
  return index < 0 ? -1 : index + (canSeeHome.value ? 1 : 0)
})

/* 共享的选中胶囊：只保留一个元素，位置/尺寸随选中项变化做过渡 */
const listEl = ref<HTMLElement | null>(null)
const pill = reactive({ x: 0, y: 0, w: 0, h: 96, visible: false })
const pillReady = ref(false)

function syncPill(): void {
  const index = activeIndex.value
  if (index < 0) {
    pill.visible = false
    return
  }
  const el = listEl.value?.querySelectorAll<HTMLElement>('.nav-item')[index]
  if (!el) return
  pill.x = el.offsetLeft
  pill.y = el.offsetTop - 16
  pill.w = el.offsetWidth
  pill.h = el.offsetHeight + 32
  pill.visible = true
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  syncPill()
  /* 首帧落位后再开启过渡，避免刷新时胶囊从 0 处滑入 */
  requestAnimationFrame(() => { pillReady.value = true })
  if (listEl.value) {
    resizeObserver = new ResizeObserver(syncPill)
    resizeObserver.observe(listEl.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(activeIndex, () => nextTick(syncPill))

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

function goSettings(): void {
  if (isSettings.value) return
  router.push('/settings')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <aside class="aside">
    <Tooltip content="Bonbon Admin · 运营中台" side="right" :delay="200">
      <template #trigger>
        <div class="brand"><div class="brand-mark">B</div></div>
      </template>
    </Tooltip>

    <nav class="nav">
      <div ref="listEl" class="nav-list">
        <svg
          v-show="pill.visible"
          class="nav-pill"
          :class="{ animated: pillReady }"
          :style="{ transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`, width: pill.w + 'px', height: pill.h + 'px' }"
          viewBox="0 0 92 96"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path class="nav-pill-shape" :d="pillPath" />
        </svg>

        <Tooltip v-if="canSeeHome" content="首页" side="right" :delay="120">
          <template #trigger>
            <button
              class="nav-item"
              :class="{ active: isHome }"
              aria-label="首页"
              :aria-current="isHome ? 'page' : undefined"
              @click="goHome"
            >
              <Ico class="nav-ico" name="home" :size="23" />
            </button>
          </template>
        </Tooltip>

        <Tooltip v-for="d in visibleDepartments" :key="d.key" :content="d.name" side="right" :delay="120">
          <template #trigger>
            <button
              class="nav-item"
              :class="{ active: currentDeptKey === d.key }"
              :aria-label="d.name"
              :aria-current="currentDeptKey === d.key ? 'page' : undefined"
              @click="goDept(d.key)"
            >
              <Ico class="nav-ico" :name="d.icon" :size="23" />
            </button>
          </template>
        </Tooltip>
      </div>
    </nav>

    <div class="aside-foot">
      <Tooltip content="设置" side="right" :delay="120">
        <template #trigger>
          <button
            class="rail-settings"
            :class="{ active: isSettings }"
            aria-label="设置"
            :aria-current="isSettings ? 'page' : undefined"
            @click="goSettings"
          >
            <Ico class="nav-ico" name="settings" :size="22" />
          </button>
        </template>
      </Tooltip>
    </div>
  </aside>
</template>
