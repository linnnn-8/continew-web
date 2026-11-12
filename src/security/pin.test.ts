import { describe, expect, it } from 'vitest'
import { createPinRecord, verifyPinRecord } from './pin'

describe('PIN verifier', () => {
  it('stores a salted verifier and checks the six-digit PIN', async () => {
    const first = await createPinRecord('123456')
    const second = await createPinRecord('123456')
    expect(JSON.stringify(first)).not.toContain('123456')
    expect(first.salt).not.toBe(second.salt)
    expect(await verifyPinRecord(first, '123456')).toBe(true)
    expect(await verifyPinRecord(first, '654321')).toBe(false)
  })

  it('rejects a PIN with the wrong length', async () => {
    await expect(createPinRecord('12345')).rejects.toThrow()
  })
})
