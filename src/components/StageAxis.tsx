import { useLocation, useNavigate } from 'react-router-dom'
import Ico from '@/components/Ico'
import { departmentOfParam, processesOfDepartment, stageOfParam, stages } from '@/data/org'
import type { Stage } from '@/types/domain'

function parseDeptParam(pathname: string): string | undefined {
  return pathname.match(/^\/dept\/([^/]+)/)?.[1]
}

function parseStageParam(pathname: string): string | undefined {
  return pathname.match(/^\/dept\/[^/]+\/stage\/([^/]+)/)?.[1]
}

export default function StageAxis() {
  const location = useLocation()
  const navigate = useNavigate()

  const dept = departmentOfParam(parseDeptParam(location.pathname))
  const stage = stageOfParam(parseStageParam(location.pathname))

  /* 该部门实际参与的阶段（用于弱化无关阶段，不隐藏） */
  const deptStageKeys = new Set(processesOfDepartment(dept.key).map((p) => p.stage))

  function goStage(target: Stage): void {
    navigate(`/dept/${dept.key}/stage/${target.key}`)
  }

  function goAll(): void {
    navigate(`/dept/${dept.key}`)
  }

  return (
    <div className="stage-axis">
      <div className="stage-axis-label">
        <Ico name="target" size={14} />
        <span>阶段轴</span>
      </div>

      <div className="stage-track">
        <button className={`stage-chip stage-all${!stage ? ' on' : ''}`} onClick={goAll}>
          全部
        </button>

        {stages.map((s) => (
          <button
            key={s.key}
            className={`stage-chip${stage && stage.key === s.key ? ' on' : ''}${deptStageKeys.has(s.key) ? '' : ' dim'}`}
            title={`${s.no} ${s.name} · ${s.hint}`}
            onClick={() => goStage(s)}
          >
            <b>{s.no}</b>
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      <div className="stage-axis-meta">
        <b>{dept.short}</b>
        <span>{stage ? stage.hint : 'S1–S11 全链路'}</span>
      </div>
    </div>
  )
}
