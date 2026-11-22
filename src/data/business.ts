/* 演示数据与派生计算：全部沿用原单文件样张里的口径，未新增或改写任何数值 */
import type {
  ChannelRaw,
  ChannelSegment,
  ChartData,
  ChartRange,
  ChartSet,
  ChartSummary,
  KpiStat,
  KpiStatDef,
  Order,
  OrderStatus,
  PayMethod,
  ProvinceOrder,
  SelectOptionItem,
  StatusStyle,
  TopProvince
} from '@/types/domain'

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function fmtTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function fmtDateCompact(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`
}

export function fmtNum(n: number): string {
  return new Intl.NumberFormat('zh-CN').format(n)
}

export function fmtMoney(n: number): string {
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtMoneyShort(n: number): string {
  return '¥' + Math.round(n).toLocaleString('zh-CN')
}

function buildSpark(values: number[]): { line: string; area: string } {
  const w = 80
  const hgt = 30
  const pad = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i): [number, number] => [
    +((i / (values.length - 1)) * w).toFixed(1),
    +(hgt - pad - ((v - min) / span) * (hgt - pad * 2)).toFixed(1)
  ])
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ')
  return { line, area: `${line} L ${w} ${hgt} L 0 ${hgt} Z` }
}

const people: Array<[string, string]> = [
  ['陈嘉禾', 'chen.jiahe@bonbon.cn'], ['林知远', 'lin.zhiyuan@bonbon.cn'], ['苏亦可', 'su.yike@bonbon.cn'], ['顾清野', 'gu.qingye@bonbon.cn'],
  ['沈砚舟', 'shen.yanzhou@bonbon.cn'], ['周予安', 'zhou.yuan@bonbon.cn'], ['许星辞', 'xu.xingci@bonbon.cn'], ['唐寂', 'tang.ji@bonbon.cn'],
  ['程也', 'cheng.ye@bonbon.cn'], ['江晚吟', 'jiang.wanyin@bonbon.cn'], ['白鹿鸣', 'bai.luming@bonbon.cn'], ['何以安', 'he.yian@bonbon.cn'],
  ['温言', 'wen.yan@bonbon.cn'], ['谢云归', 'xie.yungui@bonbon.cn'], ['陆知夏', 'lu.zhixia@bonbon.cn'], ['段清和', 'duan.qinghe@bonbon.cn'],
  ['韩星野', 'han.xingye@bonbon.cn'], ['叶南舟', 'ye.nanzhou@bonbon.cn'], ['罗一鸣', 'luo.yiming@bonbon.cn'], ['夏未央', 'xia.weiyang@bonbon.cn'],
  ['宋清让', 'song.qingrang@bonbon.cn'], ['秦观澜', 'qin.guanlan@bonbon.cn'], ['方既明', 'fang.jiming@bonbon.cn'], ['孟云舒', 'meng.yunshu@bonbon.cn']
]
const amounts: number[] = [12800, 460, 2350, 680.5, 8620, 398, 1560, 219.9, 4780, 990, 3320, 15800, 760, 2480, 520, 6900, 1080, 860, 4260, 320, 5680, 1990, 7600, 1260]
const pays: PayMethod[] = ['支付宝', '微信支付', '微信支付', '银联', '支付宝', '对公转账', '支付宝', '微信支付', '银联', '支付宝', '微信支付', '对公转账', '支付宝', '银联', '微信支付', '支付宝', '对公转账', '微信支付', '支付宝', '银联', '微信支付', '支付宝', '银联', '对公转账']
const statuses: OrderStatus[] = ['已支付', '待支付', '已完成', '已支付', '已退款', '已支付', '已完成', '待支付', '已支付', '已取消', '已完成', '已支付', '待支付', '已支付', '已退款', '已完成', '已支付', '待支付', '已完成', '已支付', '已取消', '已支付', '已完成', '待支付']
const avatarStyles: Array<[string, string]> = [
  ['#EEF3FF', '#4F6EF7'], ['#E7FBF4', '#0E9F6E'], ['#FFF8E2', '#B07A0A'],
  ['#FFEFF6', '#C02D6B'], ['#F4EFFF', '#6B46E0'], ['#FFF2E9', '#D9611F']
]

const baseTs = new Date(2026, 10, 21, 14, 32, 0).getTime()

export const orders: Order[] = people.map((person, i) => {
  const ts = baseTs - i * 6.2 * 3600 * 1000
  const av = avatarStyles[i % avatarStyles.length]
  return {
    id: 'BB' + fmtDateCompact(ts) + String(89 - i).padStart(3, '0'),
    name: person[0],
    email: person[1],
    amount: amounts[i],
    pay: pays[i],
    status: statuses[i],
    time: fmtTime(ts),
    ts,
    avatarBg: av[0],
    avatarFg: av[1]
  }
})

const sparkSets: number[][] = [
  [21, 24, 22, 27, 25, 30, 28, 33],
  [8, 12, 10, 14, 13, 17, 16, 21],
  [36, 34, 35, 32, 33, 30, 31, 28],
  [18, 16, 17, 14, 15, 12, 13, 10]
]

const statDefs: KpiStatDef[] = [
  { label: '今日成交额', value: '¥128,460.00', icon: 'wallet', delta: '12.4%', up: true, good: true, note: '较昨日', variant: 'plain', color: '#4F6EF7', soft: '#EEF3FF', area: 'rgba(79,110,247,.18)' },
  { label: '新增客户', value: '1,284', icon: 'user-plus', delta: '8.1%', up: true, good: true, note: '较昨日', variant: 'plain', color: '#12B886', soft: '#E7FBF4', area: 'rgba(18,184,134,.18)' },
  { label: '订单转化率', value: '6.82%', icon: 'target', delta: '0.4%', up: false, good: false, note: '较昨日', variant: 'plain', color: '#F2B01E', soft: '#FFF8E2', area: 'rgba(242,176,30,.2)' },
  { label: '退款金额', value: '¥3,268.00', icon: 'refund', delta: '6.2%', up: false, good: true, note: '较昨日', variant: 'plain', color: '#F0508F', soft: '#FFEFF6', area: 'rgba(240,80,143,.18)' }
]

export const stats: KpiStat[] = statDefs.map((def, i) => {
  const sp = buildSpark(sparkSets[i])
  return { ...def, sparkLine: sp.line, sparkArea: sp.area }
})

export const channelRaw: ChannelRaw[] = [
  { name: '自然搜索', value: 20325, color: '#4F6EF7' },
  { name: '直接访问', value: 12582, color: '#7C5CFA' },
  { name: '社交媒体', value: 9195, color: '#12B886' },
  { name: '付费推广', value: 6290, color: '#F97B3D' }
]

export const channelTotal: number = channelRaw.reduce((s, c) => s + c.value, 0)

export const channels: ChannelSegment[] = (() => {
  const R = 72
  const C = 2 * Math.PI * R
  let acc = 0
  return channelRaw.map((c) => {
    const len = (c.value / channelTotal) * C
    const visible = Math.max(len - 6, 0)
    const seg = {
      ...c,
      pct: Math.round((c.value / channelTotal) * 100),
      total: channelTotal,
      dash: `${visible.toFixed(2)} ${(C - visible).toFixed(2)}`,
      offset: (-acc).toFixed(2)
    }
    acc += len
    return seg
  })
})()

export const paymentColor: Record<PayMethod, string> = { 支付宝: '#4F6EF7', 微信支付: '#12B886', 银联: '#F2B01E', 对公转账: '#7C5CFA' }

export const statusStyle: Record<OrderStatus, StatusStyle> = {
  已支付: { bg: '#E7FBF4', fg: '#0E9F6E' },
  待支付: { bg: '#FFF8E2', fg: '#B07A0A' },
  已完成: { bg: '#EEF3FF', fg: '#3B54D6' },
  已退款: { bg: '#FFEFF6', fg: '#C02D6B' },
  已取消: { bg: '#F5F2FB', fg: '#6B6383' }
}

export const statusOptions: SelectOptionItem<OrderStatus>[] = (['已支付', '待支付', '已完成', '已退款', '已取消'] as OrderStatus[]).map((s) => ({ label: s, value: s }))
export const payOptions: SelectOptionItem<PayMethod>[] = (Object.keys(paymentColor) as PayMethod[]).map((p) => ({ label: p, value: p }))

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

export const provinceByShort: Record<string, ProvinceOrder> = Object.fromEntries(provinceOrders.map((p) => [p.name, p]))
export const provinceOrderTotal: number = provinceOrders.reduce((s, p) => s + p.orders, 0)
export const provinceAmountTotal: number = provinceOrders.reduce((s, p) => s + p.amount, 0)
export const provinceMaxOrders: number = Math.max(...provinceOrders.map((p) => p.orders))

/* 门店数：沿用页面既有省份订单数据推导（演示口径，约 60 单/店），无数据地区按 0 处理 */
export const ORDERS_PER_STORE = 60
export function storesOfProvince(p: ProvinceOrder | null | undefined): number {
  return p ? Math.max(1, Math.round(p.orders / ORDERS_PER_STORE)) : 0
}

export const provinceStoreByShort: Record<string, number> = Object.fromEntries(provinceOrders.map((p) => [p.name, storesOfProvince(p)]))
export const provinceStoreTotal: number = provinceOrders.reduce((s, p) => s + storesOfProvince(p), 0)
export const provinceStoreMax: number = Math.max(...provinceOrders.map(storesOfProvince))

const eastProvinces: string[] = ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东']
const eastOrderTotal = provinceOrders.filter((p) => eastProvinces.includes(p.name)).reduce((s, p) => s + p.orders, 0)
export const eastShare: string = ((eastOrderTotal / provinceOrderTotal) * 100).toFixed(1)
const eastStoreTotal = provinceOrders.filter((p) => eastProvinces.includes(p.name)).reduce((s, p) => s + storesOfProvince(p), 0)
export const eastStoreShare: string = ((eastStoreTotal / provinceStoreTotal) * 100).toFixed(1)

export const topProvinces: TopProvince[] = provinceOrders.slice(0, 5).map((p) => ({
  name: p.name,
  orders: p.orders,
  amount: p.amount,
  pct: Math.round((p.orders / provinceMaxOrders) * 100)
}))

export const chartSets: Record<ChartRange, ChartSet> = {
  '7d': {
    labels: ['11/15', '11/16', '11/17', '11/18', '11/19', '11/20', '11/21'],
    axisIndexes: [0, 1, 2, 3, 4, 5, 6],
    cur: [8.6, 9.4, 8.9, 11.2, 10.6, 12.9, 12.4],
    prev: [7.8, 8.2, 8.0, 9.1, 9.6, 9.9, 10.3]
  },
  '30d': {
    labels: ['10/23', '10/24', '10/25', '10/26', '10/27', '10/28', '10/29', '10/30', '10/31', '11/01', '11/02', '11/03', '11/04', '11/05', '11/06', '11/07', '11/08', '11/09', '11/10', '11/11', '11/12', '11/13', '11/14', '11/15', '11/16', '11/17', '11/18', '11/19', '11/20', '11/21'],
    axisIndexes: [0, 6, 12, 18, 24, 29],
    cur: [8.2, 8.9, 8.4, 9.6, 9.1, 10.2, 9.8, 10.6, 11.2, 10.4, 11.8, 12.2, 11.6, 12.8, 13.4, 12.6, 13.8, 14.2, 13.6, 14.8, 15.2, 14.4, 15.6, 16.2, 15.4, 16.8, 17.2, 16.4, 17.6, 18.2],
    prev: [7.4, 7.9, 7.6, 8.4, 8.1, 8.9, 8.6, 9.2, 9.6, 9.0, 10.0, 10.4, 9.9, 10.8, 11.2, 10.5, 11.4, 11.8, 11.2, 12.1, 12.4, 11.8, 12.6, 13.0, 12.5, 13.4, 13.8, 13.2, 14.0, 14.4]
  }
}

export function computeChart(range: ChartRange): ChartData {
  const set = chartSets[range]
  const n = set.cur.length
  const maxRaw = Math.max(...set.cur, ...set.prev)
  const max = Math.ceil(maxRaw / 4) * 4
  const px = (i: number): number => 6 + (i / (n - 1)) * 708
  const py = (v: number): number => 228 - (v / max) * 216
  const toPath = (arr: number[]): string => arr.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ')
  const line = toPath(set.cur)
  return {
    labels: set.labels,
    axisLabels: set.axisIndexes.map((i) => set.labels[i]),
    cur: set.cur,
    prev: set.prev,
    ticks: [0, 1, 2, 3, 4].map((k) => Math.round(max - (max / 4) * k)),
    line,
    prevPath: toPath(set.prev),
    area: `${line} L ${px(n - 1).toFixed(1)} 232 L ${px(0).toFixed(1)} 232 Z`,
    points: set.cur.map((v, i) => ({ x: +px(i).toFixed(1), y: +py(v).toFixed(1) }))
  }
}

export function computeChartSummary(range: ChartRange): ChartSummary {
  const set = chartSets[range]
  const curSum = set.cur.reduce((s, v) => s + v, 0)
  const prevSum = set.prev.reduce((s, v) => s + v, 0)
  const peak = Math.max(...set.cur)
  const delta = ((curSum - prevSum) / prevSum) * 100
  return {
    peak: peak.toFixed(1),
    avg: (curSum / set.cur.length).toFixed(1),
    delta: Math.abs(delta).toFixed(1),
    up: delta >= 0
  }
}
