<script setup>
import { computed, h, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NDropdown, NTag, useMessage } from 'naive-ui'
import Ico from '@/components/Ico.vue'
import ProvinceMap from '@/components/ProvinceMap.vue'
import {
  orders,
  stats,
  channels,
  channelTotal,
  paymentColor,
  statusStyle,
  statusOptions,
  payOptions,
  fmtNum,
  fmtMoney,
  computeChart,
  computeChartSummary
} from '@/data/business'
import { departmentByKey, defaultDepartmentKey, departments, processesOfDepartment } from '@/data/org'

const props = defineProps({
  global: { type: Boolean, default: false }
})

const route = useRoute()
const message = useMessage()

/* 首页 = 跨部门全局看板；部门页才做部门范围过滤 */
const isGlobal = computed(() => props.global || route.name === 'home')
const dept = computed(() => {
  if (isGlobal.value) return null
  return departmentByKey[route.params.dept] || departmentByKey[defaultDepartmentKey]
})
const deptProcesses = computed(() => (dept.value ? processesOfDepartment(dept.value.key) : []))
const deptStageCount = computed(() => new Set(deptProcesses.value.map((p) => p.stage)).size)
const scopeText = computed(() =>
  dept.value
    ? `参与 ${deptStageCount.value} 个阶段 / ${deptProcesses.value.length} 道工序`
    : `覆盖 ${departments.length} 个部门 · S1–S11 全链路`
)

const range = ref('7d')
const exporting = ref(false)
const refreshing = ref(false)
const hoverIdx = ref(null)
const form = reactive({ keyword: '', status: null, pay: null, range: null })
const applied = reactive({ keyword: '', status: null, pay: null, range: null })

const filteredOrders = computed(() => {
  return orders.filter((o) => {
    if (applied.keyword) {
      const kw = String(applied.keyword).trim().toLowerCase()
      if (kw) {
        const hit =
          o.id.toLowerCase().indexOf(kw) > -1 ||
          o.name.toLowerCase().indexOf(kw) > -1 ||
          o.email.toLowerCase().indexOf(kw) > -1
        if (!hit) return false
      }
    }
    if (applied.status && o.status !== applied.status) return false
    if (applied.pay && o.pay !== applied.pay) return false
    if (applied.range && applied.range.length === 2) {
      const start = new Date(applied.range[0])
      start.setHours(0, 0, 0, 0)
      const end = new Date(applied.range[1])
      end.setHours(23, 59, 59, 999)
      if (o.ts < start.getTime() || o.ts > end.getTime()) return false
    }
    return true
  })
})

const pagination = reactive({
  page: 1,
  pageSize: 8,
  pageSizes: [8, 12, 20],
  showSizePicker: true,
  itemCount: orders.length,
  prefix: (info) => `共 ${info.itemCount} 条`,
  onChange: (page) => { pagination.page = page },
  onUpdatePage: (page) => { pagination.page = page },
  onUpdatePageSize: (size) => { pagination.pageSize = size; pagination.page = 1 }
})

watch(filteredOrders, (list) => {
  pagination.itemCount = list.length
  const maxPage = Math.max(1, Math.ceil(list.length / pagination.pageSize))
  if (pagination.page > maxPage) pagination.page = maxPage
})

const chart = computed(() => computeChart(range.value))
const chartSummary = computed(() => computeChartSummary(range.value))

const hover = computed(() => {
  if (hoverIdx.value === null) return null
  const c = chart.value
  const p = c.points[hoverIdx.value]
  if (!p) return null
  const pct = (p.x / 720) * 100
  return {
    x: p.x,
    y: p.y,
    label: c.labels[hoverIdx.value],
    cur: c.cur[hoverIdx.value].toFixed(1),
    prev: c.prev[hoverIdx.value].toFixed(1),
    tipLeft: Math.min(87, Math.max(13, pct)),
    tipTop: Math.max(8, p.y - 16)
  }
})

watch(range, () => { hoverIdx.value = null })

function notify(text) {
  message.info(text, { duration: 2200 })
}

function exportReport() {
  if (exporting.value) return
  exporting.value = true
  setTimeout(() => {
    exporting.value = false
    message.success('报表已打包完成（示例）')
  }, 900)
}

function refresh() {
  if (refreshing.value) return
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    message.success('数据已刷新至最新')
  }, 700)
}

