<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { echarts, type EChartsCoreOption } from '@/lib/echarts'
import Ico from '@/components/Ico.vue'
import { toast } from '@/composables/useToast'
import { fmtMoneyShort, fmtNum, provinceByShort, provinceStoreByShort } from '@/data/business'
import { CHART_COLORS } from '@/lib/palette'
import type { GeoCollection, MapState } from '@/types/domain'

/* 城市纬度的中国地图比例，避免高纬度被纵向拉伸 */
const CHINA_ASPECT_SCALE = Math.cos((35 * Math.PI) / 180)
/* 不用 "china" 注册名：ECharts 会为它自动追加南海诸岛插图，导致主图偏移 */
const CHINA_MAP_NAME = 'china-mainland'

const mapEl = ref<HTMLDivElement | null>(null)
const mapState = ref<MapState>('loading')
const mapError = ref('')
let chart: ReturnType<typeof echarts.init> | null = null
let resizeObserver: ResizeObserver | null = null

type MetricKey = 'stores' | 'orders' | 'amount'

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'stores', label: '门店数' },
  { key: 'orders', label: '订单量' },
  { key: 'amount', label: '营收' }
]

const metric = ref<MetricKey>('stores')

/* 供应链枢纽与默认色板 */
type HubProvince = '北京' | '上海' | '广东'

const HUB_COLORS: Record<HubProvince, string> = {
  北京: CHART_COLORS[0],
  上海: CHART_COLORS[2],
  广东: CHART_COLORS[3]
}

const LEAF_COLOR = CHART_COLORS[1]

/* 各省会坐标：一个省一个节点，枢纽节点加大 */
interface ProvinceSeed {
  province: string
  city: string
  lng: number
  lat: number
  hub?: HubProvince
}

const PROVINCE_SEEDS: ProvinceSeed[] = [
  { province: '北京', city: '北京', lng: 116.407, lat: 39.904, hub: '北京' },
  { province: '天津', city: '天津', lng: 117.2, lat: 39.084 },
  { province: '河北', city: '石家庄', lng: 114.514, lat: 38.042 },
  { province: '山西', city: '太原', lng: 112.549, lat: 37.857 },
  { province: '内蒙古', city: '呼和浩特', lng: 111.749, lat: 40.842 },
  { province: '辽宁', city: '沈阳', lng: 123.431, lat: 41.805 },
  { province: '吉林', city: '长春', lng: 125.324, lat: 43.887 },
  { province: '黑龙江', city: '哈尔滨', lng: 126.535, lat: 45.803 },
  { province: '上海', city: '上海', lng: 121.473, lat: 31.23, hub: '上海' },
  { province: '江苏', city: '南京', lng: 118.797, lat: 32.06 },
  { province: '浙江', city: '杭州', lng: 120.155, lat: 30.274 },
  { province: '安徽', city: '合肥', lng: 117.227, lat: 31.821 },
  { province: '福建', city: '福州', lng: 119.296, lat: 26.074 },
  { province: '江西', city: '南昌', lng: 115.858, lat: 28.683 },
  { province: '山东', city: '济南', lng: 117.12, lat: 36.651 },
  { province: '河南', city: '郑州', lng: 113.625, lat: 34.746 },
  { province: '湖北', city: '武汉', lng: 114.305, lat: 30.593 },
  { province: '湖南', city: '长沙', lng: 112.939, lat: 28.228 },
  { province: '广东', city: '广州', lng: 113.264, lat: 23.129, hub: '广东' },
  { province: '广西', city: '南宁', lng: 108.366, lat: 22.817 },
  { province: '海南', city: '海口', lng: 110.331, lat: 20.032 },
  { province: '重庆', city: '重庆', lng: 106.551, lat: 29.563 },
  { province: '四川', city: '成都', lng: 104.066, lat: 30.572 },
  { province: '贵州', city: '贵阳', lng: 106.63, lat: 26.647 },
  { province: '云南', city: '昆明', lng: 102.833, lat: 24.88 },
  { province: '西藏', city: '拉萨', lng: 91.14, lat: 29.645 },
  { province: '陕西', city: '西安', lng: 108.939, lat: 34.341 },
  { province: '甘肃', city: '兰州', lng: 103.834, lat: 36.061 },
  { province: '青海', city: '西宁', lng: 101.778, lat: 36.617 },
  { province: '宁夏', city: '银川', lng: 106.231, lat: 38.487 },
  { province: '新疆', city: '乌鲁木齐', lng: 87.617, lat: 43.792 },
  { province: '台湾', city: '台北', lng: 121.565, lat: 25.033 },
  { province: '香港', city: '香港', lng: 114.169, lat: 22.319 },
  { province: '澳门', city: '澳门', lng: 113.549, lat: 22.199 }
]

