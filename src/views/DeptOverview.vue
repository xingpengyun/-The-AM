<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Ico from '@/components/Ico.vue'
import ProvinceMap from '@/components/ProvinceMap.vue'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { echarts, type EChartsCoreOption } from '@/lib/echarts'
import { CHART_COLORS } from '@/lib/palette'
import { departmentOfParam } from '@/data/org'
import {
  fmtNum,
  provinceByShort,
  provinceOrders,
  provinceStoreTotal,
  storesOfProvince,
  topProvinces
} from '@/data/business'

const props = withDefaults(defineProps<{ global?: boolean }>(), { global: false })

const route = useRoute()

/* 首页 = 跨部门全局视图；部门页只保留空壳，等待业务接入 */
const isGlobal = computed(() => props.global || route.name === 'home')
const dept = computed(() => (isGlobal.value ? null : departmentOfParam(route.params.dept)))
const deptName = computed(() => dept.value?.name ?? '部门')

/* ------------------------------ 看板数据 ------------------------------ */

const totalStores = provinceStoreTotal
const provinceCount = provinceOrders.length
const monthAmountTotal = provinceOrders.reduce((s, p) => s + p.amount, 0)

const lastMonthNew = 26
const monthGrowth = +((lastMonthNew / totalStores) * 100).toFixed(1)

/* 直营 / 加盟拆分：项目暂无该字段，按演示口径占位 */
const directShare = 63.4
const directStores = Math.round((totalStores * directShare) / 100)
const franchiseStores = totalStores - directStores
const franchiseShare = +(100 - directShare).toFixed(1)

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

/* 月销售额：以现有省份订单金额合计为本月基准，向前按淡旺季系数回推 */
const MONTH_FACTORS = [0.71, 0.745, 0.78, 0.805, 0.83, 0.855, 0.88, 0.9, 0.925, 0.95, 0.975, 1]
const monthlySales = MONTH_FACTORS.map((f) => +((monthAmountTotal * f) / 10000).toFixed(1))
const salesNowText = `${fmtNum(monthlySales[11])} 万`

/* 会员：占位演示数据 */
const memberTotal = 2986140
const memberNew = 38420
const memberActive = 1126400
const memberSpark = [2180, 2240, 2310, 2285, 2405, 2468, 2522, 2604, 2640, 2705, 2782, 2861]

/* 门店增长：占位演示数据（新开 / 关闭） */
const openedSeries = [38, 42, 46, 44, 50, 52, 55, 58, 56, 60, 64, 68]
const closedSeries = [18, 20, 19, 22, 21, 23, 25, 24, 26, 27, 28, 30]
const netAdd = openedSeries.reduce((s, v) => s + v, 0) - closedSeries.reduce((s, v) => s + v, 0)
const thisMonthOpen = openedSeries[11]
const thisMonthClose = closedSeries[11]
const netRate = +(((thisMonthOpen - thisMonthClose) / totalStores) * 100).toFixed(1)

/* TOP 5 省份：沿用 business.ts 的订单排名，门店数按同一口径推导 */
const topMaxStores = Math.max(...topProvinces.map((p) => storesOfProvince(provinceByShort[p.name])))
const topRows = topProvinces.map((p) => {
  const stores = storesOfProvince(provinceByShort[p.name])
  return { name: p.name, stores, pct: Math.round((stores / topMaxStores) * 100) }
})
const topStoreTotal = topRows.reduce((s, p) => s + p.stores, 0)
const topShare = ((topStoreTotal / totalStores) * 100).toFixed(1)

