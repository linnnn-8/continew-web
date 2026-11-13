import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildSummaryRequest, rangeFor, type RangeKind } from '../api/buildRequest'
import { formatEventWhen } from '../api/format'
import { useSummary } from '../api/useSummary'
import { COPY } from '../copy'
import { useStore } from '../state/store'
import { formatYmd } from '../state/utils'

type SummaryRow = { text: string; detail?: string; needsCheck?: boolean; sourceIds: string[] }

/** 공용 글만 서버에 보내고, 요약 결과와 원문 이동을 보여 준다. */
export default function SummaryResultScreen() {
  const { state, currentSpace } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const fromBoard = Object.prototype.hasOwnProperty.call(location.state ?? {}, 'since')
  const since = typeof location.state?.since === 'string' ? location.state.since : undefined
  const [rangeKind, setRangeKind] = useState<RangeKind>(fromBoard ? 'sinceLastOpen' : '7d')
  const [originalIds, setOriginalIds] = useState<string[]>([])
  const { phase, run, cancel, reset, enabled } = useSummary()

  function selectedRange() {
    const to = new Date()
    if (rangeKind === 'sinceLastOpen' && fromBoard) {
      const from = since && !Number.isNaN(Date.parse(since)) ? new Date(since) : new Date(0)
      return { from, to }
    }
    return rangeFor(rangeKind, state, currentSpace?.id ?? null, to)
  }

  function start() {
    const range = selectedRange()
    const built = buildSummaryRequest(state, range)
    setOriginalIds(
      built.kind === 'ready'
        ? built.request.items.map((item) => item.id)
        : built.kind === 'few'
          ? [...built.postIds, ...built.messageIds]
          : [],
    )
    void run(range)
  }

  function sources(ids: string[]) {
    return ids.map((id) => {
      const post = state.posts.find((item) => item.id === id && !item.deletedAt)
      const message = state.messages.find((item) => item.id === id && !item.deletedAt)
      if (!post && !message) return null
      const title = post?.title ?? message?.body ?? ''
      const to = post ? `/board?post=${encodeURIComponent(id)}` : `/chat?message=${encodeURIComponent(id)}`
      return (
        <button
          className="summary-source"
          key={id}
          onClick={() => navigate(to)}
          aria-label={`${title} 원문 보기`}
        >
          원문 보기
        </button>
      )
    })
  }

  const groups: { title: string; rows: SummaryRow[] }[] =
    phase.kind === 'done'
      ? [
          {
            title: '다가오는 일정',
            rows: phase.result.events.map((event) => {
              const when = formatEventWhen(event)
              return {
                text: event.title,
                detail: when.text,
                needsCheck: when.needsCheck,
                sourceIds: event.source_ids,
              }
            }),
          },
          {
            title: '해야 할 일',
            rows: phase.result.todos.map((todo) => ({
              text: todo.title,
              detail: todo.due ? `기한 ${formatYmd(todo.due)}` : undefined,
              sourceIds: todo.source_ids,
            })),
          },
          {
            title: '주의사항',
            rows: phase.result.cautions.map((caution) => ({
              text: caution.text,
              sourceIds: caution.source_ids,
            })),
          },
          {
            title: '대화 주요 내용',
            rows: phase.result.conversation.map((message) => ({
              text: message.text,
              detail: message.author_labels.join(' · ') || undefined,
              sourceIds: message.source_ids,
            })),
          },
        ]
      : []

  const unresolvedIds = phase.kind === 'done' ? phase.result.needs_original : []
  const showOriginals =
    phase.kind === 'originals'
      ? [...phase.postIds, ...phase.messageIds]
      : phase.kind === 'error'
        ? originalIds
        : unresolvedIds

  return (
    <div className="page page-summary">
      <button className="back" onClick={() => navigate('/board')}>
        <ChevronLeft size={20} aria-hidden /> 게시판
      </button>
      <h1>공유 내용 요약</h1>
      <p className="sub">공유된 게시글과 대화를 한눈에 살펴봐요.</p>

      <label className="form-label" htmlFor="summary-range">
        기간
      </label>
      <select
        id="summary-range"
        className="form-input"
        value={rangeKind}
        disabled={phase.kind === 'loading'}
        onChange={(event) => {
          setRangeKind(event.target.value as RangeKind)
          reset()
        }}
      >
        <option value="sinceLastOpen">마지막으로 게시판을 연 뒤</option>
        <option value="today">오늘</option>
        <option value="3d">최근 3일</option>
        <option value="7d">최근 7일</option>
      </select>
      <button
        className="btn btn-primary wide"
        disabled={!enabled || phase.kind === 'loading'}
        onClick={start}
      >
        {phase.kind === 'idle' ? '요약 시작' : '다시 요약하기'}
      </button>
      <div className="summary-results">
        {!enabled && <p className="notice">요약 기능이 꺼져 있어요.</p>}

        {phase.kind === 'loading' && (
          <div className="summary-status" role="status">
            <p>{phase.slow ? '요약하는 데 시간이 조금 더 걸리고 있어요.' : '공유 내용을 정리하고 있어요.'}</p>
            {phase.slow && (
              <button className="link-btn" onClick={cancel}>
                취소
              </button>
            )}
          </div>
        )}
        {phase.kind === 'tooMany' && (
          <p className="notice" role="status">
            글이 {phase.count}개예요. 기간을 줄여 주세요.
          </p>
        )}
        {phase.kind === 'error' && (
          <p className="notice" role="alert">
            {phase.info.message}
          </p>
        )}

        {groups
          .filter((group) => group.rows.length > 0)
          .map((group) => (
            <section className="summary-section" key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.rows.map((row, index) => (
                  <li key={`${group.title}-${index}`}>
                    <p>{row.text}</p>
                    {row.detail && <small>{row.detail}</small>}
                    {row.needsCheck && <small>날짜 확인 필요</small>}
                    <div className="summary-sources">{sources(row.sourceIds)}</div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

        {(phase.kind === 'originals' ||
          (phase.kind === 'error' && phase.info.showOriginals) ||
          unresolvedIds.length > 0) && (
          <section className="summary-section">
            <h2>원문 확인 필요</h2>
            {showOriginals.length === 0 ? (
              <p className="empty">해당 기간에 공유된 기록이 없어요.</p>
            ) : (
              <ul>
                {showOriginals.map((id) => {
                  const post = state.posts.find((item) => item.id === id && !item.deletedAt)
                  const message = state.messages.find((item) => item.id === id && !item.deletedAt)
                  if (!post && !message) return null
                  return (
                    <li key={id}>
                      <p>{post?.title ?? message?.body}</p>
                      <div className="summary-sources">{sources([id])}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}
      </div>

      <p className="summary-disclaimer">{COPY.summaryDisclaimer}</p>
    </div>
  )
}
