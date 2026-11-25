import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SideNav from '@/components/SideNav'
import TopBar from '@/components/TopBar'
import StageAxis from '@/components/StageAxis'
import { Toaster } from '@/components/ui/toast/Toaster'
import { departmentByKey, isDepartmentKey, stageOfParam } from '@/data/org'
import { directionOfPath } from '@/lib/route-order'

function titleFor(pathname: string): string {
  if (pathname === '/login') return 'Bonbon Admin · 登录'
  if (pathname === '/home') return 'Bonbon Admin · 首页'
  if (pathname === '/register') return 'Bonbon Admin · 注册'
  if (pathname === '/settings') return 'Bonbon Admin · 设置'
  if (pathname === '/settings/permissions') return 'Bonbon Admin · 人员权限'
  const deptKey = pathname.match(/^\/dept\/([^/]+)/)?.[1]
  const dept = isDepartmentKey(deptKey) ? departmentByKey[deptKey] : null
  const stage = stageOfParam(pathname.match(/^\/dept\/[^/]+\/stage\/([^/]+)/)?.[1])
  const parts = ['Bonbon Admin']
  if (dept) parts.push(dept.name)
  if (stage) parts.push(`${stage.no} ${stage.name}`)
  return parts.join(' · ')
}

/* 主壳：侧栏 + 顶栏 + 阶段轴 + 内容（登录 / 注册页不经过这里） */
export default function AppLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/home'
  /* 设置页不显示部门阶段轴 */
  const isSettings = location.pathname.startsWith('/settings')
  const direction = directionOfPath(location.pathname)

  useEffect(() => {
    document.title = titleFor(location.pathname)
    /* 与 Vue 版 router.scrollBehavior 一致：路由切换后回到顶部 */
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="shell">
      <SideNav />
      <div className="main">
        <TopBar />
        {!isHome && !isSettings ? <StageAxis /> : null}
        <main className="content">
          <div key={location.pathname} className={`page-enter page-${direction}`}>
            <Outlet />
          </div>
          <footer className="foot">Bonbon Admin 管理后台 · 仅用于视觉方向确认，数据均为演示内容</footer>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