/* 供应链拓扑：枢纽 → 末端，可直接替换为真实线路数据 */
interface SupplyRoute {
  from: HubProvince
  to: string[]
}

const SUPPLY_ROUTES: SupplyRoute[] = [
  {
    from: '北京',
    to: ['黑龙江', '吉林', '内蒙古', '新疆', '青海', '宁夏', '甘肃', '山东', '天津', '陕西']
  },
  {
    from: '上海',
    to: ['湖北', '河南', '湖南', '西藏', '重庆', '贵州', '江西', '福建', '浙江', '安徽', '江苏']
  },
  { from: '广东', to: ['广西'] }
]

interface ProvinceNode {
  name: string
  value: [number, number, number]
  city: string
  province: string
  role: 'hub' | 'leaf'
  stores: number
  orders: number
  amount: number
  color: string
  symbolSize: number
  itemStyle: { color: string; borderColor: string; borderWidth: number; shadowColor: string; shadowBlur: number }
}

interface SupplyEdge {
  source: string
  target: string
  lineStyle: { color: string; width: number; opacity: number; curveness: number }
}

function fadeColor(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/* 一个省一个省会节点，指标直接取 business.ts 的省份数据 */
function buildNodes(): ProvinceNode[] {
  return PROVINCE_SEEDS.map((seed) => {
    const order = provinceByShort[seed.province]
    const stores = provinceStoreByShort[seed.province] || 0
    const role: 'hub' | 'leaf' = seed.hub ? 'hub' : 'leaf'
    const color = seed.hub ? HUB_COLORS[seed.hub] : LEAF_COLOR
    const size = seed.hub ? 11 : 6.5
    return {
      name: seed.province,
      value: [seed.lng, seed.lat, stores],
      city: seed.city,
      province: seed.province,
      role,
      stores,
      orders: order ? order.orders : 0,
      amount: order ? order.amount : 0,
      color,
      symbolSize: size,
      itemStyle: {
        color,
        borderColor: '#FFFFFF',
        borderWidth: role === 'hub' ? 1.8 : 1.2,
        shadowColor: fadeColor(color, role === 'hub' ? 0.45 : 0.28),
        shadowBlur: role === 'hub' ? 9 : 5
      }
    }
  })
}

function buildEdges(): SupplyEdge[] {
  return SUPPLY_ROUTES.flatMap((route) =>
    route.to.map((target) => ({
      source: route.from,
      target,
      lineStyle: {
        color: fadeColor(HUB_COLORS[route.from], 0.5),
        width: 1,
        opacity: 0.85,
        curveness: 0.12
      }
    }))
  )
}

const nodes = buildNodes()
const edges = buildEdges()
const provinceCount = nodes.length
const hubCount = nodes.filter((n) => n.role === 'hub').length
const routeCount = edges.length

const metricTotalText = computed(() => {
  if (metric.value === 'stores') {
    return `覆盖 ${fmtNum(nodes.reduce((s, n) => s + n.stores, 0))} 家`
  }
  if (metric.value === 'orders') {
    return `覆盖 ${fmtNum(nodes.reduce((s, n) => s + n.orders, 0))} 单`
  }
  return `覆盖 ¥${fmtNum(Math.round(nodes.reduce((s, n) => s + n.amount, 0) / 10000))} 万`
})

function metricRow(label: string, value: string, active: boolean, color: string): string {
  return (
    `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:3px;font-size:10.5px;color:#7A8C95;">` +
    `<span>${label}</span>` +
    `<b style="color:${active ? color : '#25334A'};font-variant-numeric:tabular-nums;">${value}</b></div>`
  )
}

function tooltipHtml(params: { dataType?: string; data?: unknown }): string {
  if (params.dataType === 'edge') {
    const edge = params.data as SupplyEdge
    return (
      `<div style="display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;">` +
      `<i style="width:5px;height:5px;border-radius:99px;background:${edge.lineStyle.color};"></i>` +
      `${edge.source} → ${edge.target}</div>` +
      `<div style="margin-top:4px;font-size:10.5px;color:#7A8C95;">供应链线路</div>`
    )
  }
  const node = params.data as ProvinceNode
  const roleText = node.role === 'hub' ? '供应链枢纽' : '末端节点'
  return (
    `<div style="display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;">` +
    `<i style="width:5px;height:5px;border-radius:99px;background:${node.color};"></i>${node.province}</div>` +
    `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:5px;font-size:10.5px;color:#7A8C95;">` +
    `<span>省会 / 角色</span><b style="color:#25334A;">${node.city} · ${roleText}</b></div>` +
    metricRow('门店数', `${fmtNum(node.stores)} 家`, metric.value === 'stores', node.color) +
    metricRow('订单量', `${fmtNum(node.orders)} 单`, metric.value === 'orders', node.color) +
    metricRow('营收', fmtMoneyShort(node.amount), metric.value === 'amount', node.color)
  )
}

function buildOption(): EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    animationDuration: 600,
    textStyle: { fontFamily: 'inherit' },
    tooltip: {
      trigger: 'item',
      confine: true,
      padding: [9, 11],
      backgroundColor: 'rgba(255,255,255,.98)',
      borderColor: 'rgba(24,24,27,.10)',
      borderWidth: 1,
      extraCssText: 'border-radius:9px;box-shadow:0 16px 32px -24px rgba(24,24,27,.35);',
      formatter: tooltipHtml
    },
    geo: {
      map: CHINA_MAP_NAME,
      roam: false,
      aspectScale: CHINA_ASPECT_SCALE,
      layoutCenter: ['50%', '50%'],
      layoutSize: '96%',
      itemStyle: {
        areaColor: '#F6F7FA',
        borderColor: '#E1E5ED',
        borderWidth: 0.8,
        shadowColor: 'rgba(24,24,27,.08)',
        shadowBlur: 12
      },
      emphasis: {
        itemStyle: { areaColor: '#ECEFF7', borderColor: '#C7CEE0' },
        label: { color: '#3F51B5' }
      },
      select: { disabled: true },
      label: { show: true, color: '#8A90A0', fontSize: 9.5 }
    },
    series: [
      {
        type: 'graph',
        coordinateSystem: 'geo',
        geoIndex: 0,
        symbol: 'circle',
        label: { show: false },
        emphasis: {
          scale: 1.3,
          label: { show: true, color: '#3F51B5', fontSize: 10, fontWeight: 600 }
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 5,
        data: nodes,
        edges
      }
    ]
  }
}

