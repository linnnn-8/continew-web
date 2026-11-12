import type { BoardPost } from '../types/model'
import type { AppState } from './reducer'
import type { Space } from '../types/model'

/** Memo는 항상 지금 열린 공간 id로만 읽는다 (8장 설계 규칙) */
export function memosOf(s: AppState, spaceId: string | null) {
  if (!spaceId) return []
  return s.memos
    .filter((m) => m.spaceId === spaceId && !m.deletedAt)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt))
}

const rank: Record<BoardPost['type'], number> = { caution: 0, event: 1, todo: 2, note: 3 }

/** F-03-5 정렬: 주의사항 → 다가오는 일정(날짜순) → 미완료 할 일 → 메모(최신순). 지난 일정·완료 할 일은 past */
export function sortBoard(posts: BoardPost[], now = new Date()) {
  const live = posts.filter((p) => !p.deletedAt)
  const isPast = (p: BoardPost) =>
    (p.type === 'event' && !!p.eventAt && new Date(p.eventAt) < now) || (p.type === 'todo' && !!p.doneAt)
  const active = live
    .filter((p) => !isPast(p))
    .sort((a, b) => {
      if (rank[a.type] !== rank[b.type]) return rank[a.type] - rank[b.type]
      if (a.type === 'event') return (a.eventAt ?? '').localeCompare(b.eventAt ?? '')
      return b.createdAt.localeCompare(a.createdAt)
    })
  const past = live.filter(isPast).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return { active, past }
}

/** F-03-9: 이 공간에서 공용 영역을 마지막으로 연 뒤 올라온 글 수 */
export function newItemCount(s: AppState, spaceId: string | null) {
  if (!spaceId) return 0
  const since = s.boardViewed[spaceId] ?? ''
  const live = (x: { createdAt: string; deletedAt: string | null }) => !x.deletedAt && x.createdAt > since
  return s.posts.filter(live).length + s.messages.filter(live).length
}

/** F-04-10: 확인 N건 · 마지막 확인 시각 */
export function confirmationsFor(s: AppState, targetId: string) {
  const list = s.confirmations.filter((c) => c.targetId === targetId)
  const last = list
    .map((c) => c.confirmedAt)
    .sort()
    .at(-1)
  return { count: list.length, last, list }
}

/** 공간 선택 화면에 보이는 공간 (숨김·삭제 제외, 정렬 순) */
export function visibleSpaces(s: AppState): Space[] {
  return s.spaces.filter((x) => !x.hidden && !x.deletedAt).sort((a, b) => a.sortOrder - b.sortOrder)
}
