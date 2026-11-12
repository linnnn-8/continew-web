import { BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import Sheet from '../Sheet'
import { COPY } from '../../copy'
import { newId } from '../../state/utils'
import { formatKoDateTime } from '../../state/utils'
import { confirmationsFor, visibleSpaces } from '../../state/selectors'
import { useStore } from '../../state/store'
import { ANONYMOUS_LABEL, type BoardPost } from '../../types/model'

interface Props {
  post: BoardPost
  /** 이 세션에서 내가 누른 확인 기록 id. 공간 id를 저장하지 않으므로 '내 것'은 화면에서만 기억한다 */
  mine: string[]
  setMine: (fn: (prev: string[]) => string[]) => void
}

/** F-04-7·9·10 '확인했어요'. 누를 때만 기록하고, 기록 없음은 조용히 표시한다(재촉 금지, 원칙6) */
export default function ConfirmArea({ post, mine, setMine }: Props) {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState(ANONYMOUS_LABEL) // 확인 표기 기본값은 '이름 없이' (F-04-9)
  const { count, last } = confirmationsFor(state, post.id)
  const myId = mine.find((id) => state.confirmations.some((c) => c.id === id && c.targetId === post.id))
  const choices = [ANONYMOUS_LABEL, ...visibleSpaces(state).map((s) => s.name)]

  return (
    <div className="confirm">
      <span className="confirm-text">
        <BadgeCheck size={15} aria-hidden />
        {count > 0 && last ? `확인 ${count}건 · 마지막 ${formatKoDateTime(last)}` : COPY.noConfirmYet}
      </span>
      {myId ? (
        <button
          className="mini mini-ghost"
          onClick={() => {
            dispatch({ type: 'UNCONFIRM', id: myId })
            setMine((m) => m.filter((x) => x !== myId))
          }}
        >
          확인 취소
        </button>
      ) : (
        <button className="mini" onClick={() => setOpen(true)}>
          확인했어요
        </button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="어떻게 표시할까요?">
        <p className="sheet-note">{COPY.confirmMeaning}</p>
        <div className="radio-list" role="radiogroup" aria-label="확인 표기">
          {choices.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={label === c}
              className={`radio${label === c ? ' on' : ''}`}
              onClick={() => setLabel(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary wide"
          onClick={() => {
            const id = newId('conf')
            dispatch({ type: 'CONFIRM', id, targetType: 'post', targetId: post.id, label })
            setMine((m) => [...m, id])
            setOpen(false)
          }}
        >
          확인했어요
        </button>
      </Sheet>
    </div>
  )
}
