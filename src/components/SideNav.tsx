import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Ico from '@/components/Ico'
import { Tooltip } from '@/components/ui/tooltip'
import { departments, isDepartmentKey } from '@/data/org'
import { getSession } from '@/utils/auth'
import yunamanLogo from '@/assets/yunaman-logo.png'
import type { DepartmentKey } from '@/types/domain'

/**
 * 选中块形状（视口 62 × 77，本体 45 高，上下各留 16 给反向圆角）：
 * 左侧为正常圆角，闭合无开口；右侧直接铺到导轨边缘并与内容区相接，
 * 上沿 / 下沿各用一个 R16 反向圆角向外张开，弧线与边线相切，连续无尖点。
 */
const pillPath =
  'M0 32A16 16 0 0 1 16 16H46A16 16 0 0 0 62 0V77A16 16 0 0 0 46 61H16A16 16 0 0 1 0 45Z'

function parseDeptKey(pathname: string): DepartmentKey | null {
  const match = pathname.match(/^\/dept\/([^/]+)/)
  const key = match?.[1]
  return isDepartmentKey(key) ? key : null
}

interface PillState {
  x: number
  y: number
  w: number
  h: number
  visible: boolean
}

export default function SideNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/home'
  const isOverview = location.pathname === '/overview'
  const isSettings = location.pathname.startsWith('/settings')
  const currentDeptKey = parseDeptKey(location.pathname)

  /* 可查看部门：管理员或未限制账号返回 null（全部） */
  const session = getSession()
  const allowedKeys =
    !session || session.role === 'admin' || !session.departments?.length
      ? null
      : (() => {
          const valid = session.departments.filter(isDepartmentKey)
          return valid.length ? new Set(valid) : null
        })()
  const visibleDepartments = allowedKeys
    ? departments.filter((d) => allowedKeys.has(d.key))
    : departments
  const canSeeHome = allowedKeys === null

  /* 选中项在导航里的序号：首页 0、总览 1，部门从 2 开始；受限账号没有全局项，部门从 0 开始 */
  let activeIndex = -1
  if (isHome) {
    activeIndex = canSeeHome ? 0 : -1
  } else if (isOverview) {
    activeIndex = canSeeHome ? 1 : -1
  } else if (currentDeptKey) {
    const index = visibleDepartments.findIndex((d) => d.key === currentDeptKey)
    activeIndex = index < 0 ? -1 : index + (canSeeHome ? 2 : 0)
  }

  const listEl = useRef<HTMLDivElement | null>(null)
  const [pill, setPill] = useState<PillState>({ x: 0, y: 0, w: 0, h: 77, visible: false })
  const [pillReady, setPillReady] = useState(false)

  const syncPill = useCallback(() => {
    if (activeIndex < 0) {
      setPill((prev) => ({ ...prev, visible: false }))
      return
    }
    const el = listEl.current?.querySelectorAll<HTMLElement>('.nav-item')[activeIndex]
    if (!el) return
    setPill({
      x: el.offsetLeft,
      y: el.offsetTop - 16,
      w: el.offsetWidth,
      h: el.offsetHeight + 32,
      visible: true
    })
  }, [activeIndex])

  useLayoutEffect(() => {
    syncPill()
  }, [syncPill])

  useLayoutEffect(() => {
    /* 首帧落位后再开启过渡，避免刷新时胶囊从 0 处滑入 */
    const frame = requestAnimationFrame(() => setPillReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useLayoutEffect(() => {
    const el = listEl.current
    if (!el) return
    const observer = new ResizeObserver(() => syncPill())
    observer.observe(el)
    return () => observer.disconnect()
  }, [syncPill])

  function goHome(): void {
    if (isHome) return
    navigate('/home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goOverview(): void {
    if (isOverview) return
    navigate('/overview')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goDept(key: DepartmentKey): void {
    if (key === currentDeptKey) return
    navigate(`/dept/${key}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goSettings(): void {
    if (isSettings) return
    navigate('/settings')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <aside className="aside">
      <Tooltip content="Bonbon Admin · 运营中台" side="right" delay={200}>
        <div className="brand">
          <img className="brand-mark" src={yunamanLogo} alt="云阿蛮" width={40} height={40} />
        </div>
      </Tooltip>

      <nav className="nav">
        <div ref={listEl} className="nav-list">
          <svg
            className={`nav-pill${pillReady ? ' animated' : ''}`}
            style={{
              display: pill.visible ? 'block' : 'none',
              transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
              width: `${pill.w}px`,
              height: `${pill.h}px`
            }}
            viewBox="0 0 62 77"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="nav-pill-shape" d={pillPath} />
          </svg>

          {canSeeHome ? (
            <Tooltip content="首页" side="right" delay={120}>
              <button
                className={`nav-item${isHome ? ' active' : ''}`}
                aria-label="首页"
                aria-current={isHome ? 'page' : undefined}
                onClick={goHome}
              >
                <Ico className="nav-ico" name="home" size={23} />
              </button>
            </Tooltip>
          ) : null}

          {canSeeHome ? (
            <Tooltip content="总览" side="right" delay={120}>
              <button
                className={`nav-item${isOverview ? ' active' : ''}`}
                aria-label="总览"
                aria-current={isOverview ? 'page' : undefined}
                onClick={goOverview}
              >
                <Ico className="nav-ico" name="grid" size={23} />
              </button>
            </Tooltip>
          ) : null}

          {visibleDepartments.map((d) => (
            <Tooltip key={d.key} content={d.name} side="right" delay={120}>
              <button
                className={`nav-item${currentDeptKey === d.key ? ' active' : ''}`}
                aria-label={d.name}
                aria-current={currentDeptKey === d.key ? 'page' : undefined}
                onClick={() => goDept(d.key)}
              >
                <Ico className="nav-ico" name={d.icon} size={23} />
              </button>
            </Tooltip>
          ))}
        </div>
      </nav>

      <div className="aside-foot">
        <Tooltip content="设置" side="right" delay={120}>
          <button
            className={`rail-settings${isSettings ? ' active' : ''}`}
            aria-label="设置"
            aria-current={isSettings ? 'page' : undefined}
            onClick={goSettings}
          >
            <Ico className="nav-ico" name="settings" size={22} />
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}
