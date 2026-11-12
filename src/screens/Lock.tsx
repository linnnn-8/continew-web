import { useState, type FormEvent } from 'react'
import Logo from '../components/Logo'
import { useLock } from '../security/LockProvider'

/** 웹 시제품의 PIN 화면. 브라우저 저장 데이터 암호화나 생체인증은 제공하지 않는다. */
export default function LockScreen() {
  const { status, hasPin, setPin, verify, skip, lock } = useLock()
  const [pin, updatePin] = useState('')
  const [again, updateAgain] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const setup = status === 'setup' || (status === 'open' && !hasPin)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!/^\d{6}$/.test(pin)) return setError('숫자 6자리를 입력해 주세요.')
    if (setup && pin !== again) return setError('두 PIN이 서로 다릅니다.')
    setBusy(true)
    try {
      if (setup) await setPin(pin)
      else if (!(await verify(pin))) setError('PIN이 맞지 않습니다.')
      updatePin('')
      updateAgain('')
    } catch {
      setError('잠금 설정을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="scroll lock-page">
      <Logo />
      {status === 'open' && hasPin ? (
        <section>
          <h1>앱 잠금</h1>
          <p className="sub">PIN이 설정되어 있습니다.</p>
          <button className="btn btn-primary wide" onClick={lock}>
            지금 잠그기
          </button>
        </section>
      ) : (
        <section>
          <h1>{setup ? '앱을 잠가둘까요?' : 'PIN을 입력해 주세요'}</h1>
          <p className="sub">
            {setup ? '숫자 6자리로 앱 화면을 잠글 수 있어요.' : '기록을 보려면 설정한 PIN을 입력해 주세요.'}
          </p>
          <form onSubmit={submit}>
            <label htmlFor="pin-input">6자리 PIN</label>
            <input
              id="pin-input"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]{6}"
              maxLength={6}
              value={pin}
              onChange={(event) => updatePin(event.target.value.replace(/\D/g, ''))}
            />
            {setup && (
              <>
                <label htmlFor="pin-again">PIN 다시 입력</label>
                <input
                  id="pin-again"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={again}
                  onChange={(event) => updateAgain(event.target.value.replace(/\D/g, ''))}
                />
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="btn btn-primary wide"
              disabled={busy || pin.length !== 6 || (setup && again.length !== 6)}
            >
              {setup ? 'PIN 설정하기' : '잠금 해제'}
            </button>
          </form>
          {setup && (
            <button className="link-btn" type="button" onClick={skip}>
              나중에 설정하기
            </button>
          )}
          <p className="notice">
            이 웹 시제품의 PIN은 화면을 가리는 기능입니다. 기기에 저장된 기록을 암호화하지는 않습니다. PIN을
            잊었을 때 이 웹 버전에는 재설정 수단이 없습니다.
          </p>
        </section>
      )}
    </main>
  )
}
