<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Ico from '@/components/Ico.vue'
import { departmentOfParam, stageOfParam } from '@/data/org'

const route = useRoute()

const dept = computed(() => departmentOfParam(route.params.dept))
const stage = computed(() => stageOfParam(route.params.stage))
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · {{ dept.name }}</div>
        <div class="page-title-row">
          <h1>{{ stage ? `${stage.no} ${stage.name}` : '阶段看板' }}</h1>
          <span class="chip-soft">{{ dept.name }} · 阶段看板</span>
        </div>
      </div>
    </div>

    <section class="panel placeholder">
      <div class="ph-art"><Ico name="inbox" :size="28" /></div>
      <h2>{{ stage ? `${stage.no} ${stage.name}` : '阶段看板' }}</h2>
      <p>该模块待业务接入</p>
    </section>
  </div>
</template>
