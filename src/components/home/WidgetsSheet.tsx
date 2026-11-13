import { GripVertical } from 'lucide-react'
import { useRef, useState, type PointerEvent } from 'react'
import Sheet from '../Sheet'
import { useStore } from '../../state/store'
import type { Space } from '../../types/model'
import { WIDGETS } from './widgets'

/** F-01-4 홈 구성 편집. 공간마다 켜짐과 순서를 따로 저장한다. */
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
  const listRef = useRef<HTMLUListElement>(null)
  const dragRef = useRef<{ from: number; to: number; startY: number } | null>(null)
  const [drag, setDrag] = useState<{ from: number; to: number; offset: number } | null>(null)
  const save = (widgets: Space['homeWidgets']) =>
    dispatch({ type: 'SET_WIDGETS', spaceId: space.id, widgets })

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= list.length) return
    const next = [...list]
    next.splice(to, 0, ...next.splice(from, 1))
    save(next)
  }

  const startDrag = (event: PointerEvent<HTMLButtonElement>, from: number) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { from, to: from, startY: event.clientY }
    setDrag({ from, to: from, offset: 0 })
  }

  const updateDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current
    if (!current) return
    const rows = Array.from(listRef.current?.children ?? [])
    const centers = rows.map((row) => {
      const rect = row.getBoundingClientRect()
      return rect.top + rect.height / 2
    })
    if (centers.length === 0) return
    const to = centers.reduce(
      (closest, center, index) =>
        Math.abs(center - event.clientY) < Math.abs(centers[closest] - event.clientY) ? index : closest,
      0,
    )
    current.to = to
    setDrag({ from: current.from, to, offset: event.clientY - current.startY })
  }

  const finishDrag = () => {
    const current = dragRef.current
    dragRef.current = null
    setDrag(null)
    if (current) move(current.from, current.to)
  }

  return (
    <Sheet open={open} onClose={onClose} title={`${space.name} 홈 구성`}>
      <p className="sheet-note">이 공간의 홈에만 적용돼요. 손잡이를 끌어 순서를 바꿀 수 있어요.</p>
      <ul className="widget-edit" ref={listRef}>
        {list.map((w, i) => (
          <li
            key={w.id}
            className={`${drag?.from === i ? 'is-dragging' : ''} ${drag?.to === i && drag.from !== i ? 'is-drop-target' : ''}`}
            style={drag?.from === i ? { transform: `translateY(${drag.offset}px)` } : undefined}
          >
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
            <button
              type="button"
              className="drag-handle"
              aria-label={`${WIDGETS[w.id].label} 순서 변경. 끌거나 위아래 방향키 사용`}
              onPointerDown={(event) => startDrag(event, i)}
              onPointerMove={updateDrag}
              onPointerUp={finishDrag}
              onPointerCancel={() => {
                dragRef.current = null
                setDrag(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                  event.preventDefault()
                  move(i, i + (event.key === 'ArrowUp' ? -1 : 1))
                }
              }}
            >
              <GripVertical size={20} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <button className="btn btn-primary wide" onClick={onClose}>
        완료
      </button>
    </Sheet>
  )
}
