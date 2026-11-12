// 기능명세서 v0.2 · 8장 데이터 모델
// 규칙: 공용 항목(BoardPost, Message, Confirmation)에는 space_id를 저장하지 않고 표기 글자(label)만 저장한다.

export type HomeWidgetId = 'shortcuts' | 'memos' | 'todos' | 'events'

/** F-01-4 홈 구성: 위젯을 켜고 끄고 순서를 바꾼다. 공간마다 따로 저장 */
export interface HomeWidget {
  id: HomeWidgetId
  visible: boolean
}

export const DEFAULT_WIDGETS: HomeWidget[] = [
  { id: 'shortcuts', visible: true },
  { id: 'memos', visible: true },
  { id: 'todos', visible: true },
  { id: 'events', visible: true },
]

export interface Space {
  id: string
  name: string // 1~20자, 중복 불가
  color: string // 12색 팔레트 중 하나
  /** 공간 선택 화면의 한 줄 설명. ⚠ 명세서 8장에 없는 필드(UI 시안 기준으로 추가) */
  description?: string
  homeWidgets: HomeWidget[]
  background?: string
  icon?: string // 아이콘 키 (components/icons.tsx)
  sortOrder: number
  hidden: boolean
  deletedAt: string | null
  aiMemoEnabled: boolean // P1
}

export interface Memo {
  id: string
  spaceId: string // Memo는 항상 spaceId로만 조회
  body: string
  pinned: boolean
  sharedPostIds: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PostType = 'event' | 'todo' | 'caution' | 'note'

export interface BoardPost {
  id: string
  type: PostType
  title: string
  body: string
  eventAt?: string
  place?: string
  dueAt?: string
  doneAt?: string
  doneByLabel?: string
  authorLabel: string // 공간 이름 또는 '이름 없이'. 게시 시점 글자로 저장
  origin: 'manual' | 'memo' | 'message' | 'ai_draft'
  pinned: boolean
  confirmRequested: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Message {
  id: string
  body: string
  authorLabel: string
  replyToId?: string
  createdAt: string
  editedAt?: string
  deletedAt: string | null
}

export interface Confirmation {
  id: string
  targetType: 'post' | 'message'
  targetId: string
  confirmedAt: string
  confirmLabel?: string // 기본 '이름 없이'
}

export const ANONYMOUS_LABEL = '이름 없이'

// 6.3 요약 응답 구조는 src/api/types.ts 참고
