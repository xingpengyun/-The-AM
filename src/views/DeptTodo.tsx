import { useParams } from 'react-router-dom'
import Ico from '@/components/Ico'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { departmentOfParam } from '@/data/org'

export default function DeptTodo() {
  const { dept: deptParam } = useParams()
  const dept = departmentOfParam(deptParam)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-kicker">
            <Ico name="sparkle" size={10} /> BONBON BUSINESS · {dept.name}
          </div>
          <div className="page-title-row">
            <h1>我的待办</h1>
            <Badge variant="peach">{dept.name} · 待办工作台</Badge>
          </div>
        </div>
      </div>

      <Card tone="peach" className="placeholder">
        <div className="ph-art">
          <Ico name="file" size={28} />
        </div>
        <h2>{dept.name} · 我的待办</h2>
        <p>该模块待业务接入</p>
      </Card>
    </div>
  )
}
