import { Check, ChevronDown, Clock, Pin, StickyNote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DateTile } from '../common'
import { useStore } from '../../state/store'
import { formatShortDate, formatTime } from '../../state/utils'
import type { BoardPost } from '../../types/model'
import ConfirmArea from './ConfirmArea'

interface Props {
  post: BoardPost
  mine: string[]
  setMine: (fn: (prev: string[]) => string[]) => void
  muted?: boolean
  focused?: boolean
}

function Sub({ post }: { post: BoardPost }) {
  if (post.type === 'event' && post.eventAt) {
    return (
      <span className="post-sub">
        <Clock size={13} aria-hidden />
        {formatTime(post.eventAt)}
        {post.place ? ` · ${post.place}` : ''}
      </span>
    )
  }
  if (post.type === 'todo')
    return post.dueAt ? <span className="post-sub">마감 {formatShortDate(post.dueAt)}</span> : null
  const first = post.body.split('\n')[0]
  return first ? <span className="post-sub clamp">{first}</span> : null
}

/** 공유 게시물 한 줄. 일정·할 일·주의사항·메모(F-03-4)를 같은 모양으로 보여준다 */
export default function PostRow({ post, mine, setMine, muted, focused = false }: Props) {
  const { dispatch } = useStore()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (focused) setOpen(true)
  }, [focused])
  const done = !!post.doneAt

  let leading
  if (post.type === 'event' && post.eventAt) leading = <DateTile iso={post.eventAt} muted={muted} />
  else if (post.type === 'todo')
    leading = (
      <button
        className={`check${done ? ' on' : ''}`}
        role="checkbox"
        aria-checked={done}
        aria-label={`${post.title} 완료`}
        onClick={() => dispatch({ type: 'TOGGLE_TODO', id: post.id })}
      >
        {done && <Check size={14} strokeWidth={3} aria-hidden />}
      </button>
    )
  else
    leading = (
      <span className={`type-icon ${post.type === 'caution' ? 'is-caution' : ''}`} aria-hidden>
        {post.type === 'caution' ? <Pin size={18} /> : <StickyNote size={18} />}
      </span>
    )

  return (
    <li id={`post-${post.id}`} className={`post${muted ? ' muted' : ''}${focused ? ' is-target' : ''}`}>
      <div className="post-main">
        {leading}
        <button className="post-body" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className={`post-title${done ? ' done' : ''}`}>
            {post.title}
            {post.confirmRequested && <span className="tag">확인 요청</span>}
          </span>
          <Sub post={post} />
          <ChevronDown className={`post-chev${open ? ' rot' : ''}`} size={18} aria-hidden />
        </button>
      </div>
      {open && (
        <div className="post-detail">
          {post.body && <p>{post.body}</p>}
          <p className="meta">작성 · {post.authorLabel}</p>
        </div>
      )}
      {post.confirmRequested && <ConfirmArea post={post} mine={mine} setMine={setMine} />}
    </li>
  )
}