const today = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  .format(new Date())
  .replace(/\//g, '-')

/* ------------------------------ 小图表 ------------------------------ */

const salesEl = ref<HTMLDivElement | null>(null)
const memberEl = ref<HTMLDivElement | null>(null)
const trendEl = ref<HTMLDivElement | null>(null)

const charts: ReturnType<typeof echarts.init>[] = []
let chartResizer: ResizeObserver | null = null

const axisPointerLabel = { backgroundColor: CHART_COLORS[0], borderRadius: 4, fontSize: 10 }

function salesOption(): EChartsCoreOption {
  const max = Math.max(...monthlySales) * 1.12
  return {
    backgroundColor: 'transparent',
    animationDuration: 700,
    grid: { left: 2, right: 2, top: 8, bottom: 2 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(84,112,198,.06)' } },
      backgroundColor: 'rgba(255,255,255,.98)',
      borderColor: 'rgba(35,38,59,.10)',
      borderWidth: 1,
      padding: [7, 10],
      extraCssText: 'border-radius:8px;box-shadow:0 12px 26px -20px rgba(35,38,59,.45);',
      textStyle: { color: '#25334A', fontSize: 10.5 },
      formatter: (params: unknown) => {
        const list = params as { axisValue: string; value: number }[]
        return `${list[0].axisValue} · ¥${fmtNum(list[0].value)} 万`
      }
    },
    xAxis: { type: 'category', data: months, show: false },
    yAxis: { type: 'value', show: false, max },
    series: [
      {
        type: 'bar',
        barWidth: '56%',
        data: monthlySales.map((v, i) => ({
          value: v,
          itemStyle: {
            color: i === monthlySales.length - 1 ? CHART_COLORS[0] : '#E4E4E7',
            borderRadius: [3, 3, 0, 0]
          }
        }))
      }
    ]
  }
}

function memberOption(): EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    animationDuration: 800,
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { type: 'category', data: memberSpark.map((_, i) => String(i + 1)), show: false, boundaryGap: false },
    yAxis: { type: 'value', show: false, min: Math.min(...memberSpark) * 0.9 },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: memberSpark,
        lineStyle: { width: 2, color: CHART_COLORS[1] },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(115,192,222,.22)' },
            { offset: 1, color: 'rgba(115,192,222,0)' }
          ])
        }
      }
    ]
  }
}

function trendOption(): EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    animationDuration: 800,
    grid: { left: 2, right: 2, top: 6, bottom: 4 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(84,112,198,.25)' }, label: axisPointerLabel },
      backgroundColor: 'rgba(255,255,255,.98)',
      borderColor: 'rgba(35,38,59,.10)',
      borderWidth: 1,
      padding: [7, 10],
      extraCssText: 'border-radius:8px;box-shadow:0 12px 26px -20px rgba(35,38,59,.45);',
      textStyle: { color: '#25334A', fontSize: 10.5 },
      formatter: (params: unknown) => {
        const list = params as { axisValue: string; seriesName: string; value: number }[]
        const head = `<div style="font-weight:700;margin-bottom:3px;">${list[0].axisValue}</div>`
        return (
          head +
          list
            .map(
              (p) =>
                `<div style="display:flex;justify-content:space-between;gap:14px;">` +
                `<span style="color:#7A8C95;">${p.seriesName}</span><b>${p.value}</b></div>`
            )
            .join('')
        )
      }
    },
    xAxis: { type: 'category', data: months, show: false, boundaryGap: false },
    yAxis: { type: 'value', show: false },
    series: [
      {
        name: '新开',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: openedSeries,
        lineStyle: { width: 2, color: CHART_COLORS[0] },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84,112,198,.2)' },
            { offset: 1, color: 'rgba(84,112,198,0)' }
          ])
        }
      },
      {
        name: '关闭',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: closedSeries,
        lineStyle: { width: 1.6, color: CHART_COLORS[5] }
      }
    ]
  }
}

function mountChart(el: HTMLElement | null, option: EChartsCoreOption): void {
  if (!el) return
  const instance = echarts.init(el)
  instance.setOption(option)
  charts.push(instance)
  chartResizer?.observe(el)
}

onMounted(async () => {
  if (!isGlobal.value) return
  await nextTick()
  chartResizer = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const instance = charts.find((c) => c.getDom() === entry.target)
      instance?.resize()
    })
  })
  mountChart(salesEl.value, salesOption())
  mountChart(memberEl.value, memberOption())
  mountChart(trendEl.value, trendOption())
})

