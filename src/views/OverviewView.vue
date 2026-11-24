<script setup lang="ts">
import Ico from '@/components/Ico.vue'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
</script>

<template>
  <div class="page-dense">
    <div class="page-head">
      <div>
        <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · 全局</div>
        <div class="page-title-row">
          <h1>总览</h1>
          <Badge variant="mint">跨部门 · 全局视图</Badge>
        </div>
      </div>
    </div>

    <Card tone="mint" class="placeholder">
      <div class="ph-art"><Ico name="grid" :size="28" /></div>
      <h2>总览 · 全局视图</h2>
      <p>该模块待业务接入</p>
    </Card>
  </div>
</template>
