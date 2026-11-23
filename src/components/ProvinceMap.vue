<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { echarts, type EChartsCoreOption } from '@/lib/echarts'
import Ico from '@/components/Ico.vue'
import { toast } from '@/composables/useToast'
import { fmtMoneyShort, fmtNum, provinceByShort, provinceStoreByShort, storesOfProvince } from '@/data/business'
import type { GeoCollection, MapState } from '@/types/domain'

/* 城市纬度的中国地图比例，避免高纬度被纵向拉伸 */
const CHINA_ASPECT_SCALE = Math.cos((35 * Math.PI) / 180)

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

/* 门店节点：城市坐标 + 所属省份（省份与 business.ts 的省份数据一一对应） */
interface StoreSeed {
  city: string
  province: string
  store: string
  lng: number
  lat: number
}

const STORE_SEEDS: StoreSeed[] = [
  { city: '广州', province: '广东', store: '广州天河店', lng: 113.264, lat: 23.129 },
  { city: '深圳', province: '广东', store: '深圳南山店', lng: 114.058, lat: 22.543 },
  { city: '厦门', province: '福建', store: '厦门思明店', lng: 118.089, lat: 24.479 },
  { city: '福州', province: '福建', store: '福州鼓楼店', lng: 119.296, lat: 26.074 },
  { city: '杭州', province: '浙江', store: '杭州西湖店', lng: 120.155, lat: 30.274 },
  { city: '宁波', province: '浙江', store: '宁波鄞州店', lng: 121.55, lat: 29.874 },
  { city: '上海', province: '上海', store: '上海静安店', lng: 121.473, lat: 31.23 },
  { city: '南京', province: '江苏', store: '南京鼓楼店', lng: 118.797, lat: 32.06 },
  { city: '苏州', province: '江苏', store: '苏州园区店', lng: 120.585, lat: 31.299 },
  { city: '合肥', province: '安徽', store: '合肥政务店', lng: 117.227, lat: 31.821 },
  { city: '武汉', province: '湖北', store: '武汉江汉店', lng: 114.305, lat: 30.593 },
  { city: '长沙', province: '湖南', store: '长沙岳麓店', lng: 112.939, lat: 28.228 },
  { city: '南昌', province: '江西', store: '南昌红谷滩店', lng: 115.858, lat: 28.683 },
  { city: '济南', province: '山东', store: '济南历下店', lng: 117.12, lat: 36.651 },
  { city: '青岛', province: '山东', store: '青岛市南店', lng: 120.383, lat: 36.067 },
  { city: '北京', province: '北京', store: '北京朝阳店', lng: 116.407, lat: 39.904 },
  { city: '天津', province: '天津', store: '天津和平店', lng: 117.2, lat: 39.084 },
  { city: '郑州', province: '河南', store: '郑州金水店', lng: 113.625, lat: 34.746 },
  { city: '西安', province: '陕西', store: '西安雁塔店', lng: 108.939, lat: 34.341 },
  { city: '成都', province: '四川', store: '成都锦江店', lng: 104.066, lat: 30.572 },
  { city: '重庆', province: '重庆', store: '重庆渝中店', lng: 106.551, lat: 29.563 },
  { city: '沈阳', province: '辽宁', store: '沈阳和平店', lng: 123.431, lat: 41.805 },
  { city: '昆明', province: '云南', store: '昆明五华店', lng: 102.833, lat: 24.88 }
]

/* 巡店 / 供货链路：相邻城市串联，后续可换成真实线路表 */
const ROUTE_CHAINS: string[][] = [
  ['广州', '深圳', '厦门', '福州', '杭州', '上海'],
  ['上海', '苏州', '南京', '合肥', '武汉'],
  ['广州', '长沙', '武汉'],
  ['武汉', '南昌', '杭州'],
  ['北京', '天津', '济南', '青岛'],
  ['北京', '郑州', '西安', '成都', '重庆'],
  ['北京', '沈阳'],
  ['成都', '昆明'],
  ['重庆', '长沙']
]

