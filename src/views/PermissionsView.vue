<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Ico from '@/components/Ico.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/composables/useToast'
import { departmentName, departmentShort, departments } from '@/data/org'
import {
  listAccounts,
  setAccountPermission,
  updateAccountDepartments,
  type AccountPermission,
  type AccountSummary
} from '@/utils/auth'
import type { DepartmentKey } from '@/types/domain'

const ACCOUNT_STORAGE_KEY = 'bonbon.accounts.v1'

const accounts = ref<AccountSummary[]>([])
const keyword = ref('')
const scopeUser = ref<AccountSummary | null>(null)
const scopeDraft = ref<DepartmentKey[]>([])

const filteredAccounts = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return accounts.value
  return accounts.value.filter((row) => {
    const department = row.department
      ? `${departmentName(row.department)} ${departmentShort(row.department)}`
      : '全部部门'
    const phone = row.phone ?? row.username
    return [row.displayName, row.username, phone, department].some((value) =>
      value.toLowerCase().includes(query)
    )
  })
})

const stats = computed(() => {
  const total = accounts.value.length
  const active = accounts.value.filter((a) => a.role !== 'admin' && a.permission === 'active').length
  const pending = accounts.value.filter((a) => a.permission === 'pending').length
  return { total, active, pending }
})

function refresh(): void {
  accounts.value = listAccounts()
}

function onStorage(event: StorageEvent): void {
  if (!event.key || event.key === ACCOUNT_STORAGE_KEY) refresh()
}

onMounted(() => {
  refresh()
  window.addEventListener('storage', onStorage)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && scopeUser.value) closeScope()
}

function statusVariant(permission: AccountPermission): 'mint' | 'lemon' | 'sakura' {
  if (permission === 'active') return 'mint'
  if (permission === 'pending') return 'lemon'
  return 'sakura'
}

function statusText(permission: AccountPermission): string {
  if (permission === 'active') return '已开通'
  if (permission === 'pending') return '待开通'
  return '已停用'
}

function genderText(gender: AccountSummary['gender']): string {
  if (gender === 'male') return '男'
  if (gender === 'female') return '女'
  return '—'
}

function departmentText(key: AccountSummary['department']): string {
  return key ? departmentName(key) : '—'
}

function dateText(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('zh-CN')
}

function toggle(row: AccountSummary): void {
  const next: AccountPermission = row.permission === 'active' ? 'disabled' : 'active'
  try {
    setAccountPermission(row.username, next)
    toast(
      next === 'active' ? `已开通 ${row.displayName} 的权限` : `已停用 ${row.displayName} 的权限`,
      'success'
    )
    refresh()
  } catch (err) {
    toast(err instanceof Error ? err.message : '操作失败，请稍后重试', 'warning')
  }
}

function scopeTitle(row: AccountSummary): string {
  if (row.role === 'admin' || !row.departments?.length) return '全部部门'
  return row.departments.map((key) => departmentName(key)).join('、')
}

function scopeText(row: AccountSummary): string {
  if (row.role === 'admin' || !row.departments?.length) return '全部部门'
  const names = row.departments.map((key) => departmentShort(key))
  return names.length <= 3 ? names.join('、') : `${names.slice(0, 3).join('、')} 等 ${names.length} 个`
}

function openScope(row: AccountSummary): void {
  scopeUser.value = row
  scopeDraft.value = row.departments?.length
    ? [...row.departments]
    : departments.map((item) => item.key)
}

function closeScope(): void {
  scopeUser.value = null
  scopeDraft.value = []
}

function toggleScope(key: DepartmentKey): void {
  scopeDraft.value = scopeDraft.value.includes(key)
    ? scopeDraft.value.filter((item) => item !== key)
    : [...scopeDraft.value, key]
}

function selectAllScope(): void {
  scopeDraft.value = departments.map((item) => item.key)
}

function clearScope(): void {
  scopeDraft.value = []
}

