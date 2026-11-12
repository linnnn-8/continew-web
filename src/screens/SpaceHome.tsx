import { ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Cloud from '../components/Cloud'
import { SpaceIcon } from '../components/icons'
import WidgetsSheet from '../components/home/WidgetsSheet'
import { WIDGETS } from '../components/home/widgets'
import { newItemCount } from '../state/selectors'
import { useStore } from '../state/store'
import { formatLongDate } from '../state/utils'

/** SCR-03 개인 공간 홈 */
export default function SpaceHome() {
  const { state, currentSpace } = useStore()
  const nav = useNavigate()
  const [editing, setEditing] = useState(false)
  if (!currentSpace) return <Navigate to="/spaces" replace />

  const fresh = newItemCount(state, currentSpace.id)
  const aiOn = state.settings.aiSummaryEnabled

  return (
    <div className="page page-home" style={{ '--c': currentSpace.color } as React.CSSProperties}>
      <div className="hero">
        <div>
          <p className="date">{formatLongDate()}</p>
          <h1>
            {currentSpace.name} 공간이에요{' '}
            <span className="title-icon">
              <SpaceIcon name={currentSpace.icon} size={20} />
            </span>
          </h1>
          <p className="sub">오늘의 할 일과 전체 일정을 확인해요.</p>
        </div>
        <Cloud />
      </div>

      {fresh > 0 && (
        <div className="newstrip">
          <button className="newstrip-main" onClick={() => nav('/board')}>
            <span>마지막으로 확인한 뒤 공용에 새 글 {fresh}개</span>
            <ChevronRight size={16} aria-hidden />
          </button>
          {aiOn && (
            <button className="newstrip-sum" onClick={() => nav('/summary')}>
              <Sparkles size={14} aria-hidden />
              요약 보기
            </button>
          )}
        </div>
      )}

      {currentSpace.homeWidgets
        .filter((w) => w.visible)
        .map((w) => {
          const { View } = WIDGETS[w.id]
          return <View key={w.id} />
        })}

      <button className="link-btn" onClick={() => setEditing(true)}>
        홈 구성 편집
      </button>
      <WidgetsSheet space={currentSpace} open={editing} onClose={() => setEditing(false)} />
    </div>
  )
}