onBeforeUnmount(() => {
  chartResizer?.disconnect()
  chartResizer = null
  charts.forEach((c) => c.dispose())
  charts.length = 0
})
</script>

<template>
  <div class="page-dense home-page">
    <template v-if="isGlobal">
      <div class="dash-head">
        <div>
          <div class="page-kicker"><Ico name="sparkle" :size="10" /> RETAIL INTELLIGENCE</div>
          <div class="dash-title-row">
            <h1>全国门店分布看板</h1>
            <Badge variant="mint">跨部门 · 全局视图</Badge>
          </div>
        </div>
        <div class="dash-chips">
          <span class="dash-chip"><i class="live-dot"></i>实时同步</span>
          <span class="dash-chip"><Ico name="calendar" :size="12" />{{ today }}</span>
        </div>
      </div>

      <div class="dash-grid">
        <!-- 左：KPI 大数字与纵向卡片流 -->
        <div class="col-left">
          <Card class="dash-card kpi-card" tone="mint">
            <div class="eyebrow">General Statistics</div>
            <div class="kpi-title">全国门店总数</div>
            <div class="kpi-num">{{ fmtNum(totalStores) }}<small>家</small></div>
            <div class="kpi-meta">
              <span class="delta"><Ico name="pulse" :size="10" />{{ monthGrowth }}%</span>
              <span>较上月新增 {{ lastMonthNew }} 家 · 覆盖 {{ provinceCount }} 个省级区域</span>
            </div>
          </Card>

          <Card class="dash-card split-card">
            <div class="split-row">
              <span class="split-ic v"><Ico name="box" :size="13" /></span>
              <span class="split-nm">直营门店</span>
              <span class="split-vl">{{ fmtNum(directStores) }}<em>{{ directShare }}%</em></span>
            </div>
            <div class="split-bar"><i :style="{ width: directShare + '%' }"></i></div>
            <div class="split-row">
              <span class="split-ic s"><Ico name="users" :size="13" /></span>
              <span class="split-nm">加盟门店</span>
              <span class="split-vl">{{ fmtNum(franchiseStores) }}<em>{{ franchiseShare }}%</em></span>
            </div>
            <div class="split-bar"><i class="sky" :style="{ width: franchiseShare + '%' }"></i></div>
          </Card>

          <Card class="dash-card sales-card">
            <div class="mini-hd">
              <div>
                <h4>月度销售额</h4>
                <p>近 12 个月 · 单位万元</p>
              </div>
              <span class="pill">+12.4%</span>
            </div>
            <div class="sales-val"><b>¥{{ salesNowText }}</b><span>本月</span></div>
            <div ref="salesEl" class="chart-box"></div>
            <div class="axis-x"><span>1月</span><span>6月</span><span>12月</span></div>
          </Card>

          <Card class="dash-card member-card">
            <div class="mem-top">
              <div>
                <h4>累计会员</h4>
                <div class="mem-num">{{ fmtNum(memberTotal) }}<span>人</span></div>
              </div>
              <span class="pill">+8.2%</span>
            </div>
            <div class="mem-sub">
              <div>本月新增<b>+{{ fmtNum(memberNew) }}</b></div>
              <div>活跃会员<b>{{ fmtNum(memberActive) }}</b></div>
            </div>
            <div ref="memberEl" class="chart-box"></div>
          </Card>
        </div>

        <!-- 中：ECharts geo + graph 地图 -->
        <div class="col-map"><ProvinceMap /></div>

        <!-- 右：窄数据栏 -->
        <div class="col-right">
          <Card class="dash-card trend-card">
            <div class="mini-hd">
              <div>
                <h4>门店增长趋势</h4>
                <p>新开 / 关闭 · 近 12 个月</p>
              </div>
              <span class="pill">月度</span>
            </div>
            <div class="trend-big">+{{ fmtNum(netAdd) }}<em>净增</em></div>
            <div ref="trendEl" class="trend-chart"></div>
            <div class="chart-legend">
              <span><i class="open"></i>新开门店</span>
              <span><i class="close"></i>关闭门店</span>
            </div>
            <div class="stats3">
              <div><span>本月新开</span><b>{{ thisMonthOpen }}</b></div>
              <div><span>本月关闭</span><b>{{ thisMonthClose }}</b></div>
              <div><span>净增率</span><b>+{{ netRate }}%</b></div>
            </div>
          </Card>

          <Card class="dash-card rank-card">
            <div class="mini-hd">
              <div>
                <h4>门店 TOP 5 省份</h4>
                <p>占全国门店总量 {{ topShare }}%</p>
              </div>
              <span class="rank-ico"><Ico name="trophy" :size="13" /></span>
            </div>
            <ul class="rank-list">
              <li v-for="(p, i) in topRows" :key="p.name" class="rank-item">
                <span class="rank-idx">{{ i + 1 }}</span>
                <div class="rank-main">
                  <div class="rank-line"><b>{{ p.name }}</b><span>{{ fmtNum(p.stores) }} 家</span></div>
                  <div class="rank-bar"><span :style="{ width: p.pct + '%' }"></span></div>
                </div>
              </li>
            </ul>
            <div class="rank-foot"><span>口径：直营 + 加盟门店</span><b>查看全部 →</b></div>
          </Card>

          <Card class="dash-card rings-card">
            <div class="ring">
              <div class="ring-g">
                <div class="ring-dial" :style="{ '--pct': directShare + '%', '--ring-color': CHART_COLORS[0] }"></div>
                <b>{{ directShare }}%</b>
              </div>
              <span>直营占比</span>
            </div>
            <div class="ring">
              <div class="ring-g">
                <div class="ring-dial" :style="{ '--pct': franchiseShare + '%', '--ring-color': CHART_COLORS[1] }"></div>
                <b>{{ franchiseShare }}%</b>
              </div>
              <span>加盟占比</span>
            </div>
          </Card>
        </div>
      </div>
    </template>

    <!-- 部门概览：空壳占位 -->
    <template v-else>
      <div class="page-head">
        <div>
          <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · {{ deptName }}</div>
          <div class="page-title-row">
            <h1>运营概览</h1>
            <Badge variant="mint">{{ deptName }} · 部门概览</Badge>
          </div>
        </div>
      </div>

      <Card tone="mint" class="placeholder">
        <div class="ph-art"><Ico name="grid" :size="28" /></div>
        <h2>{{ deptName }} · 部门概览</h2>
        <p>该模块待业务接入</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
