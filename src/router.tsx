import { useEffect, useRef, type ReactNode } from 'react'
import { Navigate, Outlet, Routes, Route, useLocation, useParams } from 'react-router-dom'
import AppLayout from '@/App'
import LoginView from '@/views/LoginView'
import RegisterView from '@/views/RegisterView'
import SettingsView from '@/views/SettingsView'
import PermissionsView from '@/views/PermissionsView'
import DeptOverview from '@/views/DeptOverview'
import DeptTodo from '@/views/DeptTodo'
import StageBoard from '@/views/StageBoard'
import { toast } from '@/lib/toast'
import { getSession, isLoggedIn } from '@/utils/auth'
import {
  defaultDepartmentKey,
  isDepartmentKey,
  isStageKey
} from '@/data/org'
import type { DepartmentKey } from '@/types/domain'

/* 受限账号的可查看部门：管理员或未限制账号返回 null */
function scopeOfSession(): DepartmentKey[] | null {
  const session = getSession()
  if (!session || session.role === 'admin' || !session.departments?.length) return null
  const valid = session.departments.filter(isDepartmentKey)
  return valid.length ? valid : null
}

/* 登录守卫：未登录先进登录页（带回跳地址） */
function RequireAuth() {
  const location = useLocation()
  if (!isLoggedIn()) {
    const fullPath = `${location.pathname}${location.search}`
    const redirect = fullPath && fullPath !== '/' ? fullPath : undefined
    return <Navigate to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} replace />
  }
  return <Outlet />
}

/* 登录 / 注册页：已登录不再停留 */
function PublicOnly({ children }: { children: ReactNode }) {
  if (isLoggedIn()) return <Navigate to="/home" replace />
  return <>{children}</>
}

/* 首页：受限账号不展示全局首页，直接进入授权部门 */
function HomeGuard() {
  const scope = scopeOfSession()
  if (scope && scope.length > 0) return <Navigate to={`/dept/${scope[0]}`} replace />
  return <DeptOverview global />
}

/* 人员权限：仅管理员可进入 */
function AdminGuard({ children }: { children: ReactNode }) {
  const denied = getSession()?.role !== 'admin'
  const notified = useRef(false)
  useEffect(() => {
    if (denied && !notified.current) {
      notified.current = true
      toast('仅管理员可访问人员权限', 'warning')
    }
  }, [denied])
  if (denied) return <Navigate to="/home" replace />
  return <>{children}</>
}

/* 部门 / 阶段参数校验与可查看范围 */
function DeptGuard({ children }: { children: ReactNode }) {
  const { dept, stage } = useParams()
  const scope = scopeOfSession()
  const notified = useRef(false)

  const deptKey = typeof dept === 'string' ? dept : ''
  const invalidDept = !isDepartmentKey(deptKey)
  const invalidStage = Boolean(stage) && !isStageKey(typeof stage === 'string' ? stage : '')
  const outOfScope = !invalidDept && scope && !scope.some((key) => key === deptKey)

  useEffect(() => {
    if (outOfScope && !notified.current) {
      notified.current = true
      toast('当前账号无权查看该部门', 'warning')
    }
  }, [outOfScope])

  if (invalidDept) return <Navigate to={`/dept/${defaultDepartmentKey}`} replace />
  if (invalidStage) return <Navigate to={`/dept/${deptKey}`} replace />
  if (outOfScope && scope) return <Navigate to={`/dept/${scope[0]}`} replace />
  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginView /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterView /></PublicOnly>} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeGuard />} />
          <Route path="/dept/:dept" element={<DeptGuard><DeptOverview /></DeptGuard>} />
          <Route path="/dept/:dept/stage/:stage" element={<DeptGuard><StageBoard /></DeptGuard>} />
          <Route path="/dept/:dept/todo" element={<DeptGuard><DeptTodo /></DeptGuard>} />
          <Route path="/settings" element={<SettingsView />} />
          <Route
            path="/settings/permissions"
            element={<AdminGuard><PermissionsView /></AdminGuard>}
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
