import * as echarts from 'echarts/core'
import { BarChart, GraphChart, LineChart } from 'echarts/charts'
import { GeoComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

/* 全局一次注册，地图与首页小图表共用 */
echarts.use([BarChart, GraphChart, LineChart, GeoComponent, GridComponent, TooltipComponent, CanvasRenderer])

export { echarts }
export type { EChartsCoreOption } from 'echarts/core'
