import { ChevronDown, Plus, Sparkles, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Cloud from '../components/Cloud'
import DevAiToggle from '../components/board/DevAiToggle'
import PostRow from '../components/board/PostRow'
import { ScopeBadge } from '../components/common'
import { Card } from '../components/ui'
import { COPY } from '../copy'
import { sortBoard } from '../state/selectors'
import { useStore } from '../state/store'
import type { BoardPost } from '../types/model'

type Filter = 'all' | 'event' | 'todo' | 'board'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'event', label: '일정' },
  { id: 'todo', label: '할 일' },
  { id: 'board', label: '게시판' }, // 주의사항 + 메모
]
const PREVIEW = 3

export default function Board() {
  const { state, dispatch, currentSpace } = useStore()
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const filter = (FILTERS.find((f) => f.id === sp.get('filter'))?.id ?? 'all') as Filter
  const [showPast, setShowPast] = useState(false)
  const [mine, setMine] = useState<string[]>([])
  const spaceId = currentSpace?.id ?? null
  const aiOn = state.settings.aiSummaryEnabled

  // F-03-9: 이 공간에서 공용 영역을 연 시각을 저장한다. 요약 기간(마지막으로 연 뒤)에 쓰도록 연 직전 값을 들고 있는다
  const sinceRef = useRef(spaceId ? state.boardViewed[spaceId] : undefined)
  useEffect(() => {
    dispatch({ type: 'MARK_BOARD_VIEWED' })
  }, [dispatch, spaceId])

  const { active, past } = sortBoard(state.posts)
  const match = (p: BoardPost) =>
    filter === 'all' || (filter === 'board' ? p.type === 'note' || p.type === 'caution' : p.type === filter)
  const pick = (type: BoardPost['type']) => active.filter((p) => p.type === type && match(p))
  const cautions = pick('caution')
  const events = pick('event')
  const todos = pick('todo')
  const notes = pick('note')
  const pastShown = past.filter(match)
  const empty = !cautions.length && !events.length && !todos.length && !notes.length

  const section = (title: string, list: BoardPost[], target: Filter, cls = '') => {
    if (!list.length) return null
    const shown = filter === 'all' ? list.slice(0, PREVIEW) : list
    return (
      <Card className={`sec ${cls}`}>
        <div className="sec-head">
          <h3>{title}</h3>
          {filter === 'all' && list.length > PREVIEW && (
            <button className="sec-more" onClick={() => setSp({ filter: target }, { replace: true })}>
              전체 보기
              <ChevronRight size={14} aria-hidden />
            </button>
          )}
        </div>
        <ul className="post-list">
          {shown.map((p) => (
            <PostRow key={p.id} post={p} mine={mine} setMine={setMine} />
          ))}
        </ul>
      </Card>
    )
  }

  return (
    <div className="page page-shared">
      <div className="hero">
        <div>
          <ScopeBadge scope="shared" />
          <h1>게시판</h1>
          <p className="sub">모든 공간과 함께 보는 공용 기록이에요.</p>
          {aiOn && (
            <span className="ai-chip">
              <Sparkles size={12} aria-hidden />
              {COPY.aiOn}
            </span>
          )}
        </div>
        <Cloud double />
      </div>

      <div className="chips" role="tablist" aria-label="유형 필터">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`chip${filter === f.id ? ' on' : ''}`}
            onClick={() => setSp(f.id === 'all' ? {} : { filter: f.id }, { replace: true })}
          >
            {f.label}
          </button>
        ))}
      </div>

      {aiOn && (
        <button className="ai-banner" onClick={() => nav('/summary', { state: { since: sinceRef.current } })}>
          <Sparkles size={22} aria-hidden />
          <span>
            <strong>새 내용을 요약하기</strong>
            <small>공유된 일정과 게시글을 AI로 정리해요.</small>
          </span>
          <ChevronRight size={18} aria-hidden />
        </button>
      )}

      {section('주의사항', cautions, 'board', 'sec-caution')}
      {section('공유 일정', events, 'event')}
      {section('공유 할 일', todos, 'todo')}
      {section('게시판', notes, 'board')}
      {empty && <p className="empty">표시할 항목이 없어요.</p>}

      {pastShown.length > 0 && (
        <div className="past">
          <button className="past-toggle" aria-expanded={showPast} onClick={() => setShowPast((v) => !v)}>
            지난 항목 {pastShown.length}
            <ChevronDown size={16} className={showPast ? 'rot' : ''} aria-hidden />
          </button>
          {showPast && (
            <ul className="post-list">
              {pastShown.map((p) => (
                <PostRow key={p.id} post={p} mine={mine} setMine={setMine} muted />
              ))}
            </ul>
          )}
        </div>
      )}

      {import.meta.env.DEV && <DevAiToggle />}

      <button className="fab" aria-label="공용에 직접 작성" onClick={() => nav('/share')}>
        <Plus size={26} aria-hidden />
      </button>
    </div>
  )
}