function saveScope(): void {
  if (!scopeUser.value || scopeDraft.value.length === 0) return
  const ordered = departments
    .filter((item) => scopeDraft.value.includes(item.key))
    .map((item) => item.key)
  try {
    updateAccountDepartments(scopeUser.value.username, ordered)
    toast(`已更新 ${scopeUser.value.displayName} 的可查看部门`, 'success')
    refresh()
    closeScope()
  } catch (err) {
    toast(err instanceof Error ? err.message : '保存失败，请稍后重试', 'warning')
  }
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · 系统设置</div>
        <div class="page-title-row">
          <h1>人员权限</h1>
          <Badge variant="lavender">仅管理员</Badge>
        </div>
        <p class="page-sub"><span class="live-dot"></span> 自助注册人员需开通权限后才能登录</p>
      </div>
      <div class="page-actions">
        <Button variant="outline" size="sm" @click="refresh">
          <Ico name="refresh" :size="13" class="mr-1.5" />刷新
        </Button>
      </div>
    </div>

    <div class="perm-stats">
      <div class="perm-stat">
        <span>账号总数</span>
        <b class="sky">{{ stats.total }}</b>
      </div>
      <div class="perm-stat">
        <span>已开通成员</span>
        <b class="mint">{{ stats.active }}</b>
      </div>
      <div class="perm-stat">
        <span>待开通成员</span>
        <b class="lemon">{{ stats.pending }}</b>
      </div>
    </div>

    <Card class="perm-card">
      <div class="perm-head">
        <div class="perm-head-title">
          <h2>账号列表</h2>
          <span>{{ keyword.trim() ? `筛选 ${filteredAccounts.length} / ${accounts.length}` : '注册后默认待开通' }}</span>
        </div>
        <div class="perm-search">
          <svg class="perm-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" stroke-linecap="round" />
          </svg>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索姓名、手机号或部门"
            aria-label="搜索人员"
          />
          <button
            v-if="keyword"
            type="button"
            class="perm-search-clear"
            aria-label="清空搜索"
            @click="keyword = ''"
          >清除</button>
        </div>
      </div>

      <div class="perm-table-wrap">
        <table class="perm-table">
          <thead>
            <tr>
              <th>姓名 / 账号</th>
              <th>部门</th>
              <th>性别</th>
              <th>状态</th>
              <th>可查看范围</th>
              <th>注册时间</th>
              <th class="right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredAccounts" :key="row.username">
              <td>
                <div class="perm-user">
                  <span class="perm-avatar">{{ row.displayName.slice(0, 1) }}</span>
                  <div class="perm-user-meta">
                    <b>{{ row.displayName }}</b>
                    <span>{{ row.phone ?? row.username }}</span>
                  </div>
                </div>
              </td>
              <td>{{ departmentText(row.department) }}</td>
              <td>{{ genderText(row.gender) }}</td>
              <td>
                <Badge v-if="row.role === 'admin'" variant="lavender">管理员</Badge>
                <Badge v-else :variant="statusVariant(row.permission)">
                  {{ statusText(row.permission) }}
                </Badge>
              </td>
              <td>
                <span class="scope-text" :title="scopeTitle(row)">{{ scopeText(row) }}</span>
              </td>
              <td class="muted">{{ dateText(row.createdAt) }}</td>
              <td class="right">
                <span v-if="row.role === 'admin'" class="muted">—</span>
                <div v-else class="perm-actions">
                  <Button size="sm" variant="outline" @click="openScope(row)">权限设置</Button>
                  <Button
                    size="sm"
                    :variant="row.permission === 'active' ? 'outline' : 'default'"
                    @click="toggle(row)"
                  >
                    {{ row.permission === 'active' ? '停用' : '开通' }}
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAccounts.length === 0">
              <td colspan="7" class="perm-no-match">没有匹配的人员</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="accounts.length <= 1" class="perm-empty">
        暂无自助注册人员，注册后会显示在这里。
      </p>
    </Card>

    <Teleport to="body">
      <div v-if="scopeUser" class="scope-mask" @click.self="closeScope">
        <div class="scope-modal" role="dialog" aria-modal="true" aria-label="设置可查看部门">
          <div class="scope-modal-head">
            <div>
              <h2>设置可查看部门</h2>
              <p>{{ scopeUser.displayName }} · {{ scopeUser.phone ?? scopeUser.username }}</p>
            </div>
            <button type="button" class="scope-close" aria-label="关闭" @click="closeScope">×</button>
          </div>

          <div class="scope-toolbar">
            <button type="button" @click="selectAllScope">全选</button>
            <button type="button" @click="clearScope">清空</button>
            <span>已选 {{ scopeDraft.length }} / {{ departments.length }}</span>
          </div>

          <div class="scope-grid">
            <label
              v-for="d in departments"
              :key="d.key"
              class="scope-item"
              :class="{ on: scopeDraft.includes(d.key) }"
            >
              <input
                type="checkbox"
                :checked="scopeDraft.includes(d.key)"
                @change="toggleScope(d.key)"
              />
              <span>{{ d.name }}</span>
            </label>
          </div>

          <p v-if="scopeDraft.length === 0" class="scope-error">请至少选择一个部门</p>

          <div class="scope-foot">
            <Button variant="outline" size="sm" @click="closeScope">取消</Button>
            <Button size="sm" :disabled="scopeDraft.length === 0" @click="saveScope">
              保存范围
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.perm-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.perm-stat {
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface);
}
.perm-stat span {
  display: block;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ink-3);
}
.perm-stat b {
  display: block;
  margin-top: 4px;
  font-size: 24px;
  font-weight: 750;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}
