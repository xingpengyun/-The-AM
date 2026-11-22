<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Ico from '@/components/Ico.vue'
import { departmentByKey, defaultDepartmentKey, stages, stageByKey, processesOfDepartment } from '@/data/org'

const route = useRoute()
const router = useRouter()

const dept = computed(() => departmentByKey[route.params.dept] || departmentByKey[defaultDepartmentKey])
const stage = computed(() => stageByKey[route.params.stage] || null)

/* 该部门实际参与的阶段（用于弱化无关阶段，不隐藏） */
const deptStageKeys = computed(() => new Set(processesOfDepartment(dept.value.key).map((p) => p.stage)))

function goStage(target) {
  router.push({ name: 'dept-stage', params: { dept: dept.value.key, stage: target.key } })
}

function goAll() {
  router.push({ name: 'dept-overview', params: { dept: dept.value.key } })
}
</script>

<template>
  <div class="stage-axis">
    <div class="stage-axis-label">
      <Ico name="target" :size="14" />
      <span>阶段轴</span>
    </div>

    <div class="stage-track">
      <button
        v-motion
        class="stage-chip stage-all"
        :class="{ on: !stage }"
        :hover="{ scale: 1.02 }"
        :tap="{ scale: 0.97 }"
        @click="goAll"
      >
        全部
      </button>

      <button
        v-for="s in stages"
        :key="s.key"
        v-motion
        class="stage-chip"
        :class="{ on: stage && stage.key === s.key, dim: !deptStageKeys.has(s.key) }"
        :title="`${s.no} ${s.name} · ${s.hint}`"
        :hover="{ scale: 1.02 }"
        :tap="{ scale: 0.97 }"
        @click="goStage(s)"
      >
        <b>{{ s.no }}</b>
        <span>{{ s.name }}</span>
      </button>
    </div>

    <div class="stage-axis-meta">
      <b>{{ dept.short }}</b>
      <span>{{ stage ? stage.hint : 'S1–S11 全链路' }}</span>
    </div>
  </div>
</template>
