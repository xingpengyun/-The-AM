import Ico from '@/components/Ico'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

/* 总览：全局视图占位页，业务内容待接入 */
export default function OverviewView() {
  return (
    <div className="page-dense">
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <Ico name="sparkle" size={10} /> BONBON BUSINESS · 全局
          </div>
          <div className="page-title-row">
            <h1>总览</h1>
            <Badge variant="mint">跨部门 · 全局视图</Badge>
          </div>
        </div>
      </div>

      <Card tone="mint" className="placeholder">
        <div className="ph-art">
          <Ico name="grid" size={28} />
        </div>
        <h2>总览 · 全局视图</h2>
        <p>该模块待业务接入</p>
      </Card>
    </div>
  )
}