interface StoreNode {
  name: string
  value: [number, number, number]
  city: string
  province: string
  store: string
  stores: number
  orders: number
  amount: number
}

interface StoreEdge {
  source: string
  target: string
}

/* 按城市均分省份指标，余数落到最后一座城市，合计与 business.ts 一致 */
function splitTotal(total: number, count: number, index: number): number {
  const base = Math.floor(total / count)
  return index === count - 1 ? total - base * (count - 1) : base
}

function buildNodes(): StoreNode[] {
  const byProvince = new Map<string, StoreSeed[]>()
  STORE_SEEDS.forEach((seed) => {
    const list = byProvince.get(seed.province)
    if (list) list.push(seed)
    else byProvince.set(seed.province, [seed])
  })

  const nodes: StoreNode[] = []
  byProvince.forEach((seeds, province) => {
    const order = provinceByShort[province]
    const stores = provinceStoreByShort[province] || 0
    const orders = order ? order.orders : 0
    const amount = order ? order.amount : 0
    seeds.forEach((seed, i) => {
      const cityStores = splitTotal(stores, seeds.length, i)
      nodes.push({
        name: seed.city,
        value: [seed.lng, seed.lat, cityStores],
        city: seed.city,
        province,
        store: seed.store,
        stores: cityStores,
        orders: splitTotal(orders, seeds.length, i),
        amount: splitTotal(amount, seeds.length, i)
      })
    })
  })
  return nodes
}

function buildEdges(): StoreEdge[] {
  const edges: StoreEdge[] = []
  ROUTE_CHAINS.forEach((chain) => {
    for (let i = 1; i < chain.length; i++) edges.push({ source: chain[i - 1], target: chain[i] })
  })
  return edges
}

const nodes = buildNodes()
const edges = buildEdges()
const cityCount = nodes.length
const routeCount = edges.length
const provinceCount = new Set(nodes.map((n) => n.province)).size

const metricTotalText = computed(() => {
  if (metric.value === 'stores') {
    return `${fmtNum(nodes.reduce((s, n) => s + n.stores, 0))} 家`
  }
  if (metric.value === 'orders') {
    return `${fmtNum(nodes.reduce((s, n) => s + n.orders, 0))} 单`
  }
  return `¥${fmtNum(Math.round(nodes.reduce((s, n) => s + n.amount, 0) / 10000))} 万`
})

function metricRow(label: string, value: string, active: boolean): string {
  return (
    `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:3px;font-size:10.5px;color:#7A8C95;">` +
    `<span>${label}</span>` +
    `<b style="color:${active ? '#0E7B68' : '#25334A'};font-variant-numeric:tabular-nums;">${value}</b></div>`
  )
}

