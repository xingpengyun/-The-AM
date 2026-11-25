import { useParams } from 'react-router-dom'
import Ico from '@/components/Ico'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { departmentOfParam, stageOfParam } from '@/data/org'

export default function StageBoard() {
  const { dept: deptParam, stage: stageParam } = useParams()
  const dept = departmentOfParam(deptParam)
  const stage = stageOfParam(stageParam)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <Ico name="sparkle" size={10} /> BONBON BUSINESS · {dept.name}
          </div>
          <div className="page-title-row">
            <h1>{stage ? `${stage.no} ${stage.name}` : '阶段看板'}</h1>
            <Badge variant="lavender">{dept.name} · 阶段看板</Badge>
          </div>
        </div>
      </div>

      <Card tone="lavender" className="placeholder">
        <div className="ph-art">
          <Ico name="inbox" size={28} />
        </div>
        <h2>{stage ? `${stage.no} ${stage.name}` : '阶段看板'}</h2>
        <p>该模块待业务接入</p>
      </Card>
    </div>
  )
}
