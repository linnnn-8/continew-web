import { describe, expect, it } from 'vitest'
import { makeSeed } from '../mocks/seed'
import { loadFromRaw } from './store'

describe('기기에 저장된 기록 다시 열기', () => {
  it('저장된 기록이 없으면 예시 데이터로 시작해 저장할 수 있다', () => {
    const loaded = loadFromRaw(null)
    expect(loaded.state.spaces.length).toBeGreaterThan(0)
    expect(loaded.canSave).toBe(true)
  })

  it('정상 기록은 유지하고 열린 공간만 닫는다', () => {
    const saved = { ...makeSeed(), currentSpaceId: 'space_a', messages: [] }
    const loaded = loadFromRaw(JSON.stringify(saved))
    expect(loaded.state.messages).toEqual([])
    expect(loaded.state.currentSpaceId).toBeNull()
    expect(loaded.canSave).toBe(true)
  })

  it('손상된 기록은 덮어쓰지 않도록 자동 저장을 멈춘다', () => {
    for (const raw of ['', '{broken', '{"spaces":[]}']) {
      const loaded = loadFromRaw(raw)
      expect(loaded.warning).toBeTruthy()
      expect(loaded.canSave).toBe(false)
    }
  })
})
