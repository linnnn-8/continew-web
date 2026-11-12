import { ChevronRight, Info, Plus, SlidersHorizontal, Users } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Cloud from '../components/Cloud'
import { SpaceIcon } from '../components/icons'
import Logo from '../components/Logo'
import { COPY } from '../copy'
import { visibleSpaces } from '../state/selectors'
import { useStore } from '../state/store'

/** SCR-02 공간 선택. 앱을 열면 마지막 공간을 자동으로 열지 않고 여기서 고른다 (F-01) */
export default function SpaceSelect() {
  const { state, dispatch } = useStore()
  const nav = useNavigate()
  const spaces = visibleSpaces(state)

  // 이 화면에서는 열린 공간이 없는 상태로 둔다
  useEffect(() => {
    dispatch({ type: 'CLOSE_SPACE' })
  }, [dispatch])

  return (
    <main className="scroll page page-select">
      <div className="select-top">
        <Logo />
      </div>

      <div className="hero">
        <div>
          <h1>{COPY.spaceSelectTitle}</h1>
          <p className="sub">공간마다 기록과 화면이 따로 있어요.</p>
        </div>
        <Cloud />
      </div>

      <div className="list-head">
        <span>내 공간</span>
        <button className="sec-more" onClick={() => nav('/spaces/manage')}>
          <SlidersHorizontal size={14} aria-hidden />
          관리
        </button>
      </div>

      <ul className="space-list">
        {spaces.map((s) => (
          <li key={s.id}>
            <button
              className="space-card"
              style={{ '--c': s.color } as React.CSSProperties}
              onClick={() => {
                dispatch({ type: 'OPEN_SPACE', id: s.id })
                nav('/home')
              }}
            >
              <span className="chip-icon">
                <SpaceIcon name={s.icon} size={22} />
              </span>
              <span className="space-text">
                <strong>{s.name}</strong>
                {s.description && <small>{s.description}</small>}
              </span>
              <ChevronRight size={18} aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <button className="add-space" onClick={() => nav('/spaces/manage')}>
        <Plus size={18} aria-hidden />새 공간 만들기
      </button>

      <p className="notice notice-info">
        <Info size={15} aria-hidden />
        <span>{COPY.spaceNotice}</span>
      </p>

      <button className="btn btn-soft wide" onClick={() => nav('/board')}>
        <Users size={18} aria-hidden />
        공용 공간으로 가기
      </button>
    </main>
  )
}
