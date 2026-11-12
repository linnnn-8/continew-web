import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  createPinRecord,
  DELAY_KEY,
  PIN_KEY,
  readPinRecord,
  SKIP_KEY,
  verifyPinRecord,
  type LockDelay,
} from './pin'

type LockStatus = 'setup' | 'locked' | 'open'
interface LockContextValue {
  status: LockStatus
  hasPin: boolean
  delay: LockDelay
  setPin: (pin: string) => Promise<void>
  verify: (pin: string) => Promise<boolean>
  skip: () => void
  lock: () => void
  setDelay: (delay: LockDelay) => void
}

const Context = createContext<LockContextValue | null>(null)

function initialStatus(): LockStatus {
  if (readPinRecord()) return 'locked'
  return localStorage.getItem(SKIP_KEY) === 'true' ? 'open' : 'setup'
}

export function LockProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LockStatus>(initialStatus)
  const [hasPin, setHasPin] = useState(() => !!readPinRecord())
  const [delay, updateDelay] = useState<LockDelay>(() => {
    const saved = localStorage.getItem(DELAY_KEY)
    return saved === 'instant' || saved === '5m' ? saved : '1m'
  })

  useEffect(() => {
    let hiddenAt: number | null = null
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now()
      else if (hiddenAt !== null && hasPin) {
        const threshold = delay === 'instant' ? 0 : delay === '1m' ? 60_000 : 300_000
        if (Date.now() - hiddenAt >= threshold) setStatus('locked')
        hiddenAt = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [hasPin, delay])

  async function setPin(pin: string) {
    const record = await createPinRecord(pin)
    localStorage.setItem(PIN_KEY, JSON.stringify(record))
    localStorage.removeItem(SKIP_KEY)
    setHasPin(true)
    setStatus('open')
  }

  async function verify(pin: string) {
    const record = readPinRecord()
    const valid = record ? await verifyPinRecord(record, pin) : false
    if (valid) setStatus('open')
    return valid
  }

  function skip() {
    localStorage.setItem(SKIP_KEY, 'true')
    setStatus('open')
  }

  function setDelay(value: LockDelay) {
    localStorage.setItem(DELAY_KEY, value)
    updateDelay(value)
  }

  return (
    <Context.Provider
      value={{
        status,
        hasPin,
        delay,
        setPin,
        verify,
        skip,
        lock: () => hasPin && setStatus('locked'),
        setDelay,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export function useLock() {
  const context = useContext(Context)
  if (!context) throw new Error('LockProvider가 필요합니다.')
  return context
}
