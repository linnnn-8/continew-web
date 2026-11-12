import { localParts } from '../state/utils'
import type { SummaryRequest, SummaryResponse } from './types'

const cut = (t: string, n = 60) => (t.length > n ? `${t.slice(0, n - 1)}…` : t)

/** 서버 없이 화면을 만들 때 쓰는 가짜 응답. 실제 서버처럼 3개 이하면 전부 needs_original */
export async function mockSummarize(req: SummaryRequest, signal?: AbortSignal): Promise<SummaryResponse> {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 1200)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('aborted', 'AbortError'))
    })
  })
  const range = { scope: 'shared' as const, from: req.from, to: req.to }
  if (req.items.length <= 3) {
    return {
      range,
      events: [],
      todos: [],
      cautions: [],
      conversation: [],
      needs_original: req.items.map((i) => i.id),
    }
  }
  const posts = req.items.filter((i) => i.kind === 'post')
  return {
    range,
    events: posts
      .filter((i) => i.post_type === 'event' && i.event_at)
      .map((i) => {
        const { date, time } = localParts(i.event_at!)
        return {
          title: cut(i.title ?? ''),
          date,
          time,
          original_phrase: null,
          date_confidence: 'high' as const,
          source_ids: [i.id],
        }
      }),
    todos: posts
      .filter((i) => i.post_type === 'todo')
      .map((i) => ({
        title: cut(i.title ?? ''),
        due: i.due_at ? localParts(i.due_at).date : null,
        source_ids: [i.id],
      })),
    cautions: posts
      .filter((i) => i.post_type === 'caution')
      .map((i) => ({ text: cut(i.title ?? i.body ?? ''), source_ids: [i.id] })),
    conversation: req.items
      .filter((i) => i.kind === 'message')
      .slice(-5)
      .map((i) => ({
        text: cut(i.body ?? ''),
        author_labels: i.author_label ? [i.author_label] : [],
        source_ids: [i.id],
      })),
    needs_original: [],
  }
}
