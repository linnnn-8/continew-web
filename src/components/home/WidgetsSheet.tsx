import { ArrowDown, ArrowUp } from 'lucide-react'
import Sheet from '../Sheet'
import { useStore } from '../../state/store'
import type { Space } from '../../types/model'
import { WIDGETS } from './widgets'

/** F-01-4 홈 구성 편집. 켜고 끄고 순서를 바꾸며, 공간마다 따로 저장한다 */
export default function WidgetsSheet({
  space,
  open,
  onClose,
}: {
  space: Space
  open: boolean
  onClose: () => void
}) {
  const { dispatch } = useStore()
  const list = space.homeWidgets
  const save = (widgets: Space['homeWidgets']) =>
    dispatch({ type: 'SET_WIDGETS', spaceId: space.id, widgets })
  const move = (i: number, d: -1 | 1) => {
    const next = [...list]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    save(next)
  }
  return (
    <Sheet open={open} onClose={onClose} title={`${space.name} 홈 구성`}>
      <p className="sheet-note">이 공간의 홈에만 적용돼요.</p>
      <ul className="widget-edit">
        {list.map((w, i) => (
          <li key={w.id}>
            <label className="switch">
              <input
                type="checkbox"
                checked={w.visible}
                onChange={() => save(list.map((x) => (x.id === w.id ? { ...x, visible: !x.visible } : x)))}
              />
              <span className="switch-track" aria-hidden />
              <span className="switch-label">
                {WIDGETS[w.id].label}
                <small>{WIDGETS[w.id].shared ? '공용 기록' : '이 공간 기록'}</small>
              </span>
            </label>
            <span className="move">
              <button
                aria-label={`${WIDGETS[w.id].label} 위로`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <ArrowUp size={16} />
              </button>
              <button
                aria-label={`${WIDGETS[w.id].label} 아래로`}
                disabled={i === list.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown size={16} />
              </button>
            </span>
          </li>
        ))}
      </ul>
      <button className="btn btn-primary wide" onClick={onClose}>
        완료
      </button>
    </Sheet>
  )
}