.home-page { padding-top: 2px; }

/* ------------------------------ 看板头部 ------------------------------ */
.dash-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px; margin: 0 2px 14px;
}
.dash-title-row { display: flex; align-items: center; gap: 9px; margin-top: 5px; }
.dash-title-row h1 {
  margin: 0; font-size: 23px; font-weight: 780; letter-spacing: -.03em; line-height: 1.1;
}
.dash-chips { display: flex; align-items: center; gap: 8px; }
.dash-chip {
  display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 11px;
  border: 1px solid var(--line); border-radius: 10px;
  background: rgba(255, 255, 255, .82);
  font-size: 10.5px; font-weight: 600; color: var(--ink-2);
}
.live-dot {
  width: 6px; height: 6px; border-radius: 99px; background: var(--brand);
  box-shadow: 0 0 0 3px rgba(24, 24, 27, .12);
  animation: livePulse 2.4s infinite ease-in-out;
}
@keyframes livePulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }

/* ------------------------------ 三栏网格 ------------------------------ */
.dash-grid {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 286px;
  gap: 14px;
  height: calc(100vh - 232px);
  min-height: 600px;
}
.col-left, .col-right { display: flex; flex-direction: column; gap: 12px; min-height: 0; min-width: 0; }
.col-map { min-width: 0; min-height: 0; }

.dash-card { padding: 14px 16px; min-height: 0; }

