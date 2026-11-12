import { Check, ChevronDown, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store'
import { visibleSpaces } from '../state/selectors'
import { SpaceIcon } from './icons'
import Sheet from './Sheet'

/** 상단 바의 공간 표시·전환. 열린 공간의 이름과 색을 항상 보여준다 (4장). 열린 공간이 없으면 '공용' */
export default function SpacePill() {
  const { state, dispatch, currentSpace } = useStore()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const style = currentSpace ? ({ '--c': currentSpace.color } as React.CSSProperties) : undefined
  return (
    <>
      <button
        className={`pill${currentSpace ? ' pill-space' : ''}`}
        style={style}
        onClick={() => setOpen(true)}
        aria-label="공간 전환"
      >
        {currentSpace ? <SpaceIcon name={currentSpace.icon} size={16} /> : <Users size={16} aria-hidden />}
        <span>{currentSpace ? currentSpace.name : '공용'}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="공간 전환">
        <ul className="switch-list">
          {visibleSpaces(state).map((s) => (
            <li key={s.id}>
              <button
                className="switch-item"
                style={{ '--c': s.color } as React.CSSProperties}
                onClick={() => {
                  dispatch({ type: 'OPEN_SPACE', id: s.id })
                  setOpen(false)
                }}
              >
                <span className="chip-icon">
                  <SpaceIcon name={s.icon} size={18} />
                </span>
                <span className="switch-name">{s.name}</span>
                {s.id === currentSpace?.id && <Check size={18} aria-label="지금 열린 공간" />}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="link-btn"
          onClick={() => {
            setOpen(false)
            nav('/spaces')
          }}
        >
          공간 선택 화면으로
        </button>
      </Sheet>
    </>
  )
}
