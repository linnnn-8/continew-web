import { describe, expect, it } from 'vitest'
import { makeSeed } from '../mocks/seed'
import { createBackup, readBackup } from './backup'

describe('encrypted backup', () => {
  it('restores the complete state with the correct password and does not expose memo text', async () => {
    const state = makeSeed()
    const file = await createBackup(state, 'a long backup passphrase')
    expect(file).not.toContain(state.memos[0].body)
    expect(await readBackup(file, 'a long backup passphrase')).toEqual(state)
  })

  it('does not replace data when the password or file is wrong', async () => {
    const file = await createBackup(makeSeed(), 'a long backup passphrase')
    await expect(readBackup(file, 'wrong password')).rejects.toThrow()
    await expect(readBackup('{"format":"other"}', 'a long backup passphrase')).rejects.toThrow()
  })
})
