import type { BoardPost, Confirmation, HomeWidget, Memo, Message, PostType, Space } from '../types/model'
import { ANONYMOUS_LABEL, DEFAULT_WIDGETS } from '../types/model'
import { newId, nowIso } from './utils'

export interface AppState {
  spaces: Space[]
  memos: Memo[]
  posts: BoardPost[]
  messages: Message[]
  confirmations: Confirmation[]
  /** 공간별로 공용 영역을 마지막으로 연 시각 (F-03-9). 읽었다는 표시가 아님 */
  boardViewed: Record<string, string>
  currentSpaceId: string | null
  settings: { aiSummaryEnabled: boolean; notifyPreview: boolean }
}

export interface PostDraft {
  type: PostType
  title: string
  body: string
  eventAt?: string
  place?: string
  dueAt?: string
  /** 사용자가 직접 고른 표기. 비어 있으면 게시할 수 없다 (원칙2, F-03-3) */
  authorLabel: string
  confirmRequested: boolean
  origin: BoardPost['origin']
  fromMemoId?: string
}

export type Action =
  | { type: 'OPEN_SPACE'; id: string }
  | { type: 'CLOSE_SPACE' }
  | { type: 'ADD_SPACE'; name: string; color: string; icon?: string; description?: string }
  | { type: 'SET_WIDGETS'; spaceId: string; widgets: HomeWidget[] }
  | { type: 'ADD_MEMO'; body: string }
  | { type: 'UPDATE_MEMO'; id: string; body: string }
  | { type: 'DELETE_MEMO'; id: string }
  | { type: 'PUBLISH_POST'; draft: PostDraft }
  | { type: 'SEND_MESSAGE'; body: string; authorLabel: string; replyToId?: string }
  | { type: 'CONFIRM'; id?: string; targetType: 'post' | 'message'; targetId: string; label?: string }
  | { type: 'UNCONFIRM'; id: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'MARK_BOARD_VIEWED' }
  | { type: 'SET_AI'; enabled: boolean }

export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'OPEN_SPACE':
      return s.spaces.some((x) => x.id === a.id) ? { ...s, currentSpaceId: a.id } : s
    case 'CLOSE_SPACE':
      return { ...s, currentSpaceId: null }
    case 'ADD_SPACE': {
      const name = a.name.trim()
      if (name.length < 1 || name.length > 20) return s // F-01-1
      if (s.spaces.some((x) => x.name === name && !x.deletedAt)) return s // 중복 불가
      const space: Space = {
        id: newId('space'),
        name,
        color: a.color,
        icon: a.icon,
        description: a.description,
        homeWidgets: DEFAULT_WIDGETS.map((w) => ({ ...w })),
        sortOrder: s.spaces.length,
        hidden: false,
        deletedAt: null,
        aiMemoEnabled: false,
      }
      return { ...s, spaces: [...s.spaces, space] }
    }
    case 'SET_WIDGETS':
      return {
        ...s,
        spaces: s.spaces.map((x) => (x.id === a.spaceId ? { ...x, homeWidgets: a.widgets } : x)),
      }
    case 'ADD_MEMO': {
      if (!s.currentSpaceId) return s
      const t = nowIso()
      const memo: Memo = {
        id: newId('memo'),
        spaceId: s.currentSpaceId,
        body: a.body,
        pinned: false,
        sharedPostIds: [],
        createdAt: t,
        updatedAt: t,
        deletedAt: null,
      }
      return { ...s, memos: [memo, ...s.memos] }
    }
    case 'UPDATE_MEMO':
      return {
        ...s,
        memos: s.memos.map((m) =>
          m.id === a.id && m.spaceId === s.currentSpaceId ? { ...m, body: a.body, updatedAt: nowIso() } : m,
        ),
      }
    case 'DELETE_MEMO': // 휴지통으로 (F-02-4)
      return {
        ...s,
        memos: s.memos.map((m) =>
          m.id === a.id && m.spaceId === s.currentSpaceId ? { ...m, deletedAt: nowIso() } : m,
        ),
      }
    case 'PUBLISH_POST': {
      const d = a.draft
      if (!d.authorLabel.trim()) return s // 작성자 표기를 고르기 전에는 게시 불가
      if (d.type === 'event' && !d.eventAt) return s // 일정은 날짜·시간 필수
      const t = nowIso()
      // BoardPost에는 공간 id를 저장하지 않는다 (8장)
      const post: BoardPost = {
        id: newId('post'),
        type: d.type,
        title: d.title,
        body: d.body,
        eventAt: d.eventAt,
        place: d.place,
        dueAt: d.dueAt,
        authorLabel: d.authorLabel,
        origin: d.origin,
        pinned: d.type === 'caution',
        confirmRequested: d.type !== 'note' && d.confirmRequested,
        createdAt: t,
        updatedAt: t,
        deletedAt: null,
      }
      return {
        ...s,
        posts: [post, ...s.posts],
        memos: d.fromMemoId
          ? s.memos.map((m) =>
              m.id === d.fromMemoId ? { ...m, sharedPostIds: [...m.sharedPostIds, post.id] } : m,
            )
          : s.memos,
      }
    }
    case 'SEND_MESSAGE': {
      if (!a.authorLabel.trim() || !a.body.trim()) return s
      const msg: Message = {
        id: newId('msg'),
        body: a.body,
        authorLabel: a.authorLabel,
        replyToId: a.replyToId,
        createdAt: nowIso(),
        deletedAt: null,
      }
      return { ...s, messages: [...s.messages, msg] }
    }
    case 'CONFIRM': {
      // 공간 id는 저장하지 않는다. 표기 글자만 (F-04-9)
      const c: Confirmation = {
        id: a.id ?? newId('conf'),
        targetType: a.targetType,
        targetId: a.targetId,
        confirmedAt: nowIso(),
        confirmLabel: a.label ?? ANONYMOUS_LABEL,
      }
      return { ...s, confirmations: [...s.confirmations, c] }
    }
    case 'UNCONFIRM':
      return { ...s, confirmations: s.confirmations.filter((c) => c.id !== a.id) }
    case 'TOGGLE_TODO':
      return {
        ...s,
        posts: s.posts.map((p) =>
          p.id === a.id && p.type === 'todo' ? { ...p, doneAt: p.doneAt ? undefined : nowIso() } : p,
        ),
      }
    case 'MARK_BOARD_VIEWED':
      return s.currentSpaceId ? { ...s, boardViewed: { ...s.boardViewed, [s.currentSpaceId]: nowIso() } } : s
    case 'SET_AI':
      return { ...s, settings: { ...s.settings, aiSummaryEnabled: a.enabled } }
  }
}
