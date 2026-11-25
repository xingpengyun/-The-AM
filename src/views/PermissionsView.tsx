import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Ico from '@/components/Ico'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/lib/toast'
import { departmentName, departmentShort, departments } from '@/data/org'
import {
  listAccounts,
  setAccountPermission,
  updateAccountDepartments,
  type AccountPermission,
  type AccountSummary
} from '@/utils/auth'
import type { DepartmentKey } from '@/types/domain'
import './PermissionsView.css'

const ACCOUNT_STORAGE_KEY = 'bonbon.accounts.v1'

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

function scopeTitle(row: AccountSummary): string {
  if (row.role === 'admin' || !row.departments?.length) return '全部部门'
  return row.departments.map((key) => departmentName(key)).join('、')
}

function scopeText(row: AccountSummary): string {
  if (row.role === 'admin' || !row.departments?.length) return '全部部门'
  const names = row.departments.map((key) => departmentShort(key))
  return names.length <= 3 ? names.join('、') : `${names.slice(0, 3).join('、')} 等 ${names.length} 个`
}

export default function PermissionsView() {
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [keyword, setKeyword] = useState('')
  const [scopeUser, setScopeUser] = useState<AccountSummary | null>(null)
  const [scopeDraft, setScopeDraft] = useState<DepartmentKey[]>([])

  const filteredAccounts = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    if (!query) return accounts
    return accounts.filter((row) => {
      const department = row.department
        ? `${departmentName(row.department)} ${departmentShort(row.department)}`
        : '全部部门'
      const phone = row.phone ?? row.username
      return [row.displayName, row.username, phone, department].some((value) =>
        value.toLowerCase().includes(query)
      )
    })
  }, [accounts, keyword])

  const stats = useMemo(() => {
    const total = accounts.length
    const active = accounts.filter((a) => a.role !== 'admin' && a.permission === 'active').length
    const pending = accounts.filter((a) => a.permission === 'pending').length
    return { total, active, pending }
  }, [accounts])

  function refresh(): void {
    setAccounts(listAccounts())
  }

  useEffect(() => {
    refresh()
    function onStorage(event: StorageEvent): void {
      if (!event.key || event.key === ACCOUNT_STORAGE_KEY) refresh()
    }
    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') closeScope()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('keydown', onKeydown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  function openScope(row: AccountSummary): void {
    setScopeUser(row)
    setScopeDraft(row.departments?.length ? [...row.departments] : departments.map((item) => item.key))
  }

  function closeScope(): void {
    setScopeUser(null)
    setScopeDraft([])
  }

  function toggleScope(key: DepartmentKey): void {
    setScopeDraft((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    )
  }

  function selectAllScope(): void {
    setScopeDraft(departments.map((item) => item.key))
  }

  function clearScope(): void {
    setScopeDraft([])
  }

  function saveScope(): void {
    if (!scopeUser || scopeDraft.length === 0) return
    const ordered = departments
      .filter((item) => scopeDraft.includes(item.key))
      .map((item) => item.key)
    try {
      updateAccountDepartments(scopeUser.username, ordered)
      toast(`已更新 ${scopeUser.displayName} 的可查看部门`, 'success')
      refresh()
      closeScope()
    } catch (err) {
      toast(err instanceof Error ? err.message : '保存失败，请稍后重试', 'warning')
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <Ico name="sparkle" size={10} /> BONBON BUSINESS · 系统设置
          </div>
          <div className="page-title-row">
            <h1>人员权限</h1>
            <Badge variant="lavender">仅管理员</Badge>
          </div>
          <p className="page-sub">
            <span className="live-dot"></span> 自助注册人员需开通权限后才能登录
          </p>
        </div>
        <div className="page-actions">
          <Button variant="outline" size="sm" onClick={refresh}>
            <Ico name="refresh" size={13} className="mr-1.5" />刷新
          </Button>
        </div>
      </div>

      <div className="perm-stats">
        <div className="perm-stat">
          <span>账号总数</span>
          <b className="sky">{stats.total}</b>
        </div>
        <div className="perm-stat">
          <span>已开通成员</span>
          <b className="mint">{stats.active}</b>
        </div>
        <div className="perm-stat">
          <span>待开通成员</span>
          <b className="lemon">{stats.pending}</b>
        </div>
      </div>

      <Card className="perm-card">
        <div className="perm-head">
          <div className="perm-head-title">
            <h2>账号列表</h2>
            <span>
              {keyword.trim() ? `筛选 ${filteredAccounts.length} / ${accounts.length}` : '注册后默认待开通'}
            </span>
          </div>
          <div className="perm-search">
            <svg
              className="perm-search-ico"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              type="text"
              placeholder="搜索姓名、手机号或部门"
              aria-label="搜索人员"
            />
            {keyword ? (
              <button
                type="button"
                className="perm-search-clear"
                aria-label="清空搜索"
                onClick={() => setKeyword('')}
              >
                清除
              </button>
            ) : null}
          </div>
        </div>

        <div className="perm-table-wrap">
          <table className="perm-table">
            <thead>
              <tr>
                <th>姓名 / 账号</th>
                <th>部门</th>
                <th>性别</th>
                <th>状态</th>
                <th>可查看范围</th>
                <th>注册时间</th>
                <th className="right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((row) => (
                <tr key={row.username}>
                  <td>
                    <div className="perm-user">
                      <span className="perm-avatar">{row.displayName.slice(0, 1)}</span>
                      <div className="perm-user-meta">
                        <b>{row.displayName}</b>
                        <span>{row.phone ?? row.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>{departmentText(row.department)}</td>
                  <td>{genderText(row.gender)}</td>
                  <td>
                    {row.role === 'admin' ? (
                      <Badge variant="lavender">管理员</Badge>
                    ) : (
                      <Badge variant={statusVariant(row.permission)}>{statusText(row.permission)}</Badge>
                    )}
                  </td>
                  <td>
                    <span className="scope-text" title={scopeTitle(row)}>
                      {scopeText(row)}
                    </span>
                  </td>
                  <td className="muted">{dateText(row.createdAt)}</td>
                  <td className="right">
                    {row.role === 'admin' ? (
                      <span className="muted">—</span>
                    ) : (
                      <div className="perm-actions">
                        <Button size="sm" variant="outline" onClick={() => openScope(row)}>
                          权限设置
                        </Button>
                        <Button
                          size="sm"
                          variant={row.permission === 'active' ? 'outline' : 'default'}
                          onClick={() => toggle(row)}
                        >
                          {row.permission === 'active' ? '停用' : '开通'}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="perm-no-match">
                    没有匹配的人员
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {accounts.length <= 1 ? (
          <p className="perm-empty">暂无自助注册人员，注册后会显示在这里。</p>
        ) : null}
      </Card>

      {scopeUser
        ? createPortal(
            <div className="scope-mask" onClick={(e) => { if (e.target === e.currentTarget) closeScope() }}>
              <div className="scope-modal" role="dialog" aria-modal="true" aria-label="设置可查看部门">
                <div className="scope-modal-head">
                  <div>
                    <h2>设置可查看部门</h2>
                    <p>
                      {scopeUser.displayName} · {scopeUser.phone ?? scopeUser.username}
                    </p>
                  </div>
                  <button type="button" className="scope-close" aria-label="关闭" onClick={closeScope}>
                    ×
                  </button>
                </div>

                <div className="scope-toolbar">
                  <button type="button" onClick={selectAllScope}>
                    全选
                  </button>
                  <button type="button" onClick={clearScope}>
                    清空
                  </button>
                  <span>
                    已选 {scopeDraft.length} / {departments.length}
                  </span>
                </div>

                <div className="scope-grid">
                  {departments.map((d) => (
                    <label key={d.key} className={`scope-item${scopeDraft.includes(d.key) ? ' on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={scopeDraft.includes(d.key)}
                        onChange={() => toggleScope(d.key)}
                      />
                      <span>{d.name}</span>
                    </label>
                  ))}
                </div>

                {scopeDraft.length === 0 ? <p className="scope-error">请至少选择一个部门</p> : null}

                <div className="scope-foot">
                  <Button variant="outline" size="sm" onClick={closeScope}>
                    取消
                  </Button>
                  <Button size="sm" disabled={scopeDraft.length === 0} onClick={saveScope}>
                    保存范围
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
