import { formatYmd } from '../state/utils'
import type { SummaryResponse } from './types'

type Ev = SummaryResponse['events'][number]

/**
 * F-05-2g 날짜는 계산한 날짜와 원문 표현을 함께 보여준다.
 * 예: "11/13(금) 오후 2시 · 원문: '내일 2시'" / 불확실하면 '날짜 확인 필요'
 */
export function formatEventWhen(e: Ev) {
  const when = formatYmd(e.date, e.time)
  const parts = [when]
  if (e.original_phrase) parts.push(`원문: '${e.original_phrase}'`)
  return { text: parts.join(' · '), needsCheck: e.date_confidence === 'low' }
}

/** 응답 id → 원문 종류. 앱 id는 post_ / msg_ 로 시작한다 */
export function sourceKind(id: string): 'post' | 'message' {
  return id.startsWith('msg_') ? 'message' : 'post'
}