/* ------------------------------ 左栏 ------------------------------ */
.kpi-card {
  flex: 0 0 auto;
  background: linear-gradient(135deg, var(--candy-mint), #FFFFFF 78%);
}
.eyebrow {
  font-size: 8.5px; font-weight: 750; letter-spacing: .18em;
  text-transform: uppercase; color: var(--brand);
}
.kpi-title { margin-top: 6px; font-size: 11.5px; font-weight: 600; color: var(--ink-2); }
.kpi-num {
  display: flex; align-items: baseline; gap: 5px; margin-top: 2px;
  font-size: 42px; font-weight: 750; line-height: 1; letter-spacing: -.045em;
  font-variant-numeric: tabular-nums;
}
.kpi-num small { font-size: 12px; font-weight: 600; color: var(--ink-3); letter-spacing: 0; }
.kpi-meta {
  display: flex; align-items: center; gap: 8px; margin-top: 10px;
  font-size: 10px; color: var(--ink-3); line-height: 1.4;
}
.delta {
  display: inline-flex; align-items: center; gap: 3px; flex: 0 0 auto;
  padding: 2px 6px; border-radius: 99px;
  background: rgba(24, 24, 27, .06); color: var(--ink-2);
  font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums;
}

.split-card { flex: 0 0 auto; }
.split-row { display: flex; align-items: center; gap: 8px; }
.split-ic {
  width: 24px; height: 24px; flex: 0 0 auto; display: grid; place-items: center;
  border-radius: 8px;
}
.split-ic.v { background: var(--candy-lavender); color: var(--candy-lavender-ink); }
.split-ic.s { background: var(--candy-sky); color: var(--candy-sky-ink); }
.split-nm { flex: 1; font-size: 11.5px; font-weight: 600; color: var(--ink-2); }
.split-vl {
  font-size: 15px; font-weight: 750; letter-spacing: -.02em;
  font-variant-numeric: tabular-nums; color: var(--ink);
}
.split-vl em {
  margin-left: 5px; font-style: normal; font-size: 9.5px;
  font-weight: 600; color: var(--ink-3);
}
.split-bar { height: 4px; margin: 5px 0 8px; border-radius: 99px; background: #F0F0F2; overflow: hidden; }
.split-bar i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #93C5FD, #5470C6); }
.split-bar i.sky { background: linear-gradient(90deg, #7DD3FC, #38BDF8); }

.sales-card, .member-card { flex: 1; display: flex; flex-direction: column; }
.mini-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex: 0 0 auto; }
.mini-hd h4 { margin: 0; font-size: 11.5px; font-weight: 700; color: var(--ink-2); }
.mini-hd p { margin: 3px 0 0; font-size: 9.5px; color: var(--ink-3); }
.pill {
  flex: 0 0 auto; padding: 2px 6px; border-radius: 99px;
  background: var(--brand-soft); color: var(--brand-deep);
  font-size: 9.5px; font-weight: 700; font-variant-numeric: tabular-nums;
}
.sales-val { display: flex; align-items: baseline; gap: 6px; margin-top: 4px; flex: 0 0 auto; }
.sales-val b { font-size: 20px; font-weight: 750; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.sales-val span { font-size: 9.5px; color: var(--ink-3); }
.chart-box { flex: 1; min-height: 0; width: 100%; }
.axis-x {
  display: flex; justify-content: space-between; flex: 0 0 auto;
  margin-top: 2px; font-size: 9px; color: var(--ink-3);
}

.mem-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex: 0 0 auto; }
.mem-top h4 { margin: 0; font-size: 11.5px; font-weight: 700; color: var(--ink-2); }
.mem-num {
  display: flex; align-items: baseline; gap: 4px; margin-top: 4px;
  font-size: 21px; font-weight: 750; letter-spacing: -.035em; font-variant-numeric: tabular-nums;
}
.mem-num span { font-size: 9.5px; font-weight: 600; color: var(--ink-3); letter-spacing: 0; }
.mem-sub {
  display: flex; gap: 14px; flex: 0 0 auto; margin-top: 7px;
  font-size: 9.5px; color: var(--ink-3);
}
.mem-sub div { display: flex; flex-direction: column; gap: 2px; }
.mem-sub b { font-size: 11px; font-weight: 700; color: var(--ink-2); font-variant-numeric: tabular-nums; }

/* ------------------------------ 右栏 ------------------------------ */
.trend-card { flex: 0 0 auto; }
.trend-big {
  margin-top: 5px; font-size: 26px; font-weight: 750;
  letter-spacing: -.04em; line-height: 1.1; font-variant-numeric: tabular-nums;
}
.trend-big em { margin-left: 5px; font-style: normal; font-size: 10px; font-weight: 600; color: var(--ink-3); }
.trend-chart { height: 78px; margin-top: 4px; width: 100%; }
.chart-legend { display: flex; gap: 12px; margin-top: 3px; font-size: 9.5px; color: var(--ink-3); }
.chart-legend span { display: inline-flex; align-items: center; gap: 4px; }
.chart-legend i { width: 7px; height: 7px; border-radius: 99px; }
.chart-legend i.open { background: #5470C6; }
.chart-legend i.close { background: #EE6666; }
.stats3 {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px;
  margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--line-soft);
}
.stats3 span { display: block; font-size: 9px; color: var(--ink-3); }
.stats3 b { display: block; margin-top: 2px; font-size: 12.5px; font-weight: 750; font-variant-numeric: tabular-nums; }

.rank-card { flex: 1; display: flex; flex-direction: column; }
.rank-ico {
  width: 24px; height: 24px; flex: 0 0 auto; display: grid; place-items: center;
  border-radius: 8px; background: var(--candy-lemon); color: var(--candy-lemon-ink);
}
.rank-list {
  list-style: none; margin: 10px 0 0; padding: 0;
  flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 6px;
}
.rank-item { display: grid; grid-template-columns: 15px minmax(0, 1fr); align-items: center; gap: 8px; }
.rank-idx { font-size: 10px; font-weight: 750; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.rank-main { min-width: 0; }
.rank-line { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.rank-line b { font-size: 11.5px; font-weight: 650; }
.rank-line span { font-size: 9.5px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.rank-bar { height: 3px; margin-top: 4px; border-radius: 99px; background: #F0F0F2; overflow: hidden; }
.rank-bar span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #93C5FD, #5470C6); }
.rank-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--line-soft);
  font-size: 9px; color: var(--ink-3);
}
.rank-foot b { color: var(--brand-deep); font-weight: 700; }

.rings-card { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-around; gap: 10px; }
.ring { display: flex; flex-direction: column; align-items: center; gap: 6px; box-shadow: none; outline: none; }
.ring-g, .ring-dial { outline: none; }
.ring-g { position: relative; width: 54px; height: 54px; }
.ring-dial {
  width: 54px; height: 54px; border-radius: 50%;
  background: conic-gradient(var(--ring-color, #5470C6) var(--pct), #E4E4E7 0);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px));
}
.ring-g b {
  position: absolute; inset: 0; display: grid; place-items: center;
  font-size: 11px; font-weight: 750; font-variant-numeric: tabular-nums; color: var(--ink);
}
.ring > span { font-size: 9.5px; color: var(--ink-3); }

/* ------------------------------ 响应式 ------------------------------ */
@media (max-width: 1440px) {
  .dash-grid { grid-template-columns: 272px minmax(0, 1fr) 264px; gap: 12px; }
  .dash-grid { height: calc(100vh - 226px); }
}
@media (max-width: 1180px) {
  .dash-grid { grid-template-columns: 280px minmax(0, 1fr); height: auto; }
  .col-map { min-height: 460px; }
  .col-right {
    grid-column: 1 / -1;
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
  }
  .trend-card, .rank-card, .rings-card { height: 100%; }
}
@media (max-width: 860px) {
  .dash-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .dash-grid { grid-template-columns: minmax(0, 1fr); }
  .col-right { grid-template-columns: minmax(0, 1fr); }
  .col-map { min-height: 380px; }
  .trend-chart { height: 92px; }
}
</style>
