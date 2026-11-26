import { stageByKey, isStageKey } from '@/data/org'

/* 导航顺序：首页 0 → 总览 5 → 部门概览 10 → 待办 20 → 阶段 31–41（按 S1–S11）→ 设置 50 */
export function orderOfPath(pathname: string): number {
  const stageKey = pathname.match(/^\/dept\/[^/]+\/stage\/([^/]+)/)?.[1]
  if (isStageKey(stageKey)) return 30 + Number(stageByKey[stageKey].no.slice(1))
  if (/^\/dept\/[^/]+\/todo\/?$/.test(pathname)) return 20
  if (/^\/dept\/[^/]+\/?$/.test(pathname)) return 10
  if (pathname === '/home') return 0
  if (pathname === '/overview') return 5
  if (pathname.startsWith('/settings')) return 50
  return 25
}

let lastPath = ''
let lastOrder = 0
let lastDirection: 'next' | 'prev' = 'next'

/* 往前导航内容自右进入，后退则自左进入 */
export function directionOfPath(pathname: string): 'next' | 'prev' {
  if (pathname === lastPath) return lastDirection
  const order = orderOfPath(pathname)
  const direction = order < lastOrder ? 'prev' : 'next'
  lastPath = pathname
  lastOrder = order
  lastDirection = direction
  return direction
}
