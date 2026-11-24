/* ECharts 调色盘：清新多色，与 tailwind.css 中的 --chart-* 令牌保持一致 */
export const CHART_COLORS = ['#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E', '#14B8A6'] as const

/* 状态语义色：正向 / 负向 / 提醒，与强调色令牌一致 */
export const STATUS_COLORS = {
  positive: '#10B981',
  negative: '#F43F5E',
  warning: '#F59E0B'
} as const
