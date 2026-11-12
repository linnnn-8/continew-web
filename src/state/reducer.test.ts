import { describe, expect, it } from 'vitest'
import { makeSeed } from '../mocks/seed'
import { reducer, type PostDraft } from './reducer'
import { memosOf, sortBoard } from './selectors'

const draft: PostDraft = {
  type: 'note',
  title: '테스트',
  body: '',
  authorLabel: '하루',
  confirmRequested: false,
  origin: 'manual',
}

describe('원칙2 · 작성자 표기는 직접 고른 뒤에만', () => {
  it('작성자 표기가 비어 있으면 게시되지 않는다', () => {
    const s = makeSeed()
    expect(reducer(s, { type: 'PUBLISH_POST', draft: { ...draft, authorLabel: '' } })).toBe(s)
  })
  it('메시지도 작성자 표기가 비어 있으면 보내지지 않는다', () => {
    const s = makeSeed()
    expect(reducer(s, { type: 'SEND_MESSAGE', body: '안녕', authorLabel: '' })).toBe(s)
  })
  it('일정은 날짜·시간 없이 게시되지 않는다', () => {
    const s = makeSeed()
    expect(reducer(s, { type: 'PUBLISH_POST', draft: { ...draft, type: 'event' } })).toBe(s)
  })
})

describe('8장 · 공간 id 미저장', () => {
  it('게시물·확인 기록에 공간 id가 들어가지 않는다', () => {
    let s = reducer(makeSeed(), { type: 'OPEN_SPACE', id: 'space_a' })
    s = reducer(s, { type: 'PUBLISH_POST', draft })
    s = reducer(s, { type: 'CONFIRM', targetType: 'post', targetId: s.posts[0].id })
    expect(JSON.stringify(s.posts[0])).not.toContain('space_a')
    expect(JSON.stringify(s.confirmations[0])).not.toContain('space_a')
    expect(s.confirmations[0].confirmLabel).toBe('이름 없이')
  })
})

describe('원칙1 · 개인 메모는 열린 공간에서만', () => {
  it('다른 공간의 메모는 읽히지 않는다', () => {
    const s = makeSeed()
    expect(memosOf(s, 'space_a').every((m) => m.spaceId === 'space_a')).toBe(true)
    expect(memosOf(s, null)).toEqual([])
  })
  it('다른 공간에서는 메모를 고칠 수 없다', () => {
    let s = reducer(makeSeed(), { type: 'OPEN_SPACE', id: 'space_b' })
    s = reducer(s, { type: 'UPDATE_MEMO', id: 'memo_1', body: '바꿈' })
    expect(s.memos.find((m) => m.id === 'memo_1')?.body).not.toBe('바꿈')
  })
})

describe('F-03-5 · 게시판 정렬', () => {
  it('주의사항 → 일정 → 할 일 → 메모 순이고 지난 일정은 past로 간다', () => {
    const { active, past } = sortBoard(makeSeed().posts)
    const rank = { caution: 0, event: 1, todo: 2, note: 3 }
    const ranks = active.map((p) => rank[p.type])
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
    const events = active.filter((p) => p.type === 'event').map((p) => p.eventAt ?? '')
    expect(events).toEqual([...events].sort())
    expect(past.map((p) => p.id).sort()).toEqual(['post_5', 'post_6'])
  })
})

describe('기기 변경용 복원', () => {
  it('백업 상태로 전체 기록을 교체하고 열린 공간은 닫는다', () => {
    const current = makeSeed()
    const restored = { ...makeSeed(), currentSpaceId: 'space_b', messages: [] }
    const result = reducer(current, { type: 'RESTORE_BACKUP', state: restored })
    expect(result.messages).toEqual([])
    expect(result.currentSpaceId).toBeNull()
    expect(result.memos).toEqual(restored.memos)
  })
})
