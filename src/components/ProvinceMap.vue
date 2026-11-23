<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Ico from '@/components/Ico.vue'
import { toast } from '@/composables/useToast'
import geoSourceRaw from '@/data/china-geo.json'
import {
  fmtNum,
  fmtMoneyShort,
  provinceByShort,
  provinceOrders,
  provinceOrderTotal,
  provinceStoreByShort,
  provinceStoreTotal,
  provinceStoreMax,
  eastStoreShare,
  topProvinces
} from '@/data/business'
import type {
  GeoCollection,
  GeoFeature,
  LinearRing,
  MapShape,
  MapState,
  MapTip,
  ProvinceStoreInfo
} from '@/types/domain'

const mapPlotEl = ref<HTMLDivElement | null>(null)
const mapState = ref<MapState>('loading')
const mapError = ref('')
const selectedProvince = ref<ProvinceStoreInfo | null>(null)
const mapShapes = ref<MapShape[]>([])
const mapTip = ref<MapTip | null>(null)
let mapGeo: GeoCollection | null = null

const geoSource = geoSourceRaw as unknown as GeoCollection

const MAP_VIEW_W = 840
const MAP_VIEW_H = 600
const MAP_PAD = 24
/* 门店数多色分级：浅绿 → 翡翠绿，明度统一递减 */
const MAP_STOPS = ['#EAF7F1', '#D5F0E3', '#B7E6D2', '#8FD9BE', '#5FC9A4', '#2FB98C']
/* 东部紧凑省份的标签外移，配合引线避免数字互相叠压 */
const MAP_LABEL_OFFSETS: Record<string, [number, number]> = {
  北京: [-30, -22], 天津: [30, 7], 上海: [39, -5], 香港: [27, 20],
  澳门: [-31, 27], 海南: [-13, 15], 宁夏: [0, -11], 江苏: [-15, -8],
  浙江: [14, 14], 安徽: [-13, 5], 台湾: [13, 1], 重庆: [-9, 11],
  河北: [8, 24]
}
/* 面积极小的直辖市/特别行政区：门店数用白色胶囊标签外移显示 */
const MAP_PILLS = ['北京', '天津', '上海', '香港', '澳门']

const provinceCount = provinceOrders.length

function shortenProvince(name: string | undefined): string {
  return String(name || '')
    .replace(/特别行政区$/, '')
    .replace(/(壮族|回族|维吾尔)自治区$/, '')
    .replace(/自治区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '')
}

function geoMaxLat(coords: unknown): number {
  let max = -90
  ;(function walk(node: unknown) {
    if (!Array.isArray(node)) return
    if (typeof node[0] === 'number' && typeof node[1] === 'number') {
      if (node[1] > max) max = node[1]
      return
    }
    for (let i = 0; i < node.length; i++) walk(node[i])
  })(coords)
  return max
}

function normalizeGeo(geo: GeoCollection): GeoCollection {
  if (!geo || !geo.features || !geo.features.length) throw new Error('invalid geo')
  const kept: GeoFeature[] = []
  geo.features.forEach((f) => {
    if (!f || !f.properties) return
    if (typeof f.properties.name === 'string') {
      f.properties.name = shortenProvince(f.properties.name)
    }
    /* 南海诸岛另以右下角小插图呈现，不参与主图范围计算 */
    if (f.properties.name === '南海诸岛') return
    const geom = f.geometry
    if (f.properties.name === '海南' && geom) {
      if (geom.type === 'MultiPolygon') {
        geom.coordinates = geom.coordinates.filter((poly) => geoMaxLat(poly) >= 17)
      } else {
        geom.coordinates = geom.coordinates.filter((ring) => geoMaxLat(ring) >= 17)
      }
    }
    kept.push(f)
  })
  geo.features = kept
  return geo
}

function polygonsOf(feature: GeoFeature): LinearRing[][] {
  const g = feature.geometry
  if (!g || !g.coordinates) return []
  if (g.type === 'Polygon') return [g.coordinates]
  if (g.type === 'MultiPolygon') return g.coordinates
  return []
}

