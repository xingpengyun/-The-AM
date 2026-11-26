import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Ico from '@/components/Ico'
import { DropdownMenu, type MenuItem } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tooltip } from '@/components/ui/tooltip'
import { toast } from '@/lib/toast'
import { toggleTheme, useTheme } from '@/lib/theme'
import { departmentOfParam, stageOfParam } from '@/data/org'
import { getSession, logout } from '@/utils/auth'

function parseDeptParam(pathname: string): string | undefined {
  return pathname.match(/^\/dept\/([^/]+)/)?.[1]
}

function parseStageParam(pathname: string): string | undefined {
  return pathname.match(/^\/dept\/[^/]+\/stage\/([^/]+)/)?.[1]
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()

  /* 顶栏展示当前登录人（来自本地会话） */
  const session = getSession()
  const userName = session?.displayName ?? '邢鹏昀'
  const userInitial = userName.slice(0, 1)
  const userRole = session?.role === 'admin' ? '超级管理员' : '成员'
  const [topSearch, setTopSearch] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)

  const isHome = location.pathname === '/home'
  const isOverview = location.pathname === '/overview'
  const isSettings = location.pathname.startsWith('/settings')
  const isPermissions = location.pathname === '/settings/permissions'
  const dept = departmentOfParam(parseDeptParam(location.pathname))
  const stage = stageOfParam(parseStageParam(location.pathname))

  function goHome(): void {
    if (!isHome) navigate('/home')
  }

  const noticeOptions: MenuItem[] = [
    { key: 'n1', label: '订单 BB202611210089 已完成支付', icon: 'check' },
    { key: 'n2', label: '客户「林知远」提交了退款申请', icon: 'refund' },
    { key: 'n3', label: '本周经营周报已生成', icon: 'file' },
    { key: 'd1', separator: true },
    { key: 'all', label: '查看全部通知', icon: 'bell' }
  ]

  const userOptions: MenuItem[] = [
    { key: 'profile', label: '个人中心', icon: 'user' },
    { key: 'settings', label: '账号设置', icon: 'settings' },
    { key: 'd2', separator: true },
    { key: 'logout', label: '退出登录', icon: 'logout' }
  ]

  function notify(text: string): void {
    toast(text)
  }

  function onSearch(): void {
    if (!topSearch.trim()) {
      toast('请输入搜索关键词', 'warning')
      return
    }
    notify(`搜索「${topSearch.trim()}」（示例）`)
  }

  function onNotice(key: string): void {
    if (key === 'all') notify('通知中心为示例模块')
    else notify('通知详情为示例内容')
  }

  function onUser(key: string): void {
    if (key === 'logout') {
      logout()
      toast('已退出登录', 'success')
      navigate('/login', { replace: true })
      return
    }
    notify(`「${key === 'profile' ? '个人中心' : '账号设置'}」为示例入口`)
  }

  useEffect(() => {
    function onKeydown(e: KeyboardEvent): void {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [])

  return (
    <header className="topbar">
      <div className="crumb">
        <nav className="flex items-center gap-1.5 text-[12px] text-muted-foreground" aria-label="面包屑">
          <a className="crumb-link" href="/home" onClick={(e) => { e.preventDefault(); goHome() }}>
            首页
          </a>
          {isSettings ? (
            <>
              <span className="opacity-60">/</span>
              {isPermissions ? (
                <a
                  className="crumb-link"
                  href="/settings"
                  onClick={(e) => { e.preventDefault(); navigate('/settings') }}
                >
                  设置
                </a>
              ) : (
                <span className="text-foreground">设置</span>
              )}
              {isPermissions ? (
                <>
                  <span className="opacity-60">/</span>
                  <span className="text-foreground">人员权限</span>
                </>
              ) : null}
            </>
          ) : isOverview ? (
            <>
              <span className="opacity-60">/</span>
              <span className="text-foreground">总览</span>
            </>
          ) : !isHome ? (
            <>
              <span className="opacity-60">/</span>
              <span className="text-foreground">{dept.name}</span>
            </>
          ) : null}
          {!isHome && !isOverview && !isSettings && stage ? (
            <>
              <span className="opacity-60">/</span>
              <span className="text-foreground">{stage.no} {stage.name}</span>
            </>
          ) : null}
        </nav>
      </div>

      <div className="topsearch relative flex-1">
        <Ico
          name="search"
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={searchRef}
          value={topSearch}
          onChange={(e) => setTopSearch(e.target.value)}
          placeholder="搜索订单、客户或功能…"
          className="h-[34px] bg-muted pl-8 pr-16"
          onEnter={onSearch}
        />
        <span className="kbd pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">Ctrl K</span>
      </div>

      <div className="top-actions">
        <Tooltip content={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}>
          <button
            className="icon-btn theme-toggle"
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            onClick={toggleTheme}
          >
            <Ico name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>
        </Tooltip>

        <Tooltip content="帮助中心">
          <button className="icon-btn" aria-label="帮助中心" onClick={() => notify('帮助中心为示例交互')}>
            <Ico name="help" size={17} />
          </button>
        </Tooltip>

        <DropdownMenu items={noticeOptions} onSelect={onNotice}>
          <button className="icon-btn" aria-label="通知">
            <Ico name="bell" size={17} />
            <span className="dot"></span>
          </button>
        </DropdownMenu>

        <span className="top-divider"></span>

        <DropdownMenu items={userOptions} onSelect={onUser}>
          <button className="user">
            <span className="user-initial">{userInitial}</span>
            <span className="user-meta">
              <b>{userName}</b>
              <i>{userRole}</i>
            </span>
            <Ico name="chevron-down" size={13} className="user-chev" />
          </button>
        </DropdownMenu>
      </div>
    </header>
  )
}