function applyFilters() {
  applied.keyword = form.keyword
  applied.status = form.status
  applied.pay = form.pay
  applied.range = form.range ? form.range.slice() : null
  pagination.page = 1
  message.success(`筛选完成，共 ${filteredOrders.value.length} 条结果`)
}

function resetFilters() {
  form.keyword = ''
  form.status = null
  form.pay = null
  form.range = null
  applied.keyword = ''
  applied.status = null
  applied.pay = null
  applied.range = null
  pagination.page = 1
  message.info('筛选条件已重置')
}

function onChartMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  if (!rect.width) return
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  hoverIdx.value = Math.round(ratio * (chart.value.labels.length - 1))
}

function rowMenu() {
  return [
    { key: 'view', label: '查看详情', icon: () => h(Ico, { name: 'receipt', size: 15 }) },
    { key: 'copy', label: '复制订单号', icon: () => h(Ico, { name: 'file', size: 15 }) },
    { type: 'divider', key: 'rd' },
    { key: 'refund', label: '标记为已退款', icon: () => h(Ico, { name: 'refund', size: 15 }) }
  ]
}

function onRowAction(key, row) {
  if (key === 'view') notify(`打开订单 ${row.id} 详情（示例）`)
  else if (key === 'copy') notify(`订单号 ${row.id} 已复制（示例）`)
  else notify(`已将 ${row.id} 标记为已退款（示例）`)
}

const columns = [
  {
    title: '订单编号', key: 'id', width: 152,
    render: (row) => h('span', { class: 'cell-id' }, row.id)
  },
  {
    title: '客户', key: 'name', width: 232,
    render: (row) => h('div', { class: 'cell-cust' }, [
      h('span', { class: 'cell-avatar', style: { background: row.avatarBg, color: row.avatarFg } }, row.name.slice(0, 1)),
      h('div', { class: 'cell-cust-meta' }, [
        h('span', { class: 'cell-name' }, row.name),
        h('span', { class: 'cell-mail' }, row.email)
      ])
    ])
  },
  {
    title: '金额', key: 'amount', width: 118, align: 'right',
    render: (row) => h('span', { class: 'cell-amount' }, fmtMoney(row.amount))
  },
  {
    title: '支付方式', key: 'pay', width: 114,
    render: (row) => h('span', { class: 'cell-pay' }, [
      h('i', { class: 'pay-dot', style: { background: paymentColor[row.pay] } }),
      row.pay
    ])
  },
  {
    title: '状态', key: 'status', width: 104,
    render: (row) => {
      const st = statusStyle[row.status] || statusStyle['已取消']
      return h(NTag, {
        size: 'small',
        bordered: false,
        style: {
          background: st.bg,
          color: st.fg,
          fontWeight: '700',
          borderRadius: '999px',
          padding: '0 10px',
          height: '23px',
          lineHeight: '23px',
          fontSize: '11.5px',
          border: 'none'
        }
      }, {
        default: () => h('span', { class: 'tag-status' }, [
          h('i', { style: { background: st.fg } }),
          row.status
        ])
      })
    }
  },
  {
    title: '下单时间', key: 'time', width: 150,
    render: (row) => h('span', { class: 'cell-time' }, row.time)
  },
  {
    title: '操作', key: 'actions', width: 100, align: 'right',
    render: (row) => h('div', { class: 'cell-actions' }, [
      h('button', {
        class: 'link',
        onClick: () => notify(`查看订单 ${row.id}（示例）`)
      }, '查看'),
      h(NDropdown, {
        trigger: 'click',
        options: rowMenu(),
        onSelect: (key) => onRowAction(key, row)
      }, { default: () => h('button', { class: 'link muted' }, '更多') })
    ])
  }
]
</script>