function onChartClick(params: { dataType?: string; componentType?: string; name?: string; data?: unknown }): void {
  if (params.dataType === 'node') {
    const node = params.data as ProvinceNode
    toast(`${node.province} · ${node.city} · ${fmtNum(node.stores)} 家门店`, 'info', 1800)
  }
}

function pointLatitude(point: unknown): number {
  if (Array.isArray(point)) return Number(point[1])
  if (typeof point === 'string') return Number(point.split(' ')[1])
  return Number.NaN
}

async function loadGeo(): Promise<GeoCollection> {
  const res = await fetch(`${import.meta.env.BASE_URL}map/china.json`)
  if (!res.ok) throw new Error(`geo http ${res.status}`)
  const geo = (await res.json()) as GeoCollection
  if (!geo.features || !geo.features.length) throw new Error('geo empty')

  /* 去掉南海诸岛要素，并剔除海南三沙等纬度低于 17.5° 的离岛，
     让主图包围盒只覆盖大陆与海南主岛，才能在卡片里上下居中 */
  geo.features = geo.features.filter((f) => f.properties?.name !== '南海诸岛')
  geo.features.forEach((f) => {
    if (f.geometry?.type !== 'MultiPolygon') return
    const polys = f.geometry.coordinates as unknown as unknown[][][]
    const kept = polys.filter((poly) => {
      const ring = (poly[0] || []) as unknown[]
      return ring.some((pt) => pointLatitude(pt) >= 17.5)
    })
    f.geometry.coordinates = kept as unknown as number[][][][]
  })
  return geo
}

