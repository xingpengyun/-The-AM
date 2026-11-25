import { useEffect, useRef, type CSSProperties } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Ico from '@/components/Ico'
import ProvinceMap from '@/components/ProvinceMap'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { echarts, type EChartsCoreOption } from '@/lib/echarts'
import { CHART_COLORS, STATUS_COLORS } from '@/lib/palette'
import { departmentOfParam } from '@/data/org'
import {
  fmtNum,
  provinceByShort,
  provinceOrders,
  provinceStoreTotal,
  storesOfProvince,
  topProvinces
} from '@/data/business'
import './DeptOverview.css'

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

const axisPointerLabel = { backgroundColor: CHART_COLORS[0], borderRadius: 4, fontSize: 10 }

function salesOption(): EChartsCoreOption {
  const max = Math.max(...monthlySales) * 1.12
  return {
    backgroundColor: 'transparent',
    animationDuration: 700,
    grid: { left: 2, right: 2, top: 8, bottom: 2 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(14,165,233,.06)' } },
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
        lineStyle: { width: 2, color: CHART_COLORS[2] },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139,92,246,.20)' },
            { offset: 1, color: 'rgba(139,92,246,0)' }
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
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(14,165,233,.25)' }, label: axisPointerLabel },
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
        lineStyle: { width: 2, color: CHART_COLORS[1] },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16,185,129,.18)' },
            { offset: 1, color: 'rgba(16,185,129,0)' }
          ])
        }
      },
      {
        name: '关闭',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: closedSeries,
        lineStyle: { width: 1.6, color: STATUS_COLORS.negative }
      }
    ]
  }
}

export interface DeptOverviewProps {
  global?: boolean
}

