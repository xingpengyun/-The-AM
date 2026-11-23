/*
 * 领域类型定义
 * ------------------------------------------------------------------
 * 覆盖组织（部门 / 阶段 / 工序）、省份 / 地图与 GeoJSON 等核心数据结构，
 * 供 data 模块、页面与组件共用。
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