/* 墨卡托投影：经度取 x，纬度经投影后取 -y，避免高纬度地区被拉伸 */
function projectPoint(lng: number, lat: number): [number, number] {
  const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
  return [lng, -(y * 180) / Math.PI]
}

function mapFillOf(stores: number): string {
  if (!stores) return '#F1F8F4'
  const t = Math.pow(Math.max(0, Math.min(1, stores / provinceStoreMax)), 0.55)
  const pos = t * (MAP_STOPS.length - 1)
  const i = Math.min(MAP_STOPS.length - 2, Math.floor(pos))
  const f = pos - i
  const rgb = (hex: string): number[] => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
  const a = rgb(MAP_STOPS[i])
  const b = rgb(MAP_STOPS[i + 1])
  return 'rgb(' + [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f)
  ].join(',') + ')'
}

function buildMapShapes(geo: GeoCollection): MapShape[] {
  const feats = geo.features || []
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  feats.forEach((f) => {
    polygonsOf(f).forEach((poly) => {
      poly.forEach((ring) => {
        ring.forEach((pt) => {
          const p = projectPoint(pt[0], pt[1])
          if (p[0] < minX) minX = p[0]
          if (p[0] > maxX) maxX = p[0]
          if (p[1] < minY) minY = p[1]
          if (p[1] > maxY) maxY = p[1]
        })
      })
    })
  })
  if (!isFinite(minX) || !isFinite(maxY)) throw new Error('geo bounds invalid')

  const scale = Math.min(
    (MAP_VIEW_W - MAP_PAD * 2) / (maxX - minX),
    (MAP_VIEW_H - MAP_PAD * 2) / (maxY - minY)
  )
  const offX = (MAP_VIEW_W - (maxX - minX) * scale) / 2 - minX * scale
  const offY = (MAP_VIEW_H - (maxY - minY) * scale) / 2 - minY * scale

  const sx = (p: number[]): number => +(p[0] * scale + offX).toFixed(1)
  const sy = (p: number[]): number => +(p[1] * scale + offY).toFixed(1)

  const shapes: MapShape[] = []
  feats.forEach((f) => {
    const props = f.properties
    const name = props && props.name
    if (!name) return
    const polys = polygonsOf(f)
    if (!polys.length) return

    let d = ''
    let anchor: [number, number] | null = null
    let anchorArea = -1
    polys.forEach((poly) => {
      poly.forEach((ring) => {
        let seg = ''
        let rMinX = Infinity
        let rMinY = Infinity
        let rMaxX = -Infinity
        let rMaxY = -Infinity
        for (let i = 0; i < ring.length; i++) {
          const p = projectPoint(ring[i][0], ring[i][1])
          const x = sx(p)
          const y = sy(p)
          seg += `${i ? 'L' : 'M'}${x} ${y}`
          if (x < rMinX) rMinX = x
          if (x > rMaxX) rMaxX = x
          if (y < rMinY) rMinY = y
          if (y > rMaxY) rMaxY = y
        }
        d += seg + 'Z'
        const area = (rMaxX - rMinX) * (rMaxY - rMinY)
        if (area > anchorArea) {
          anchorArea = area
          anchor = [(rMinX + rMaxX) / 2, (rMinY + rMaxY) / 2]
        }
      })
    })
    if (!d) return

    const cp = props && props.cp
    if (cp && cp.length === 2) {
      const point = projectPoint(cp[0], cp[1])
      anchor = [sx(point), sy(point)]
    }
    if (!anchor) return

    const stores = provinceStoreByShort[name] || 0
    const off = MAP_LABEL_OFFSETS[name] || [0, 0]
    const pill = MAP_PILLS.indexOf(name) > -1
    shapes.push({
      name,
      d,
      stores,
      hasData: stores > 0,
      fill: mapFillOf(stores),
      onDark: stores >= provinceStoreMax * 0.62,
      ax: +anchor[0].toFixed(1),
      ay: +anchor[1].toFixed(1),
      lx: +(anchor[0] + off[0]).toFixed(1),
      ly: +(anchor[1] + off[1]).toFixed(1),
      pill,
      pw: 18 + String(stores).length * 7,
      leader: pill
    })
  })
  if (!shapes.length) throw new Error('geo shapes empty')
  return shapes
}

