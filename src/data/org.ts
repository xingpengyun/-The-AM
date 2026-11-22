/*
 * 组织 / 阶段 / 工序配置
 * ------------------------------------------------------------------
 * 部门：9 个真实部门，左侧导航按此顺序渲染。
 *       key 同时作为路由 slug（/dept/:dept），避免出现旧部门拼音残留。
 * 阶段：S1–S11，顶部阶段轴按此顺序渲染。
 * 工序：每个阶段下的工序及其主责部门（owner）与协办部门（co）。
 *       S1–S9 阶段名来自需求；S10 / S11 为补齐 11 段链路预留的名称，
 *       工序条目为样张占位，接真实业务数据时只改本文件即可。
 */
import type { Department, DepartmentKey, Process, Stage, StageKey } from '@/types/domain'

export const departments: Department[] = [
  { key: 'zhaoshang', name: '招商中心', short: '招商', icon: 'megaphone' },
  { key: 'yingjian', name: '营建空间设计部', short: '营建', icon: 'box' },
  { key: 'shichang', name: '总部市场部', short: '市场', icon: 'sparkle' },
  { key: 'kefu', name: '运营中心客服部', short: '客服', icon: 'users' },
  { key: 'peixun', name: '运营中心培训部', short: '培训', icon: 'trophy' },
  { key: 'quyu', name: '运营中心区域运营部', short: '区域', icon: 'map' },
  { key: 'yunnan-online', name: '云南线上运营部', short: '云线', icon: 'pulse' },
  { key: 'yunnan-sysops', name: '云南系统运维部', short: '运维', icon: 'sliders' },
  { key: 'compliance', name: '运营中心合规管理部', short: '合规', icon: 'shield' }
]

export const defaultDepartmentKey: DepartmentKey = 'zhaoshang'

export const stages: Stage[] = [
  { key: 's1', no: 'S1', name: '招商', hint: '线索获取与意向转化' },
  { key: 's2', no: 'S2', name: '资质评估', hint: '加盟商资质与资信审核' },
  { key: 's3', no: 'S3', name: '选址落位', hint: '商圈调研与点位评估' },
  { key: 's4', no: 'S4', name: '签约授权', hint: '合同签署与授权建档' },
  { key: 's5', no: 'S5', name: '筹建交付', hint: '设计施工与物料交付' },
  { key: 's6', no: 'S6', name: '培训认证', hint: '课程培训与开业认证' },
  { key: 's7', no: 'S7', name: '开业运营', hint: '开业筹备与首日保障' },
  { key: 's8', no: 'S8', name: '运营管理诊断', hint: '经营诊断与巡检督导' },
  { key: 's9', no: 'S9', name: '运营策略', hint: '活动策划与线上投放' },
  { key: 's10', no: 'S10', name: '门店焕新', hint: '形象升级与焕新验收' },
  { key: 's11', no: 'S11', name: '续约退出', hint: '续约评估与退出交接' }
]