function tooltipHtml(params: { dataType?: string; data?: unknown }): string {
  if (params.dataType === 'edge') {
    const edge = params.data as StoreEdge
    return (
      `<div style="font-size:11.5px;font-weight:700;">${edge.source} → ${edge.target}</div>` +
      `<div style="margin-top:4px;font-size:10.5px;color:#7A8C95;">巡店 / 供货链路</div>`
    )
  }
  const node = params.data as StoreNode
  return (
    `<div style="display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;">` +
    `<i style="width:5px;height:5px;border-radius:99px;background:#0E7B68;"></i>${node.store}</div>` +
    `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:5px;font-size:10.5px;color:#7A8C95;">` +
    `<span>城市</span><b style="color:#25334A;">${node.province} · ${node.city}</b></div>` +
    metricRow('门店数', `${fmtNum(node.stores)} 家`, metric.value === 'stores') +
    metricRow('订单量', `${fmtNum(node.orders)} 单`, metric.value === 'orders') +
    metricRow('营收', fmtMoneyShort(node.amount), metric.value === 'amount')
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
      borderColor: 'rgba(35,38,59,.10)',
      borderWidth: 1,
      extraCssText: 'border-radius:9px;box-shadow:0 16px 32px -24px rgba(35,38,59,.45);',
      formatter: tooltipHtml
    },
    geo: {
      map: 'china',
      roam: true,
      scaleLimit: { min: 0.8, max: 6 },
      aspectScale: CHINA_ASPECT_SCALE,
      layoutCenter: ['50%', '50%'],
      layoutSize: '100%',
      itemStyle: {
        areaColor: '#F3F9F5',
        borderColor: '#DCE9E1',
        borderWidth: 0.8,
        shadowColor: 'rgba(14,123,104,.10)',
        shadowBlur: 12
      },
      emphasis: {
        itemStyle: { areaColor: '#E7F4EC', borderColor: '#B9DCCB' },
        label: { color: '#0E7B68' }
      },
      select: { disabled: true },
      label: { show: true, color: '#7A8C83', fontSize: 9.5 }
    },
    series: [
      {
        type: 'graph',
        coordinateSystem: 'geo',
        geoIndex: 0,
        symbol: 'circle',
        symbolSize: 7,
        itemStyle: {
          color: '#0E7B68',
          borderColor: '#FFFFFF',
          borderWidth: 1.4,
          shadowColor: 'rgba(14,123,104,.35)',
          shadowBlur: 6
        },
        label: { show: false },
        emphasis: {
          scale: 1.4,
          itemStyle: { color: '#10B981', borderColor: '#FFFFFF' },
          label: { show: true, color: '#0E7B68', fontSize: 10, fontWeight: 600 }
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 5,
        lineStyle: { color: 'rgba(47,185,140,.55)', width: 1, opacity: 0.8, curveness: 0.12 },
        data: nodes,
        edges
      }
    ]
  }
}

function onChartClick(params: { dataType?: string; componentType?: string; name?: string; data?: unknown }): void {
  if (params.dataType === 'node') {
    const node = params.data as StoreNode
    toast(`${node.store} · ${fmtNum(node.stores)} 家门店`, 'info', 1800)
    return
  }
  if (params.componentType === 'geo' && params.name) {
    const info = provinceByShort[params.name]
    toast(`${params.name} · ${fmtNum(storesOfProvince(info))} 家门店`, 'info', 1800)
  }
}

async function loadGeo(): Promise<GeoCollection> {
  const res = await fetch(`${import.meta.env.BASE_URL}map/china.json`)
  if (!res.ok) throw new Error(`geo http ${res.status}`)
  const geo = (await res.json()) as GeoCollection
  if (!geo.features || !geo.features.length) throw new Error('geo empty')
  /* 南海诸岛会拉低整体纬度跨度，主图不画，避免大陆被压扁 */
  geo.features = geo.features.filter((f) => f.properties?.name !== '南海诸岛')
  return geo
}

async function initMap(): Promise<void> {
  mapState.value = 'loading'
  try {
    const geo = await loadGeo()
    echarts.registerMap('china', geo as unknown as Parameters<typeof echarts.registerMap>[1])
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
            <span class="count-pill">覆盖 {{ metricTotalText }}</span>
          </div>
          <div class="card-sub">覆盖 {{ provinceCount }} 省 {{ cityCount }} 城 · 可缩放漫游 · 悬停查看门店与链路</div>
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
        <div ref="mapEl" class="map-canvas" role="img" aria-label="中国城市门店分布与巡店链路地图"></div>

        <div class="map-stats">
          <div><span>覆盖省份</span><b>{{ provinceCount }}</b></div>
          <div><span>覆盖城市</span><b>{{ cityCount }}</b></div>
          <div><span>联动链路</span><b>{{ routeCount }}</b></div>
        </div>

        <div class="map-legend">
          <span class="map-legend-dot"></span><span>门店节点</span>
          <span class="map-legend-arrow">→</span><span>巡店 / 供货链路</span>
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