async function initMap(): Promise<void> {
  mapState.value = 'loading'
  try {
    const geo = await loadGeo()
    echarts.registerMap(CHINA_MAP_NAME, geo as unknown as Parameters<typeof echarts.registerMap>[1])
    if (!mapEl.value) return
    chart = echarts.init(mapEl.value)
    chart.setOption(buildOption())
    chart.on('click', onChartClick)
    resizeObserver = new ResizeObserver(() => chart?.resize())
    resizeObserver.observe(mapEl.value)
    mapState.value = 'ready'
  } catch (err) {
    mapState.value = 'error'
    mapError.value = '地图数据加载失败，请刷新页面重试'
    console.error(err)
  }
}

onMounted(initMap)
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <section class="panel map-card">
    <div class="card-head map-head">
      <div class="title-row">
        <span class="card-ico"><Ico name="map" :size="16" /></span>
        <div>
          <div class="card-title-line">
            <span class="card-title">门店地理分布</span>
            <span class="count-pill">{{ metricTotalText }}</span>
          </div>
          <div class="card-sub">省会节点 · 北京 / 上海 / 广东供应链枢纽 · 悬停查看门店</div>
        </div>
      </div>
      <div class="map-tabs" role="tablist" aria-label="地图指标">
        <button
          v-for="m in METRICS"
          :key="m.key"
          type="button"
          role="tab"
          :aria-selected="metric === m.key"
          :class="{ on: metric === m.key }"
          @click="metric = m.key"
        >{{ m.label }}</button>
      </div>
    </div>

    <div class="map-body">
      <div class="map-plot">
        <div ref="mapEl" class="map-canvas" role="img" aria-label="中国省级门店分布与供应链线路地图"></div>

        <div class="map-stats">
          <div><span>覆盖省份</span><b>{{ provinceCount }}</b></div>
          <div><span>供应枢纽</span><b>{{ hubCount }}</b></div>
          <div><span>供应链路</span><b>{{ routeCount }}</b></div>
        </div>

        <div class="map-legend">
          <span class="map-legend-dot hub"></span><span>枢纽</span>
          <span class="map-legend-dot leaf"></span><span>末端</span>
          <span class="map-legend-arrow">→</span><span>供应链线路</span>
        </div>

        <div v-if="mapState !== 'ready'" class="map-overlay">
          <template v-if="mapState === 'error'">
            <span class="map-overlay-art"><Ico name="map" :size="22" /></span>
            <b>地图无法绘制</b>
            <span>{{ mapError }}</span>
          </template>
          <template v-else>
            <div class="boot-dots"><i></i><i></i><i></i><i></i></div>
            <span>正在绘制省级地图…</span>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