<template>
  <div
    v-motion
    :initial="{ y: 12 }"
    :enter="{ y: 0, transition: { duration: 360, ease: 'easeOut' } }"
  >
    <div class="page-head">
      <div>
        <div class="page-kicker"><Ico name="sparkle" :size="10" /> BONBON BUSINESS · {{ dept ? dept.name : '全局总览' }}</div>
        <div class="page-title-row">
          <h1>{{ dept ? '运营概览' : '运营总览' }}</h1>
          <span class="chip-soft">{{ dept ? `${dept.name} · 部门概览` : '全部门 · 全局总览' }}</span>
        </div>
        <div class="page-sub">
          <span class="live-dot"></span>
          数据更新于 2 分钟前 · 统计口径：自然日 · {{ scopeText }}
        </div>
      </div>
      <div class="page-actions">
        <n-button quaternary :loading="refreshing" @click="refresh">
          <template #icon><Ico name="refresh" :size="15" /></template>
          刷新数据
        </n-button>
        <n-button type="primary" :loading="exporting" @click="exportReport">
          <template #icon><Ico name="download" :size="15" /></template>
          导出报表
        </n-button>
      </div>
    </div>

    <section class="kpi-grid">
      <article
        v-for="(s, i) in stats"
        :key="s.label"
        class="panel kpi"
        :class="s.variant"
        :style="{ animationDelay: (i * 60) + 'ms', '--accent': s.color, '--accent-soft': s.soft }"
      >
        <div class="kpi-head">
          <span class="kpi-label">{{ s.label }}</span>
          <span class="kpi-ico"><Ico :name="s.icon" :size="17" /></span>
        </div>
        <div class="kpi-value">{{ s.value }}</div>
        <div class="kpi-foot">
          <div class="kpi-meta">
            <span class="delta" :class="s.good ? 'good' : 'bad'">
              <Ico :name="s.up ? 'arrow-up' : 'arrow-down'" :size="11" />
              {{ s.delta }}
            </span>
            <span class="kpi-note">{{ s.note }}</span>
          </div>
          <svg class="spark" viewBox="0 0 80 30" preserveAspectRatio="none" aria-hidden="true">
            <path :d="s.sparkArea" :fill="s.area" />
            <path :d="s.sparkLine" fill="none" :stroke="s.color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
      </article>
    </section>

    <ProvinceMap />

    <div class="section-head" style="--marker:#4F6EF7">
      <span>经营分析</span>
      <em>成交趋势与渠道结构 · 示例数据</em>
    </div>

    <div class="mid-grid">
      <section class="panel chart-card">
        <div class="card-head">
          <div class="title-row">
            <span class="card-ico"><Ico name="pulse" :size="16" /></span>
            <div>
              <div class="card-title-line">
                <span class="card-title">成交趋势</span>
                <span class="count-pill">
                  <Ico :name="chartSummary.up ? 'arrow-up' : 'arrow-down'" :size="10" />
                  {{ chartSummary.delta }}%
                </span>
              </div>
              <div class="card-sub">成交金额与上期对比（单位：万元）</div>
            </div>
          </div>
          <div class="card-tools">
            <div class="legend">
              <span><i class="grad"></i>本期</span>
              <span><i class="dash"></i>上期</span>
            </div>
            <div class="segmented">
              <button :class="{ on: range === '7d' }" @click="range = '7d'">近 7 天</button>
              <button :class="{ on: range === '30d' }" @click="range = '30d'">近 30 天</button>
            </div>
          </div>
        </div>

        <div class="chart-body">
          <div class="y-labels">
            <span v-for="(t, i) in chart.ticks" :key="i">{{ t }}</span>
          </div>
          <div class="plot-wrap">
            <div class="grid-lines">
              <i v-for="n in 5" :key="n" :style="{ top: ((n - 1) * 25) + '%' }"></i>
            </div>
            <svg class="plot" viewBox="0 0 720 232" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4F6EF7" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#4F6EF7" stop-opacity="0.015" />
                </linearGradient>
              </defs>
              <path :d="chart.area" fill="url(#trendArea)" />
              <path :d="chart.prevPath" class="prev-line" vector-effect="non-scaling-stroke" />
              <path :d="chart.line" class="glow-line" vector-effect="non-scaling-stroke" />
              <path :d="chart.line" class="main-line" vector-effect="non-scaling-stroke" />
              <g v-if="hover">
                <line :x1="hover.x" y1="0" :x2="hover.x" y2="232" class="hover-line" vector-effect="non-scaling-stroke" />
                <circle :cx="hover.x" :cy="hover.y" r="9" class="hover-halo" />
                <circle :cx="hover.x" :cy="hover.y" r="4" class="hover-dot" vector-effect="non-scaling-stroke" />
              </g>
            </svg>

            <div class="x-labels">
              <span v-for="(l, i) in chart.axisLabels" :key="i">{{ l }}</span>
            </div>

            <div v-if="hover" class="tip" :style="{ left: hover.tipLeft + '%', top: hover.tipTop + 'px' }">
              <div class="tip-date">{{ hover.label }}</div>
              <div class="tip-row"><i></i>本期<b>{{ hover.cur }} 万</b></div>
              <div class="tip-row"><i class="dash"></i>上期<b>{{ hover.prev }} 万</b></div>
            </div>

            <div class="hover-capture" @mousemove="onChartMove" @mouseleave="hoverIdx = null"></div>
          </div>
        </div>

        <div class="chart-foot">
          <span><i style="background: #4F6EF7"></i>峰值 <b>{{ chartSummary.peak }} 万</b></span>
          <span><i style="background: #7C5CFA"></i>日均 <b>{{ chartSummary.avg }} 万</b></span>
          <span><i style="background: #12B886"></i>环比 <b>{{ chartSummary.up ? '+' : '-' }}{{ chartSummary.delta }}%</b></span>
        </div>
      </section>

      <section class="panel donut-card">
        <div class="card-head">
          <div class="title-row">
            <span class="card-ico"><Ico name="pie" :size="16" /></span>
            <div>
              <div class="card-title-line">
                <span class="card-title">渠道分布</span>
                <span class="count-pill">+6.4%</span>
              </div>
              <div class="card-sub">近 7 日访问来源占比</div>
            </div>
          </div>
          <button class="icon-btn" aria-label="更多" @click="notify('渠道明细为示例交互')">
            <Ico name="more" :size="16" />
          </button>
        </div>

        <div class="donut-wrap">
          <svg class="donut" viewBox="0 0 184 184" aria-hidden="true">
            <circle cx="92" cy="92" r="72" class="donut-track" />
            <circle
              v-for="c in channels"
              :key="c.name"
              cx="92"
              cy="92"
              r="72"
              class="donut-seg"
              :stroke="c.color"
              :stroke-dasharray="c.dash"
              :stroke-dashoffset="c.offset"
            />
          </svg>
          <div class="donut-center">
            <b>{{ fmtNum(channelTotal) }}</b>
            <span>总访问量</span>
          </div>
        </div>

        <ul class="legend-list">
          <li v-for="c in channels" :key="c.name">
            <span class="lg-name"><i :style="{ background: c.color, color: c.color }"></i>{{ c.name }}</span>
            <span class="lg-val">{{ fmtNum(c.value) }}</span>
            <span class="lg-pct">{{ c.pct }}%</span>
          </li>
        </ul>
      </section>
    </div>

    <div class="section-head" style="--marker:#F2B01E">
      <span>订单明细</span>
      <em>支持关键字、状态、支付方式与日期筛选</em>
    </div>

    <section class="panel table-card">
      <div class="card-head table-head">
        <div class="title-row">
          <span class="card-ico"><Ico name="receipt" :size="16" /></span>
          <div>
            <div class="card-title">最近订单</div>
            <div class="card-sub">共 {{ filteredOrders.length }} 条 · 演示数据</div>
          </div>
        </div>
        <div class="table-tools">
          <n-button quaternary size="small" @click="notify('自定义列设置（示例）')">
            <template #icon><Ico name="sliders" :size="14" /></template>
            自定义列
          </n-button>
          <n-button size="small" secondary @click="notify('列表已刷新（示例）')">
            <template #icon><Ico name="refresh" :size="14" /></template>
            刷新
          </n-button>
        </div>
      </div>

      <div class="filters">
        <n-input
          v-model:value="form.keyword"
          class="f-input"
          placeholder="订单编号 / 客户姓名"
          clearable
          @keyup.enter="applyFilters"
        >
          <template #prefix><Ico name="search" :size="14" /></template>
        </n-input>

        <n-select v-model:value="form.status" class="f-select" :options="statusOptions" placeholder="订单状态" clearable />
        <n-select v-model:value="form.pay" class="f-select" :options="payOptions" placeholder="支付方式" clearable />

        <n-date-picker
          v-model:value="form.range"
          class="f-date"
          type="daterange"
          clearable
          :actions="null"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />

        <div class="f-actions">
          <n-button type="primary" @click="applyFilters">
            <template #icon><Ico name="filter" :size="14" /></template>
            查询
          </n-button>
          <n-button quaternary @click="resetFilters">重置</n-button>
        </div>
      </div>

      <n-data-table
        :columns="columns"
        :data="filteredOrders"
        :pagination="pagination"
        :bordered="false"
        :bottom-bordered="false"
        :scroll-x="1000"
        size="medium"
      />
    </section>
  </div>
</template>
