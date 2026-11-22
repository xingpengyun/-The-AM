<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Ico from '@/components/Ico.vue'
import ProvinceMap from '@/components/ProvinceMap.vue'
import { departmentOfParam } from '@/data/org'

const props = withDefaults(defineProps<{ global?: boolean }>(), { global: false })

const route = useRoute()

/* 首页 = 跨部门全局视图；部门页只保留空壳，等待业务接入 */
const isGlobal = computed(() => props.global || route.name === 'home')
const dept = computed(() => (isGlobal.value ? null : departmentOfParam(route.params.dept)))
const deptName = computed(() => dept.value?.name ?? '部门')
</script>

<template>
  <div class="page-dense">
    <!-- 首页：仅保留门店分布地图，后续模块统一加在 .home-board 内 -->
    <div v-if="isGlobal" class="home-board">
      <section class="home-block">
        <ProvinceMap />
      </section>
    </div>

    <!-- 部门概览：空壳占位 -->
    <template v-else>
      <div class="page-head">
        <div>
          <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · {{ deptName }}</div>
          <div class="page-title-row">
            <h1>运营概览</h1>
            <span class="chip-soft">{{ deptName }} · 部门概览</span>
          </div>
        </div>
      </div>

      <section class="panel placeholder">
        <div class="ph-art"><Ico name="grid" :size="28" /></div>
        <h2>{{ deptName }} · 部门概览</h2>
        <p>该模块待业务接入</p>
      </section>
    </template>
  </div>
</template>
