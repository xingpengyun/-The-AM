<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import Ico from '@/components/Ico.vue'
import { departmentByKey, departmentName, defaultDepartmentKey, processesOfDepartment, stageByKey } from '@/data/org'
import { resolveProcessRole, roleLabel } from '@/config/access'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const drawerOpen = ref(false)

const dept = computed(() => departmentByKey[route.params.dept] || departmentByKey[defaultDepartmentKey])
const stage = computed(() => stageByKey[route.params.stage] || null)

/* 只呈现本部门主责 / 协办的工序；协办标记为只读来源 */
const stageProcesses = computed(() => {
  if (!stage.value) return []
  return processesOfDepartment(dept.value.key)
    .filter((p) => p.stage === stage.value.key)
    .map((p) => ({ ...p, role: resolveProcessRole(dept.value.key, p) }))
})

const deptProcesses = computed(() => {
  return processesOfDepartment(dept.value.key).map((p) => ({
    ...p,
    role: resolveProcessRole(dept.value.key, p)
  }))
})

const ownedCount = computed(() => stageProcesses.value.filter((p) => p.role === 'owner').length)

function notify(text) {
  message.info(text, { duration: 2200 })
}
</script>

<template>
  <div
    v-motion
    :initial="{ y: 12 }"
    :enter="{ y: 0, transition: { duration: 360, ease: 'easeOut' } }"
  >
    <div class="page-head">
      <div>
        <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · {{ dept.name }}</div>
        <div class="page-title-row">
          <h1>{{ stage ? `${stage.no} ${stage.name}` : '阶段看板' }}</h1>
          <span class="chip-soft">{{ dept.name }} · 工序看板</span>
        </div>
        <div class="page-sub">
          <span class="live-dot"></span>
          {{ stage ? stage.hint : 'S1–S11 全链路' }} · 本阶段本部门 {{ stageProcesses.length }} 道工序（主责 {{ ownedCount }} 道）
        </div>
      </div>
      <div class="page-actions">
        <n-button quaternary @click="drawerOpen = true">
          <template #icon><Ico name="settings" :size="15" /></template>
          权限配置
        </n-button>
        <n-button @click="router.push({ name: 'dept-overview', params: { dept: dept.key } })">
          <template #icon><Ico name="grid" :size="15" /></template>
          返回概览
        </n-button>
      </div>
    </div>

    <div class="section-head" style="--marker:#4F6EF7">
      <span>工序清单</span>
      <em>主责部门可编辑 · 协办部门仅只读引用</em>
    </div>

    <section v-if="stageProcesses.length" class="process-grid">
      <article
        v-for="(p, i) in stageProcesses"
        :key="p.id"
        v-motion
        class="panel process-card"
        :class="{ readonly: p.role !== 'owner' }"
        :initial="{ y: 10 }"
        :enter="{ y: 0, transition: { delay: 40 * i, duration: 320, ease: 'easeOut' } }"
      >
        <div class="process-head">
          <span class="process-ico"><Ico name="file" :size="16" /></span>
          <div class="process-title">
            <div class="process-name">{{ p.name }}</div>
            <div class="process-stage">{{ stage.no }} {{ stage.name }}</div>
          </div>
          <span class="role-chip" :class="p.role">{{ p.role === 'owner' ? '主责' : '只读' }}</span>
        </div>

        <div class="process-owners">
          <div><span class="pc-label">主责</span><b>{{ departmentName(p.owner) }}</b></div>
          <div v-if="p.co.length" class="pc-co">
            <span class="pc-label">协办</span>
            <span v-for="key in p.co" :key="key" class="co-chip">{{ departmentName(key) }}</span>
          </div>
        </div>

        <div class="process-foot">
          <n-button
            size="small"
            :type="p.role === 'owner' ? 'primary' : 'default'"
            :disabled="p.role !== 'owner'"
            @click="notify(`进入工序「${p.name}」（示例）`)"
          >
            进入工序
          </n-button>
          <span class="process-note">{{ p.role === 'owner' ? '可编辑本工序' : '只读来源 · 由主责部门维护' }}</span>
        </div>
      </article>
    </section>

    <div v-else class="panel placeholder">
      <div class="ph-art"><Ico name="inbox" :size="28" /></div>
      <h2>本阶段暂无本部门工序</h2>
      <p>{{ dept.name }} 在 {{ stage ? `${stage.no} ${stage.name}` : '该阶段' }} 没有主责或协办工序。可切换阶段轴查看其他阶段，或回到部门概览。</p>
      <div class="ph-actions">
        <n-button type="primary" @click="router.push({ name: 'dept-overview', params: { dept: dept.key } })">返回部门概览</n-button>
      </div>
    </div>

    <n-drawer v-model:show="drawerOpen" :width="430" placement="right">
      <n-drawer-content title="工序权限配置" closable>
        <p class="drawer-note">
          当前为前端静态规则：主责部门可编辑，协办部门只读。接入后端权限后，替换
          <code>src/config/access.js</code> 中的 <code>roleOverrides</code> 即可，页面无需改动。
        </p>
        <div class="access-section-title">{{ dept.name }} · 全部工序</div>
        <ul class="access-list">
          <li v-for="p in deptProcesses" :key="p.id">
            <div>
              <b>{{ p.name }}</b>
              <span>{{ stageByKey[p.stage].no }} {{ stageByKey[p.stage].name }} · 主责 {{ departmentName(p.owner) }}</span>
            </div>
            <span class="role-chip" :class="p.role">{{ roleLabel(p.role) }}</span>
          </li>
        </ul>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
