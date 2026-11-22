/*
 * 领域类型定义
 * ------------------------------------------------------------------
 * 覆盖组织（部门 / 阶段 / 工序 / 权限）、KPI、订单、渠道、省份地图
 * 与趋势图等核心数据结构，供 data 模块、页面与组件共用。
 */
import type { IconName } from '@/data/icons'

/* ---------------- 部门 ---------------- */

export type DepartmentKey =
  | 'zhaoshang'
  | 'yingjian'
  | 'shichang'
  | 'kefu'
  | 'peixun'
  | 'quyu'
  | 'yunnan-online'
  | 'yunnan-sysops'
  | 'compliance'

export interface Department {
  key: DepartmentKey
  name: string
  short: string
  icon: IconName
}

/* ---------------- 阶段 S1–S11 ---------------- */

export type StageKey =
  | 's1'
  | 's2'
  | 's3'
  | 's4'
  | 's5'
  | 's6'
  | 's7'
  | 's8'
  | 's9'
  | 's10'
  | 's11'

export type StageNo =
  | 'S1'
  | 'S2'
  | 'S3'
  | 'S4'
  | 'S5'
  | 'S6'
  | 'S7'
  | 'S8'
  | 'S9'
  | 'S10'
  | 'S11'

export interface Stage {
  key: StageKey
  no: StageNo
  name: string
  hint: string
}

/* ---------------- 工序 ---------------- */

export interface Process {
  id: string
  stage: StageKey
  name: string
  /* 主责部门 */
  owner: DepartmentKey
  /* 协办部门（只读来源） */
  co: DepartmentKey[]
}

/* owner = 主责可编辑；readonly = 协办只读；none = 与本部门无关 */
export type ProcessRole = 'owner' | 'readonly' | 'none'

export interface ProcessWithRole extends Process {
  role: ProcessRole
}

/* ---------------- 权限规则 ---------------- */

/* 预留的部门级角色覆盖，接入后端后由接口返回值填充 */
export type RoleOverride = Exclude<ProcessRole, 'none'>
export type RoleOverrideMap = Partial<Record<DepartmentKey, Record<string, RoleOverride>>>
export type EditableStageMap = Partial<Record<DepartmentKey, StageKey[]>>

/* ---------------- KPI ---------------- */

export type KpiVariant = 'plain'

export interface KpiStat {
  label: string
  value: string
  icon: IconName
  delta: string
  up: boolean
  good: boolean
  note: string
  variant: KpiVariant
  color: string
  soft: string
  area: string
  sparkLine: string
  sparkArea: string
}

/* 数据源定义：迷你折线路径由 buildSpark 派生 */
export type KpiStatDef = Omit<KpiStat, 'sparkLine' | 'sparkArea'>

/* ---------------- 订单 ---------------- */

export type PayMethod = '支付宝' | '微信支付' | '银联' | '对公转账'
export type OrderStatus = '已支付' | '待支付' | '已完成' | '已退款' | '已取消'

export interface Order {
  id: string
  name: string
  email: string
  amount: number
  pay: PayMethod
  status: OrderStatus
  time: string
  ts: number
  avatarBg: string
  avatarFg: string
}

export interface StatusStyle {
  bg: string
  fg: string
}

export interface SelectOptionItem<T extends string = string> {
  label: T
  value: T
}

/* ---------------- 渠道分布 ---------------- */

export interface ChannelRaw {
  name: string
  value: number
  color: string
}

export interface ChannelSegment extends ChannelRaw {
  /* 占比（整数百分比） */
  pct: number
  total: number
  /* SVG stroke-dasharray / dashoffset */
  dash: string
  offset: string
}

/* ---------------- 省份 / 地图 ---------------- */

export interface ProvinceOrder {
  name: string
  orders: number
  amount: number
}

export interface ProvinceStoreInfo {
  name: string
  stores: number
  orders: number
  amount: number
  hasData: boolean
  share: number
  pct: number
}

export interface TopProvince {
  name: string
  orders: number
  amount: number
  pct: number
}

export interface MapShape {
  name: string
  d: string
  stores: number
  hasData: boolean
  fill: string
  onDark: boolean
  /* 锚点与标签坐标 */
  ax: number
  ay: number
  lx: number
  ly: number
  /* 面积极小的直辖市 / 特别行政区使用胶囊标签 + 引线 */
  pill: boolean
  pw: number
  leader: boolean
}

export interface MapTip {
  name: string
  x: number
  y: number
  stores: number
  orders: number
  hasData: boolean
}

export type MapState = 'loading' | 'ready' | 'error'

/* ---------------- GeoJSON（最小声明，避免引入额外依赖） ---------------- */

/* 线性环：[[lng, lat], ...] */
export type LinearRing = number[][]

export interface GeoProperties {
  name?: string
  cp?: [number, number]
  [key: string]: unknown
}

export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: LinearRing[]
}

export interface MultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: LinearRing[][]
}

export type GeoGeometry = PolygonGeometry | MultiPolygonGeometry

export interface GeoFeature {
  type?: string
  properties?: GeoProperties
  geometry?: GeoGeometry
}

export interface GeoCollection {
  type?: string
  features: GeoFeature[]
}

/* ---------------- 趋势图 ---------------- */

export type ChartRange = '7d' | '30d'

export interface ChartSet {
  labels: string[]
  axisIndexes: number[]
  cur: number[]
  prev: number[]
}

export interface ChartPoint {
  x: number
  y: number
}

export interface ChartData {
  labels: string[]
  axisLabels: string[]
  cur: number[]
  prev: number[]
  ticks: number[]
  line: string
  prevPath: string
  area: string
  points: ChartPoint[]
}

export interface ChartSummary {
  peak: string
  avg: string
  delta: string
  up: boolean
}

export interface ChartHover {
  x: number
  y: number
  label: string
  cur: string
  prev: string
  tipLeft: number
  tipTop: number
}
