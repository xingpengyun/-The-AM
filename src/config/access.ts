/*
 * 权限配置入口
 * ------------------------------------------------------------------
 * 当前为前端静态规则：主责部门可编辑，协办部门只读。
 * 后续接入后端权限时，只需把 roleOverrides / editableStageKeys 换成
 * 接口返回值，页面侧调用 resolveProcessRole 的地方无需改动。
 */
import type {
  DepartmentKey,
  EditableStageMap,
  Process,
  ProcessRole,
  RoleOverrideMap
} from '@/types/domain'

/* 预留：按部门覆盖某些工序的角色（'owner' | 'readonly'） */
export const roleOverrides: RoleOverrideMap = {}

/* 预留：部门可编辑的阶段白名单；为空表示沿用默认规则 */
export const editableStageKeys: EditableStageMap = {}

export function resolveProcessRole(deptKey: DepartmentKey, process: Process): ProcessRole {
  const override = roleOverrides[deptKey]?.[process.id]
  if (override === 'owner') return 'owner'
  if (override === 'readonly') return 'readonly'
  if (process.owner === deptKey) return 'owner'
  if (process.co.includes(deptKey)) return 'readonly'
  return 'none'
}

export function canEditProcess(deptKey: DepartmentKey, process: Process): boolean {
  return resolveProcessRole(deptKey, process) === 'owner'
}

export function roleLabel(role: ProcessRole): string {
  if (role === 'owner') return '主责 · 可编辑'
  if (role === 'readonly') return '协办 · 只读来源'
  return '无权限'
}