function provinceStoreInfo(name: string): ProvinceStoreInfo {
  const p = provinceByShort[name]
  const stores = provinceStoreByShort[name] || 0
  return {
    name,
    stores,
    orders: p ? p.orders : 0,
    amount: p ? p.amount : 0,
    hasData: !!p,
    share: provinceStoreTotal ? +((stores / provinceStoreTotal) * 100).toFixed(1) : 0,
    pct: provinceStoreMax ? Math.round((stores / provinceStoreMax) * 100) : 0
  }
}

function selectProvinceByName(name: string): void {
  if (!name) return
  if (selectedProvince.value && selectedProvince.value.name === name) {
    clearProvinceSelection()
    return
  }
  const info = provinceStoreInfo(name)
  selectedProvince.value = info
  mapTip.value = null
  toast(`${name} · ${fmtNum(info.stores)} 家门店`, 'info', 1800)
}

function clearProvinceSelection(): void {
  selectedProvince.value = null
}

function onProvinceMove(shape: MapShape, e: MouseEvent): void {
  const host = mapPlotEl.value
  if (!host) return
  const rect = host.getBoundingClientRect()
  const x = Math.min(rect.width - 76, Math.max(76, e.clientX - rect.left))
  const y = Math.max(72, e.clientY - rect.top)
  const info = provinceStoreInfo(shape.name)
  mapTip.value = {
    name: shape.name,
    x: Math.round(x),
    y: Math.round(y),
    stores: info.stores,
    orders: info.orders,
    hasData: info.hasData
  }
}

function onProvinceLeave(): void {
  mapTip.value = null
}

function initMap(): void {
  mapState.value = 'loading'
  try {
    if (!mapGeo) mapGeo = normalizeGeo(geoSource)
    mapShapes.value = buildMapShapes(mapGeo)
    mapState.value = 'ready'
  } catch (err) {
    mapState.value = 'error'
    mapError.value = '内联地图数据解析失败，请刷新页面重试'
    console.error(err)
  }
}

onMounted(initMap)
</script>