export default function DeptOverview({ global = false }: DeptOverviewProps) {
  const location = useLocation()
  const { dept: deptParam } = useParams()

  /* 首页 = 跨部门全局视图；部门页只保留空壳，等待业务接入 */
  const isGlobal = global || location.pathname === '/home'
  const dept = isGlobal ? null : departmentOfParam(deptParam)
  const deptName = dept?.name ?? '部门'

  const salesEl = useRef<HTMLDivElement | null>(null)
  const memberEl = useRef<HTMLDivElement | null>(null)
  const trendEl = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isGlobal) return
    const charts: ReturnType<typeof echarts.init>[] = []

    const resizer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const instance = charts.find((c) => c.getDom() === entry.target)
        instance?.resize()
      })
    })

    const pending: ResizeObserver[] = []

    function mountChart(el: HTMLElement | null, option: EChartsCoreOption): void {
      if (!el) return
      const start = (): boolean => {
        /* 容器还没量出宽高时不要初始化，避免 ECharts 0 尺寸警告 */
        if (el.clientWidth === 0 || el.clientHeight === 0) return false
        const instance = echarts.init(el)
        instance.setOption(option)
        charts.push(instance)
        resizer.observe(el)
        return true
      }
      if (start()) return
      const waiter = new ResizeObserver(() => {
        if (!start()) return
        waiter.disconnect()
        const index = pending.indexOf(waiter)
        if (index >= 0) pending.splice(index, 1)
      })
      waiter.observe(el)
      pending.push(waiter)
    }

    /* 等两帧，确保卡片在路由过渡 / 布局完成后有真实宽高，避免 0 尺寸初始化警告 */
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        mountChart(salesEl.current, salesOption())
        mountChart(memberEl.current, memberOption())
        mountChart(trendEl.current, trendOption())
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      pending.forEach((waiter) => waiter.disconnect())
      pending.length = 0
      resizer.disconnect()
      charts.forEach((c) => c.dispose())
      charts.length = 0
    }
  }, [isGlobal])

  return (
    <div className="page-dense home-page">
      {isGlobal ? (
        <>
          <div className="dash-head">
            <div>
              <div className="page-kicker">
                <Ico name="sparkle" size={10} /> RETAIL INTELLIGENCE
              </div>
              <div className="dash-title-row">
                <h1>全国门店分布看板</h1>
                <Badge variant="mint">跨部门 · 全局视图</Badge>
              </div>
            </div>
            <div className="dash-chips">
              <span className="dash-chip">
                <i className="live-dot"></i>实时同步
              </span>
              <span className="dash-chip">
                <Ico name="calendar" size={12} />
                {today}
              </span>
            </div>
          </div>

          <div className="dash-grid">
            {/* 左：KPI 大数字与纵向卡片流 */}
            <div className="col-left">
              <Card className="dash-card kpi-card" tone="mint">
                <div className="eyebrow">General Statistics</div>
                <div className="kpi-title">全国门店总数</div>
                <div className="kpi-num">
                  {fmtNum(totalStores)}
                  <small>家</small>
                </div>
                <div className="kpi-meta">
                  <span className="delta">
                    <Ico name="pulse" size={10} />
                    {monthGrowth}%
                  </span>
                  <span>
                    较上月新增 {lastMonthNew} 家 · 覆盖 {provinceCount} 个省级区域
                  </span>
                </div>
              </Card>

              <Card className="dash-card split-card">
                <div className="split-row">
                  <span className="split-ic v">
                    <Ico name="box" size={13} />
                  </span>
                  <span className="split-nm">直营门店</span>
                  <span className="split-vl">
                    {fmtNum(directStores)}
                    <em>{directShare}%</em>
                  </span>
                </div>
                <div className="split-bar">
                  <i style={{ width: `${directShare}%` }}></i>
                </div>
                <div className="split-row">
                  <span className="split-ic s">
                    <Ico name="users" size={13} />
                  </span>
                  <span className="split-nm">加盟门店</span>
                  <span className="split-vl">
                    {fmtNum(franchiseStores)}
                    <em>{franchiseShare}%</em>
                  </span>
                </div>
                <div className="split-bar">
                  <i className="sky" style={{ width: `${franchiseShare}%` }}></i>
                </div>
              </Card>

              <Card className="dash-card sales-card">
                <div className="mini-hd">
                  <div>
                    <h4>月度销售额</h4>
                    <p>近 12 个月 · 单位万元</p>
                  </div>
                  <span className="pill">+12.4%</span>
                </div>
                <div className="sales-val">
                  <b>¥{salesNowText}</b>
                  <span>本月</span>
                </div>
                <div ref={salesEl} className="chart-box"></div>
                <div className="axis-x">
                  <span>1月</span>
                  <span>6月</span>
                  <span>12月</span>
                </div>
              </Card>

              <Card className="dash-card member-card">
                <div className="mem-top">
                  <div>
                    <h4>累计会员</h4>
                    <div className="mem-num">
                      {fmtNum(memberTotal)}
                      <span>人</span>
                    </div>
                  </div>
                  <span className="pill">+8.2%</span>
                </div>
                <div className="mem-sub">
                  <div>
                    本月新增<b>+{fmtNum(memberNew)}</b>
                  </div>
                  <div>
                    活跃会员<b>{fmtNum(memberActive)}</b>
                  </div>
                </div>
                <div ref={memberEl} className="chart-box"></div>
              </Card>
            </div>

            {/* 中：ECharts geo + graph 地图 */}
            <div className="col-map">
              <ProvinceMap />
            </div>

            {/* 右：窄数据栏 */}
            <div className="col-right">
              <Card className="dash-card trend-card">
                <div className="mini-hd">
                  <div>
                    <h4>门店增长趋势</h4>
                    <p>新开 / 关闭 · 近 12 个月</p>
                  </div>
                  <span className="pill neutral">月度</span>
                </div>
                <div className="trend-big">
                  +{fmtNum(netAdd)}
                  <em>净增</em>
                </div>
                <div ref={trendEl} className="trend-chart"></div>
                <div className="chart-legend">
                  <span>
                    <i className="open"></i>新开门店
                  </span>
                  <span>
                    <i className="close"></i>关闭门店
                  </span>
                </div>
                <div className="stats3">
                  <div>
                    <span>本月新开</span>
                    <b>{thisMonthOpen}</b>
                  </div>
                  <div>
                    <span>本月关闭</span>
                    <b>{thisMonthClose}</b>
                  </div>
                  <div>
                    <span>净增率</span>
                    <b>+{netRate}%</b>
                  </div>
                </div>
              </Card>

              <Card className="dash-card rank-card">
                <div className="mini-hd">
                  <div>
                    <h4>门店 TOP 5 省份</h4>
                    <p>占全国门店总量 {topShare}%</p>
                  </div>
                  <span className="rank-ico">
                    <Ico name="trophy" size={13} />
                  </span>
                </div>
                <ul className="rank-list">
                  {topRows.map((p, i) => (
                    <li key={p.name} className="rank-item">
                      <span className="rank-idx">{i + 1}</span>
                      <div className="rank-main">
                        <div className="rank-line">
                          <b>{p.name}</b>
                          <span>{fmtNum(p.stores)} 家</span>
                        </div>
                        <div className="rank-bar">
                          <span style={{ width: `${p.pct}%` }}></span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="rank-foot">
                  <span>口径：直营 + 加盟门店</span>
                  <b>查看全部 →</b>
                </div>
              </Card>

              <Card className="dash-card rings-card">
                <div className="ring">
                  <div className="ring-g">
                    <div
                      className="ring-dial"
                      style={
                        {
                          '--pct': `${directShare}%`,
                          '--ring-color': 'var(--tone-violet)'
                        } as CSSProperties
                      }
                    ></div>
                    <b>{directShare}%</b>
                  </div>
                  <span>直营占比</span>
                </div>
                <div className="ring">
                  <div className="ring-g">
                    <div
                      className="ring-dial"
                      style={
                        {
                          '--pct': `${franchiseShare}%`,
                          '--ring-color': 'var(--tone-sky)'
                        } as CSSProperties
                      }
                    ></div>
                    <b>{franchiseShare}%</b>
                  </div>
                  <span>加盟占比</span>
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="page-head">
            <div>
              <div className="page-kicker">
                <Ico name="sparkle" size={10} /> BONBON BUSINESS · {deptName}
              </div>
              <div className="page-title-row">
                <h1>运营概览</h1>
                <Badge variant="mint">{deptName} · 部门概览</Badge>
              </div>
            </div>
          </div>

          <Card tone="mint" className="placeholder">
            <div className="ph-art">
              <Ico name="grid" size={28} />
            </div>
            <h2>{deptName} · 部门概览</h2>
            <p>该模块待业务接入</p>
          </Card>
        </>
      )}
    </div>
  )
}