.perm-stat b.sky { color: var(--tone-sky-ink); }
.perm-stat b.mint { color: var(--tone-jade-ink); }
.perm-stat b.lemon { color: var(--tone-amber-ink); }

.perm-card {
  padding: 0;
  overflow: hidden;
}
.perm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.perm-head-title {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}
.perm-head h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: -0.01em;
}
.perm-head span {
  font-size: 10.5px;
  color: var(--ink-3);
}
.perm-search {
  position: relative;
  display: flex;
  align-items: center;
  width: 290px;
  max-width: 100%;
}
.perm-search-ico {
  position: absolute;
  left: 10px;
  width: 14px;
  height: 14px;
  color: var(--ink-3);
  pointer-events: none;
}
.perm-search input {
  width: 100%;
  height: 36px;
  padding: 0 52px 0 32px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #FAFBFC;
  color: var(--ink);
  font-size: 11.5px;
  outline: none;
  transition: border-color 0.16s var(--ease), box-shadow 0.16s var(--ease), background 0.16s var(--ease);
}
.perm-search input::placeholder {
  color: var(--ink-3);
}
.perm-search input:focus {
  border-color: var(--tone-indigo);
  background: var(--surface);
  box-shadow: 0 0 0 3px var(--tone-indigo-soft);
}
.perm-search-clear {
  position: absolute;
  right: 9px;
  padding: 2px;
  border: 0;
  background: none;
  color: var(--ink-3);
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
}
.perm-search-clear:hover {
  color: var(--ink);
}
.perm-table-wrap {
  width: 100%;
  overflow-x: auto;
}
.perm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.perm-table th {
  padding: 9px 14px;
  text-align: left;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.04em;
  color: var(--ink-3);
  white-space: nowrap;
  background: #FAFBFC;
  border-bottom: 1px solid var(--line);
}
.perm-table td {
  padding: 11px 14px;
  border-bottom: 1px solid var(--line);
  color: var(--ink-2);
  white-space: nowrap;
}
.perm-table tbody tr:last-child td {
  border-bottom: 0;
}
.perm-table tbody tr:hover td {
  background: #FAFBFC;
}
.perm-table .right {
  text-align: right;
}
.perm-table .muted {
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}
.perm-user {
  display: flex;
  align-items: center;
  gap: 9px;
}
.perm-avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--tone-indigo-soft);
  color: var(--tone-indigo-ink);
  font-size: 12px;
  font-weight: 700;
}
.perm-user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}
.perm-user-meta b {
  font-size: 12px;
  font-weight: 650;
  color: var(--ink);
}
.perm-user-meta span {
  font-size: 10.5px;
  color: var(--ink-3);
}
.perm-empty {
  margin: 0;
  padding: 18px;
  font-size: 11.5px;
  color: var(--ink-3);
  border-top: 1px solid var(--line);
}
.scope-text {
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.perm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
.perm-no-match {
  padding: 26px 14px;
  text-align: center;
  color: var(--ink-3);
}

.scope-mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(17, 24, 39, 0.38);
  backdrop-filter: blur(3px);
}
.scope-modal {
  width: min(560px, 100%);
  max-height: 82vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--paper);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}
.scope-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.scope-modal-head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.01em;
}
.scope-modal-head p {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--ink-3);
}
.scope-close {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: transparent;
  color: var(--ink-3);
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
}
.scope-close:hover {
  color: var(--ink);
  border-color: var(--line-strong);
}
.scope-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.scope-toolbar button {
  border: 0;
  padding: 0;
  background: none;
  color: var(--tone-indigo);
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}
.scope-toolbar button:hover {
  text-decoration: underline;
}
.scope-toolbar span {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--ink-3);
}
.scope-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}
.scope-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  color: var(--ink-2);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.16s var(--ease), background 0.16s var(--ease);
}
.scope-item:hover {
  border-color: var(--line-strong);
}
.scope-item.on {
  border-color: var(--tone-indigo);
  background: var(--tone-indigo-soft);
  color: var(--tone-indigo-ink);
}
.scope-item input {
  width: 14px;
  height: 14px;
  accent-color: var(--tone-indigo);
  cursor: pointer;
}
.scope-error {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--destructive-ink);
}
.scope-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

@media (max-width: 900px) {
  .perm-stats {
    grid-template-columns: 1fr;
  }
  .perm-search {
    width: 100%;
  }
  .perm-table {
    min-width: 900px;
  }
  .scope-grid {
    grid-template-columns: 1fr;
  }
}
</style>