<template>
  <section class="panel map-card">
    <div class="card-head">
      <div class="title-row">
        <span class="card-ico"><Ico name="map" :size="16" /></span>
        <div>
          <div class="card-title-line">
            <span class="card-title">各地区门店分布</span>
            <span class="count-pill">{{ fmtNum(provinceStoreTotal) }} 家</span>
          </div>
          <div class="card-sub">省级门店分布 · 点击省份查看门店数明细</div>
        </div>
      </div>
      <span class="map-badge"><i></i>覆盖 {{ provinceCount }} 个地区</span>
    </div>

    <div class="map-body">
      <div ref="mapPlotEl" class="map-plot">
        <svg viewBox="0 0 840 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="中国省级门店分布地图">
          <g class="map-land">
            <path
              v-for="p in mapShapes"
              :key="p.name"
              class="province"
              :class="{ selected: selectedProvince && selectedProvince.name === p.name }"
              :d="p.d"
              :data-name="p.name"
              :fill="selectedProvince && selectedProvince.name === p.name ? '#0E7B68' : p.fill"
              @click="selectProvinceByName(p.name)"
              @mousemove="onProvinceMove(p, $event)"
              @mouseleave="onProvinceLeave"
            ></path>
          </g>
          <g>
            <template v-for="p in mapShapes" :key="'l-' + p.name">
              <g v-if="p.pill" class="label-pill">
                <line :x1="p.ax" :y1="p.ay" :x2="p.lx" :y2="p.ly" class="label-leader"></line>
                <rect :x="p.lx - p.pw / 2" :y="p.ly - 8" :width="p.pw" height="16" rx="8"></rect>
                <text :x="p.lx" :y="p.ly + 0.5" text-anchor="middle" dominant-baseline="middle">{{ p.stores }}</text>
              </g>
              <text
                v-else
                class="province-label"
                :class="{
                  'on-dark': selectedProvince && selectedProvince.name === p.name ? true : p.onDark,
                  'on-light': !(selectedProvince && selectedProvince.name === p.name) && !p.onDark,
                  selected: selectedProvince && selectedProvince.name === p.name
                }"
                :x="p.lx"
                :y="p.ly"
                text-anchor="middle"
                dominant-baseline="middle"
              >{{ p.stores }}</text>
            </template>
          </g>
        </svg>

        <div class="map-legend">
          <span>门店数</span>
          <span class="map-legend-bar"></span>
          <span class="map-legend-scale">少 → 多</span>
        </div>

        <div class="map-inset" aria-hidden="true">
          <svg viewBox="0 0 74 26">
            <path d="M17 12l7-4 9 2 5 6-3 7-9 1-7-6z" fill="#CADAD0" stroke="#FFFFFF" stroke-width="1" />
            <circle cx="48" cy="9" r="1.5" fill="#A9C4B1" />
            <circle cx="56" cy="17" r="1.1" fill="#A9C4B1" />
          </svg>
          南海诸岛
        </div>

        <div v-if="mapTip" class="map-tip" :style="{ left: mapTip.x + 'px', top: mapTip.y + 'px' }">
          <div class="map-tip-name"><i></i>{{ mapTip.name }}</div>
          <div v-if="mapTip.hasData" class="map-tip-row"><span>门店数</span><b>{{ fmtNum(mapTip.stores) }} 家</b></div>
          <div v-if="mapTip.hasData" class="map-tip-row"><span>订单量</span><b>{{ fmtNum(mapTip.orders) }} 单</b></div>
          <div v-if="!mapTip.hasData" class="map-tip-empty">暂无门店数据（按 0 计）</div>
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

      <aside class="map-rail">
        <div class="rail-total">
          <div class="rail-total-label">全国门店总数</div>
          <div class="rail-total-num"><b>{{ fmtNum(provinceStoreTotal) }}</b><span>家</span></div>
          <div class="rail-total-sub">
            <span>覆盖 {{ provinceCount }} 个地区</span>
            <b>{{ fmtNum(provinceOrderTotal) }} 单</b>
          </div>
        </div>

        <div v-if="selectedProvince" class="rail-detail">
          <button class="rail-detail-close" type="button" aria-label="关闭省份明细" @click="clearProvinceSelection">×</button>
          <div class="rail-detail-head">
            <span class="rail-detail-name">{{ selectedProvince.name }}</span>
            <span class="rail-detail-chip" :class="{ empty: !selectedProvince.hasData }">{{ selectedProvince.hasData ? '已选中' : '暂无数据' }}</span>
          </div>
          <div class="rail-detail-num"><b>{{ fmtNum(selectedProvince.stores) }}</b><span>家门店</span></div>
          <div class="rail-detail-rows">
            <div><span>订单量</span><b>{{ fmtNum(selectedProvince.orders) }} 单</b></div>
            <div><span>订单金额</span><b>{{ fmtMoneyShort(selectedProvince.amount) }}</b></div>
            <div><span>全国门店占比</span><b>{{ selectedProvince.share }}%</b></div>
          </div>
          <div class="rail-detail-bar"><span :style="{ width: selectedProvince.pct + '%' }"></span></div>
        </div>

        <div v-else class="rail-insight">
          <div class="rail-insight-top"><span>华东门店占比</span><b>{{ eastStoreShare }}%</b></div>
          <div class="rail-insight-bar"><span :style="{ width: eastStoreShare + '%' }"></span></div>
          <div class="rail-insight-hint"><i></i>点击地图省份查看门店数</div>
        </div>

        <div class="rail-rank">
          <div class="rail-rank-title">
            <span>省份订单 TOP 5</span>
            <span>订单量</span>
          </div>
          <ul class="rail-rank-list">
            <li v-for="(p, i) in topProvinces" :key="p.name" class="rail-rank-item">
              <span class="rail-rank-idx">{{ i + 1 }}</span>
              <div class="rail-rank-main">
                <div class="rail-rank-line"><b>{{ p.name }}</b><span>{{ fmtNum(p.orders) }} 单</span></div>
                <div class="rail-rank-bar"><span :style="{ width: p.pct + '%' }"></span></div>
              </div>
              <span class="rail-rank-amount">{{ fmtMoneyShort(p.amount) }}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</template>
