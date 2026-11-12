const ITERATIONS = 310_000
export const PIN_KEY = 'continew:pin:v1'
export const SKIP_KEY = 'continew:pin-skipped:v1'
export const DELAY_KEY = 'continew:lock-delay:v1'

export type LockDelay = 'instant' | '1m' | '5m'

export interface PinRecord {
  version: 1
  salt: string
  hash: string
}

const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
const decode = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

function validPin(pin: string) {
  return /^\d{6}$/.test(pin)
}

async function derive(pin: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS },
      material,
      256,
    ),
  )
}

export async function createPinRecord(pin: string): Promise<PinRecord> {
  if (!validPin(pin)) throw new Error('PIN은 숫자 6자리로 입력해 주세요.')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { version: 1, salt: encode(salt), hash: encode(await derive(pin, salt)) }
}

export async function verifyPinRecord(record: PinRecord, pin: string): Promise<boolean> {
  if (!validPin(pin)) return false
  try {
    const expected = decode(record.hash)
    const actual = await derive(pin, decode(record.salt))
    if (expected.length !== actual.length) return false
    let difference = 0
    for (let index = 0; index < actual.length; index++) difference |= expected[index] ^ actual[index]
    return difference === 0
  } catch {
    return false
  }
}

export function readPinRecord(): PinRecord | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PIN_KEY) ?? 'null')
    if (
      typeof value === 'object' &&
      value !== null &&
      'version' in value &&
      value.version === 1 &&
      'salt' in value &&
      typeof value.salt === 'string' &&
      'hash' in value &&
      typeof value.hash === 'string'
    ) {
      return value as PinRecord
    }
  } catch {
    // 손상된 설정은 PIN 없음으로 취급한다. 브라우저 저장소는 보안 경계가 아니다.
  }
  return null
}
