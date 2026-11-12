import { Calendar, CheckSquare, Check, ChevronRight, Pencil, Pin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui'
import { DateTile, ScopeBadge, SectionHead } from '../common'
import { memosOf } from '../../state/selectors'
import { useStore } from '../../state/store'
import { formatShortDate, formatTime, nowIso } from '../../state/utils'
import type { BoardPost, HomeWidgetId } from '../../types/model'

/** 바로가기. 메모는 이 공간에만, 일정·할 일은 공용 게시판에 올라간다(공유 확인 화면을 거친다) */
function Shortcuts() {
  const nav = useNavigate()
  return (
    <div className="shortcuts">
      <button className="sc sc-personal" onClick={() => nav('/memo/new')}>
        <Pencil size={22} aria-hidden />
        <span>메모 쓰기</span>
      </button>
      <button className="sc sc-shared" onClick={() => nav('/share?type=event')}>
        <Calendar size={22} aria-hidden />
        <span>일정 추가</span>
        <em>공용</em>
      </button>
      <button className="sc sc-shared" onClick={() => nav('/share?type=todo')}>
        <CheckSquare size={22} aria-hidden />
        <span>할 일 추가</span>
        <em>공용</em>
      </button>
    </div>
  )
}

/** 개인 메모 목록. 이 공간의 메모만 읽는다 (8장) */
function Memos() {
  const { state, currentSpace } = useStore()
  const nav = useNavigate()
  const memos = memosOf(state, currentSpace?.id ?? null)
  return (
    <Card className="sec sec-personal">
      <SectionHead title="내 메모" badge={<ScopeBadge scope="personal" />} />
      {memos.length === 0 ? (
        <p className="empty">이 공간에 메모가 없어요.</p>
      ) : (
        <ul className="memo-list">
          {memos.map((m) => {
            const [title, ...rest] = m.body.split('\n')
            return (
              <li key={m.id}>
                <button className="memo-row" onClick={() => nav(`/memo/${m.id}`)}>
                  <span className="memo-text">
                    <strong>
                      {m.pinned && <Pin size={12} aria-label="고정" />}
                      {title}
                    </strong>
                    {rest.length > 0 && <small>{rest.join(' ')}</small>}
                  </span>
                  {m.sharedPostIds.length > 0 && <span className="tag tag-shared">공유함</span>}
                  <ChevronRight size={16} aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

/** 공용 할 일. 어느 공간에서든 체크할 수 있다 (F-03-6) */
function Todos() {
  const { state, dispatch } = useStore()
  const nav = useNavigate()
  const todos: BoardPost[] = state.posts
    .filter((p) => p.type === 'todo' && !p.deletedAt)
    .sort((a, b) => Number(!!a.doneAt) - Number(!!b.doneAt) || (a.dueAt ?? '9').localeCompare(b.dueAt ?? '9'))
  return (
    <Card className="sec">
      <SectionHead
        title="전체 할 일"
        badge={<ScopeBadge scope="shared" />}
        onMore={() => nav('/board?filter=todo')}
      />
      {todos.length === 0 ? (
        <p className="empty">공용 할 일이 없어요.</p>
      ) : (
        <ul className="todo-list">
          {todos.slice(0, 3).map((t) => (
            <li key={t.id}>
              <button
                className={`check${t.doneAt ? ' on' : ''}`}
                role="checkbox"
                aria-checked={!!t.doneAt}
                aria-label={`${t.title} 완료`}
                onClick={() => dispatch({ type: 'TOGGLE_TODO', id: t.id })}
              >
                {t.doneAt && <Check size={14} strokeWidth={3} aria-hidden />}
              </button>
              <span className={t.doneAt ? 'done' : ''}>{t.title}</span>
              {t.dueAt && !t.doneAt && <small>{formatShortDate(t.dueAt)}</small>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/** 다가오는 일정 2개 (SCR-03) */
function Events() {
  const { state } = useStore()
  const nav = useNavigate()
  const now = nowIso()
  const events = state.posts
    .filter((p) => p.type === 'event' && !p.deletedAt && p.eventAt && p.eventAt >= now)
    .sort((a, b) => a.eventAt!.localeCompare(b.eventAt!))
    .slice(0, 2)
  return (
    <Card className="sec">
      <SectionHead
        title="다가오는 일정"
        badge={<ScopeBadge scope="shared" />}
        onMore={() => nav('/board?filter=event')}
      />
      {events.length === 0 ? (
        <p className="empty">다가오는 일정이 없어요.</p>
      ) : (
        <ul className="event-list">
          {events.map((e) => (
            <li key={e.id}>
              <DateTile iso={e.eventAt!} />
              <span className="event-text">
                <strong>{e.title}</strong>
                <small>
                  {formatTime(e.eventAt!)}
                  {e.place ? ` · ${e.place}` : ''}
                </small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export const WIDGETS: Record<
  HomeWidgetId,
  { label: string; shared: boolean; View: () => React.JSX.Element }
> = {
  shortcuts: { label: '바로가기', shared: false, View: Shortcuts },
  memos: { label: '메모', shared: false, View: Memos },
  todos: { label: '할 일', shared: true, View: Todos },
  events: { label: '일정', shared: true, View: Events },
}
