// 프론트엔드 API 연동 가이드(POST /api/v1/summaries) 기준. JSON 키는 snake_case 그대로 쓴다.

export interface SummaryItem {
  id: string
  kind: 'post' | 'message'
  post_type?: 'event' | 'todo' | 'caution' | 'note'
  title?: string
  body?: string
  author_label?: string // 가명('작성자1')으로만 보낸다. '이름 없이'는 비운다
  event_at?: string // ISO 8601, 오프셋 포함
  due_at?: string
  created_at?: string
}

export interface SummaryRequest {
  scope: 'shared'
  from: string
  to: string
  items: SummaryItem[]
}

export interface SummaryResponse {
  range: { scope: 'shared'; from: string; to: string }
  events: {
    title: string
    date: string // YYYY-MM-DD
    time: string | null // HH:mm
    original_phrase: string | null
    date_confidence: 'high' | 'low'
    source_ids: string[]
  }[]
  todos: { title: string; due: string | null; source_ids: string[] }[]
  cautions: { text: string; source_ids: string[] }[]
  conversation: { text: string; author_labels: string[]; source_ids: string[] }[]
  needs_original: string[]
}

export type SummaryErrorCode =
  | 'MISSING_INSTALLATION_ID'
  | 'SCOPE_NOT_SUPPORTED'
  | 'INVALID_REQUEST'
  | 'INVALID_RANGE'
  | 'DUPLICATE_ITEM_ID'
  | 'INVALID_ITEM'
  | 'TOO_MANY_ITEMS'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'SUMMARY_UNAVAILABLE'
  | 'NETWORK' // 네트워크 없음
  | 'TIMEOUT' // 25초 초과
  | 'UNKNOWN'

export const MAX_ITEMS = 300 // 넘으면 422
export const MIN_ITEMS_TO_SUMMARIZE = 4 // 3개 이하면 요약하지 않고 원문 목록 (F-05-2j)
export const REQUEST_TIMEOUT_MS = 25_000 // 서버 20초 + 여유
export const SLOW_AFTER_MS = 3_000 // 진행 표시·취소 버튼
