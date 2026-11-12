import { describe, expect, it } from 'vitest'
import { makeSeed } from '../mocks/seed'
import { buildSummaryRequest } from './buildRequest'
import { formatEventWhen } from './format'
import { mockSummarize } from './mockSummary'
import { createPseudonymizer, restoreResponse } from './pseudonym'

const wide = { from: new Date(0), to: new Date(Date.now() + 86_400_000 * 30) }

describe('F-05-6b 가명화·복원', () => {
  it('등장 순서대로 작성자N을 붙이고 되돌린다', () => {
    const p = createPseudonymizer()
    expect(p.alias('하루')).toBe('작성자1')
    expect(p.alias('업무 A')).toBe('작성자2')
    expect(p.alias('하루')).toBe('작성자1')
    expect(p.restore('작성자2')).toBe('업무 A')
  })
  it("'이름 없이'는 author_label을 비운다 (F-05-2f)", () => {
    expect(createPseudonymizer().alias('이름 없이')).toBeUndefined()
  })
  it('응답의 author_labels를 원래 표기로 복원한다', () => {
    const built = buildSummaryRequest(makeSeed(), wide)
    if (built.kind !== 'ready') throw new Error('ready 아님')
    const res = {
      range: { scope: 'shared' as const, from: '', to: '' },
      events: [],
      todos: [],
      cautions: [],
      needs_original: [],
      conversation: [{ text: 'x', author_labels: ['작성자1'], source_ids: ['msg_1'] }],
    }
    const restored = restoreResponse(res, built.pseudonymizer)
    expect(['하루', '업무 A', '업무 B', '공부']).toContain(restored.conversation[0].author_labels[0])
  })
})

describe('원칙1 · 요청에는 공용 글만', () => {
  it('개인 메모 내용과 공간 이름이 요청에 들어가지 않는다', () => {
    const s = makeSeed()
    const built = buildSummaryRequest(s, wide)
    if (built.kind !== 'ready') throw new Error('ready 아님')
    const json = JSON.stringify(built.request)
    for (const m of s.memos) expect(json).not.toContain(m.body)
    for (const name of ['하루', '업무 A', '업무 B', '공부'])
      expect(json).not.toContain(`"author_label":"${name}"`)
    expect(json).toContain('작성자1')
  })
  it('삭제된 글과 기간 밖의 글은 빠진다', () => {
    const s = makeSeed()
    s.posts[0].deletedAt = new Date().toISOString()
    const built = buildSummaryRequest(s, wide)
    if (built.kind !== 'ready') throw new Error('ready 아님')
    expect(built.request.items.find((i) => i.id === s.posts[0].id)).toBeUndefined()
    const none = buildSummaryRequest(s, { from: new Date(2000, 0, 1), to: new Date(2000, 0, 2) })
    expect(none.kind).toBe('few')
  })
  it('시각은 오프셋이 붙은 ISO로 보낸다', () => {
    const built = buildSummaryRequest(makeSeed(), wide)
    if (built.kind !== 'ready') throw new Error('ready 아님')
    expect(built.request.from).toMatch(/[+-]\d\d:\d\d$/)
    expect(built.request.items[0].created_at).toMatch(/[+-]\d\d:\d\d$/)
  })
  it('3개 이하면 요약하지 않고, 300개 초과면 막는다', () => {
    const s = makeSeed()
    expect(buildSummaryRequest({ ...s, posts: s.posts.slice(0, 2), messages: [] }, wide).kind).toBe('few')
    const many = Array.from({ length: 301 }, (_, i) => ({ ...s.messages[0], id: `msg_x${i}` }))
    expect(buildSummaryRequest({ posts: [], messages: many }, wide).kind).toBe('too_many')
  })
})

describe('F-05-2g 날짜 표시', () => {
  it('계산한 날짜와 원문 표현을 함께 보여준다', () => {
    const r = formatEventWhen({
      title: 't',
      date: '2026-11-13',
      time: '14:00',
      original_phrase: '내일 2시',
      date_confidence: 'high',
      source_ids: [],
    })
    expect(r.text).toBe("11/13(금) 오후 2시 · 원문: '내일 2시'")
    expect(r.needsCheck).toBe(false)
    expect(
      formatEventWhen({
        title: 't',
        date: '2026-11-13',
        time: null,
        original_phrase: null,
        date_confidence: 'low',
        source_ids: [],
      }).needsCheck,
    ).toBe(true)
  })
})

describe('mock 요약', () => {
  it('서버처럼 3개 이하면 전부 needs_original', async () => {
    const req = {
      scope: 'shared' as const,
      from: '',
      to: '',
      items: [{ id: 'post_1', kind: 'post' as const, post_type: 'note' as const }],
    }
    const res = await mockSummarize(req)
    expect(res.needs_original).toEqual(['post_1'])
  })
})
