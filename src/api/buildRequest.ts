import type { AppState } from '../state/reducer'
import { toOffsetIso } from '../state/utils'
import { createPseudonymizer, type Pseudonymizer } from './pseudonym'
import { MAX_ITEMS, MIN_ITEMS_TO_SUMMARIZE, type SummaryItem, type SummaryRequest } from './types'

export type Target = 'board' | 'chat' | 'both'

export type BuildResult =
  | { kind: 'ready'; request: SummaryRequest; pseudonymizer: Pseudonymizer }
  /** 3개 이하: 요약하지 않고 원문 목록을 바로 보여준다 (F-05-2j) */
  | { kind: 'few'; postIds: string[]; messageIds: string[] }
  /** 300개 초과: 기간을 줄이게 안내 */
  | { kind: 'too_many'; count: number }

export type RangeKind = 'sinceLastOpen' | 'today' | '3d' | '7d'

/** F-05-2b 기간. '마지막으로 연 뒤'는 이 공간에서 공용 영역을 마지막으로 연 시각 기준 */
export function rangeFor(kind: RangeKind, s: AppState, spaceId: string | null, now = new Date()) {
  const DAY = 24 * 60 * 60 * 1000
  switch (kind) {
    case 'sinceLastOpen': {
      const last = spaceId ? s.boardViewed[spaceId] : undefined
      return { from: last ? new Date(last) : new Date(0), to: now }
    }
    case 'today':
      return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: now }
    case '3d':
      return { from: new Date(now.getTime() - 3 * DAY), to: now }
    case '7d':
      return { from: new Date(now.getTime() - 7 * DAY), to: now }
  }
}

/**
 * 요약 요청 만들기. 공용 영역(게시판·대화)의 글만 읽는다.
 * AppState.memos는 이 함수 어디에서도 읽지 않는다 (원칙1, F-05-6a).
 */
export function buildSummaryRequest(
  s: Pick<AppState, 'posts' | 'messages'>,
  opts: { from: Date; to: Date; target?: Target },
): BuildResult {
  const { from, to, target = 'both' } = opts
  const inRange = (createdAt: string) => {
    const t = new Date(createdAt).getTime()
    return t >= from.getTime() && t <= to.getTime()
  }
  const p = createPseudonymizer()
  const items: SummaryItem[] = []

  if (target !== 'chat') {
    for (const post of s.posts) {
      if (post.deletedAt || !inRange(post.createdAt)) continue
      items.push({
        id: post.id,
        kind: 'post',
        post_type: post.type,
        title: post.title,
        body: post.body || undefined,
        author_label: p.alias(post.authorLabel),
        event_at: post.eventAt ? toOffsetIso(post.eventAt) : undefined,
        due_at: post.dueAt ? toOffsetIso(post.dueAt) : undefined,
        created_at: toOffsetIso(post.createdAt),
      })
    }
  }
  if (target !== 'board') {
    for (const m of s.messages) {
      if (m.deletedAt || !inRange(m.createdAt)) continue
      items.push({
        id: m.id,
        kind: 'message',
        body: m.body,
        author_label: p.alias(m.authorLabel),
        created_at: toOffsetIso(m.createdAt),
      })
    }
  }

  if (items.length > MAX_ITEMS) return { kind: 'too_many', count: items.length }
  if (items.length < MIN_ITEMS_TO_SUMMARIZE) {
    return {
      kind: 'few',
      postIds: items.filter((i) => i.kind === 'post').map((i) => i.id),
      messageIds: items.filter((i) => i.kind === 'message').map((i) => i.id),
    }
  }
  return {
    kind: 'ready',
    pseudonymizer: p,
    request: { scope: 'shared', from: toOffsetIso(from), to: toOffsetIso(to), items },
  }
}
