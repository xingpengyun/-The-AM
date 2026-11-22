<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { zhCN, dateZhCN } from 'naive-ui'
import SideNav from '@/components/SideNav.vue'
import TopBar from '@/components/TopBar.vue'
import StageAxis from '@/components/StageAxis.vue'
import { themeOverrides } from '@/config/theme'

const route = useRoute()
const isHome = computed(() => route.name === 'home')
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <div class="shell">
        <SideNav />
        <div class="main">
          <TopBar />
          <StageAxis v-if="!isHome" />
          <main class="content">
            <RouterView v-slot="{ Component, route }">
              <component :is="Component" :key="route.fullPath" />
            </RouterView>
            <footer class="foot">Bonbon Admin 管理后台 · 仅用于视觉方向确认，数据均为演示内容</footer>
          </main>
        </div>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
