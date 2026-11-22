<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import Ico from '@/components/Ico.vue'
import { departmentByKey, defaultDepartmentKey, processesOfDepartment } from '@/data/org'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const dept = computed(() => departmentByKey[route.params.dept] || departmentByKey[defaultDepartmentKey])
const processCount = computed(() => processesOfDepartment(dept.value.key).length)

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
          <h1>我的待办</h1>
          <span class="chip-soft">{{ dept.name }} · 待办工作台</span>
        </div>
        <div class="page-sub">
          <span class="live-dot"></span>
          本部门共 {{ processCount }} 道工序参与 S1–S11 链路
        </div>
      </div>
    </div>

    <div class="panel placeholder">
      <div class="ph-art"><Ico name="file" :size="30" /></div>
      <h2>{{ dept.name }} · 待办模块占位</h2>
      <p>该模块尚未接入待办数据。正式上线时会沿用同一套面板、字号层级与分区规则，保持整页视觉一致。</p>
      <div class="ph-actions">
        <n-button type="primary" @click="router.push({ name: 'dept-overview', params: { dept: dept.key } })">回到部门概览</n-button>
        <n-button quaternary @click="notify('已记录你的反馈（示例）')">提交样式反馈</n-button>
      </div>
    </div>
  </div>
</template>