export const processes: Process[] = [
  { id: 'p-s1-1', stage: 's1', name: '线索登记', owner: 'zhaoshang', co: [] },
  { id: 'p-s1-2', stage: 's1', name: '意向洽谈', owner: 'zhaoshang', co: ['shichang'] },
  { id: 'p-s1-3', stage: 's1', name: '线上招商线索', owner: 'yunnan-online', co: ['zhaoshang'] },

  { id: 'p-s2-1', stage: 's2', name: '资料收集', owner: 'zhaoshang', co: [] },
  { id: 'p-s2-2', stage: 's2', name: '资信审核', owner: 'compliance', co: ['zhaoshang'] },
  { id: 'p-s2-3', stage: 's2', name: '评估结论出具', owner: 'compliance', co: [] },

  { id: 'p-s3-1', stage: 's3', name: '商圈调研', owner: 'quyu', co: ['zhaoshang'] },
  { id: 'p-s3-2', stage: 's3', name: '点位设计评估', owner: 'yingjian', co: [] },
  { id: 'p-s3-3', stage: 's3', name: '选址批复', owner: 'zhaoshang', co: ['quyu'] },

  { id: 'p-s4-1', stage: 's4', name: '合同拟制', owner: 'compliance', co: [] },
  { id: 'p-s4-2', stage: 's4', name: '授权审批', owner: 'zhaoshang', co: [] },
  { id: 'p-s4-3', stage: 's4', name: '系统建档', owner: 'quyu', co: [] },

  { id: 'p-s5-1', stage: 's5', name: '施工图审', owner: 'yingjian', co: [] },
  { id: 'p-s5-2', stage: 's5', name: '工程验收', owner: 'yingjian', co: ['quyu'] },
  { id: 'p-s5-3', stage: 's5', name: '物料交付', owner: 'yunnan-sysops', co: ['quyu'] },

  { id: 'p-s6-1', stage: 's6', name: '课程排期', owner: 'peixun', co: [] },
  { id: 'p-s6-2', stage: 's6', name: '店长认证', owner: 'peixun', co: ['quyu'] },
  { id: 'p-s6-3', stage: 's6', name: '开业考核', owner: 'peixun', co: ['quyu'] },

  { id: 'p-s7-1', stage: 's7', name: '开业筹备', owner: 'quyu', co: ['peixun'] },
  { id: 'p-s7-2', stage: 's7', name: '首日运营保障', owner: 'quyu', co: ['yunnan-sysops'] },
  { id: 'p-s7-3', stage: 's7', name: '客诉工单响应', owner: 'kefu', co: [] },

  { id: 'p-s8-1', stage: 's8', name: '经营诊断', owner: 'quyu', co: [] },
  { id: 'p-s8-2', stage: 's8', name: '巡检评分', owner: 'compliance', co: ['quyu'] },
  { id: 'p-s8-3', stage: 's8', name: '满意度回访', owner: 'kefu', co: [] },
  { id: 'p-s8-4', stage: 's8', name: '设备巡检', owner: 'yunnan-sysops', co: [] },

  { id: 'p-s9-1', stage: 's9', name: '活动策划', owner: 'shichang', co: [] },
  { id: 'p-s9-2', stage: 's9', name: '线上投放', owner: 'yunnan-online', co: ['shichang'] },
  { id: 'p-s9-3', stage: 's9', name: '策略下发', owner: 'quyu', co: ['shichang'] },

  { id: 'p-s10-1', stage: 's10', name: '焕新评估', owner: 'yingjian', co: ['quyu'] },
  { id: 'p-s10-2', stage: 's10', name: '形象升级', owner: 'yingjian', co: [] },
  { id: 'p-s10-3', stage: 's10', name: '焕新验收', owner: 'quyu', co: ['yingjian'] },

  { id: 'p-s11-1', stage: 's11', name: '续约评估', owner: 'zhaoshang', co: ['quyu'] },
  { id: 'p-s11-2', stage: 's11', name: '合同续签', owner: 'compliance', co: [] },
  { id: 'p-s11-3', stage: 's11', name: '退出交接', owner: 'yunnan-sysops', co: ['quyu'] }
]

export const departmentByKey = Object.fromEntries(departments.map((d) => [d.key, d])) as Record<DepartmentKey, Department>
export const stageByKey = Object.fromEntries(stages.map((s) => [s.key, s])) as Record<StageKey, Stage>

export function isDepartmentKey(value: unknown): value is DepartmentKey {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(departmentByKey, value)
}

export function isStageKey(value: unknown): value is StageKey {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(stageByKey, value)
}

/* 路由参数 → 部门：非法参数回落到默认部门 */
export function departmentOfParam(value: string | string[] | undefined): Department {
  const key = typeof value === 'string' ? value : ''
  return isDepartmentKey(key) ? departmentByKey[key] : departmentByKey[defaultDepartmentKey]
}

/* 路由参数 → 阶段：非法参数返回 null */
export function stageOfParam(value: string | string[] | undefined): Stage | null {
  const key = typeof value === 'string' ? value : ''
  return isStageKey(key) ? stageByKey[key] : null
}

export function departmentName(key: string): string {
  return isDepartmentKey(key) ? departmentByKey[key].name : key
}

export function departmentShort(key: string): string {
  return isDepartmentKey(key) ? departmentByKey[key].short : key
}

export function stageName(key: string): string {
  return isStageKey(key) ? stageByKey[key].name : key
}

export function processesOfStage(stageKey: StageKey): Process[] {
  return processes.filter((p) => p.stage === stageKey)
}

/* 部门可见工序：主责 + 协办；其他部门的工序不呈现 */
export function processesOfDepartment(deptKey: DepartmentKey): Process[] {
  return processes.filter((p) => p.owner === deptKey || p.co.includes(deptKey))
}

export function stagesOfDepartment(deptKey: DepartmentKey): Stage[] {
  const used = new Set(processesOfDepartment(deptKey).map((p) => p.stage))
  return stages.filter((s) => used.has(s.key))
}
