import { useNavigate } from 'react-router-dom'
import Ico from '@/components/Ico'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/lib/toast'
import { getSession } from '@/utils/auth'
import './SettingsView.css'

export default function SettingsView() {
  const navigate = useNavigate()
  const session = getSession()
  const isAdmin = session?.role === 'admin'

  function openPermissions(): void {
    if (!isAdmin) {
      toast('仅管理员可管理人员权限', 'warning')
      return
    }
    navigate('/settings/permissions')
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <Ico name="sparkle" size={10} /> BONBON BUSINESS · 系统设置
          </div>
          <div className="page-title-row">
            <h1>设置</h1>
            <Badge variant="sky">账号与权限</Badge>
          </div>
          <p className="page-sub">集中管理后台的人员权限与账号开通状态。</p>
        </div>
      </div>

      <Card className="settings-card">
        <div className="settings-main">
          <div className="settings-ico">
            <Ico name="shield" size={23} />
          </div>
          <div>
            <div className="settings-title">
              <h2>人员权限</h2>
              <Badge variant="lavender">仅管理员</Badge>
            </div>
            <p>审核自助注册人员，开通或停用账号权限，并设置每个人可查看的部门范围。</p>
          </div>
        </div>
        <Button size="sm" variant={isAdmin ? 'default' : 'outline'} onClick={openPermissions}>
          {isAdmin ? '进入管理' : '仅管理员可进入'}
        </Button>
      </Card>

      <p className="settings-note">
        当前账号：{session?.displayName ?? '未登录'} ·{isAdmin ? '超级管理员' : '普通成员'}
      </p>
    </div>
  )
}
