<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Ico from '@/components/Ico.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/composables/useToast'
import { getSession } from '@/utils/auth'

const router = useRouter()
const session = getSession()
const isAdmin = computed(() => session?.role === 'admin')

function openPermissions(): void {
  if (!isAdmin.value) {
    toast('仅管理员可管理人员权限', 'warning')
    return
  }
  router.push('/settings/permissions')
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · 系统设置</div>
        <div class="page-title-row">
          <h1>设置</h1>
          <Badge variant="sky">账号与权限</Badge>
        </div>
        <p class="page-sub">集中管理后台的人员权限与账号开通状态。</p>
      </div>
    </div>

    <Card class="settings-card">
      <div class="settings-main">
        <div class="settings-ico"><Ico name="shield" :size="23" /></div>
        <div>
          <div class="settings-title">
            <h2>人员权限</h2>
            <Badge variant="lavender">仅管理员</Badge>
          </div>
          <p>审核自助注册人员，开通或停用账号权限，并设置每个人可查看的部门范围。</p>
        </div>
      </div>
      <Button
        size="sm"
        :variant="isAdmin ? 'default' : 'outline'"
        @click="openPermissions"
      >
        {{ isAdmin ? '进入管理' : '仅管理员可进入' }}
      </Button>
    </Card>

    <p class="settings-note">
      当前账号：{{ session?.displayName ?? '未登录' }} ·
      {{ isAdmin ? '超级管理员' : '普通成员' }}
    </p>
  </div>
</template>

<style scoped>
.settings-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  padding: 18px 20px;
}
.settings-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.settings-ico {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: var(--tone-indigo-soft);
  color: var(--tone-indigo);
}
.settings-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.settings-title h2 {
  margin: 0;
  font-size: 14.5px;
  font-weight: 750;
  letter-spacing: -0.01em;
}
.settings-card p {
  margin: 5px 0 0;
  font-size: 11.5px;
  color: var(--ink-3);
  line-height: 1.55;
}
.settings-note {
  margin-top: 14px;
  font-size: 11px;
  color: var(--ink-3);
}
</style>
