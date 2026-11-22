<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Ico from '@/components/Ico.vue'
import { departmentOfParam } from '@/data/org'

const route = useRoute()

const dept = computed(() => departmentOfParam(route.params.dept))
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · {{ dept.name }}</div>
        <div class="page-title-row">
          <h1>我的待办</h1>
          <span class="chip-soft">{{ dept.name }} · 待办工作台</span>
        </div>
      </div>
    </div>

    <section class="panel placeholder">
      <div class="ph-art"><Ico name="file" :size="28" /></div>
      <h2>{{ dept.name }} · 我的待办</h2>
      <p>该模块待业务接入</p>
    </section>
  </div>
</template>
