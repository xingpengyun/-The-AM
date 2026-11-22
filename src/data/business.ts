/* 门店分布地图使用的演示数据与派生计算 */
import type { ProvinceOrder, TopProvince } from '@/types/domain'

export function fmtNum(n: number): string {
  return new Intl.NumberFormat('zh-CN').format(n)
}

export function fmtMoneyShort(n: number): string {
  return '¥' + Math.round(n).toLocaleString('zh-CN')
}

export const provinceOrders: ProvinceOrder[] = [
  { name: '广东', orders: 3280, amount: 1284600 },
  { name: '江苏', orders: 2460, amount: 968400 },
  { name: '浙江', orders: 2210, amount: 876200 },
  { name: '山东', orders: 1980, amount: 742800 },
  { name: '上海', orders: 1740, amount: 691500 },
  { name: '北京', orders: 1620, amount: 638900 },
  { name: '四川', orders: 1480, amount: 562300 },
  { name: '河南', orders: 1320, amount: 498700 },
  { name: '湖北', orders: 1180, amount: 452100 },
  { name: '福建', orders: 1060, amount: 398600 },
  { name: '湖南', orders: 980, amount: 361200 },
  { name: '安徽', orders: 920, amount: 332400 },
  { name: '河北', orders: 860, amount: 308900 },
  { name: '陕西', orders: 780, amount: 286500 },
  { name: '重庆', orders: 720, amount: 264800 },
  { name: '辽宁', orders: 680, amount: 248300 },
  { name: '江西', orders: 620, amount: 226700 },
  { name: '云南', orders: 580, amount: 208400 },
  { name: '广西', orders: 540, amount: 196200 },
  { name: '山西', orders: 480, amount: 172600 },
  { name: '天津', orders: 440, amount: 158900 },
  { name: '贵州', orders: 400, amount: 146500 },
  { name: '黑龙江', orders: 360, amount: 128400 },
  { name: '吉林', orders: 320, amount: 114200 },
  { name: '内蒙古', orders: 300, amount: 106800 },
  { name: '新疆', orders: 260, amount: 92400 },
  { name: '甘肃', orders: 220, amount: 78600 },
  { name: '海南', orders: 180, amount: 64200 },
  { name: '宁夏', orders: 140, amount: 49800 },
  { name: '青海', orders: 110, amount: 38600 },
  { name: '西藏', orders: 70, amount: 24500 },
  { name: '台湾', orders: 260, amount: 92000 },
  { name: '香港', orders: 150, amount: 58000 },
  { name: '澳门', orders: 45, amount: 18000 }
]

export const provinceByShort: Record<string, ProvinceOrder> = Object.fromEntries(
  provinceOrders.map((p) => [p.name, p])
)
export const provinceOrderTotal: number = provinceOrders.reduce((s, p) => s + p.orders, 0)

const provinceMaxOrders: number = Math.max(...provinceOrders.map((p) => p.orders))

/* 门店数：沿用省份订单数据推导（演示口径，约 60 单/店），无数据地区按 0 处理 */
const ORDERS_PER_STORE = 60
export function storesOfProvince(p: ProvinceOrder | null | undefined): number {
  return p ? Math.max(1, Math.round(p.orders / ORDERS_PER_STORE)) : 0
}

export const provinceStoreByShort: Record<string, number> = Object.fromEntries(
  provinceOrders.map((p) => [p.name, storesOfProvince(p)])
)
export const provinceStoreTotal: number = provinceOrders.reduce((s, p) => s + storesOfProvince(p), 0)
export const provinceStoreMax: number = Math.max(...provinceOrders.map(storesOfProvince))

const eastProvinces: string[] = ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东']
const eastStoreTotal = provinceOrders
  .filter((p) => eastProvinces.includes(p.name))
  .reduce((s, p) => s + storesOfProvince(p), 0)
export const eastStoreShare: string = ((eastStoreTotal / provinceStoreTotal) * 100).toFixed(1)

export const topProvinces: TopProvince[] = provinceOrders.slice(0, 5).map((p) => ({
  name: p.name,
  orders: p.orders,
  amount: p.amount,
  pct: Math.round((p.orders / provinceMaxOrders) * 100)
}))
