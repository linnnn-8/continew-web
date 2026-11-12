import BackupPanel from '../components/BackupPanel'
import { Link } from 'react-router-dom'
import { useLock } from '../security/LockProvider'

// SCR-09 설정 · 우선 기기 변경용 백업과 복원을 제공한다.
export default function SettingsScreen() {
  const { hasPin, delay, setDelay, lock } = useLock()
  return (
    <div className="page page-settings">
      <h1>설정</h1>
      <section className="settings-section">
        <h2>앱 잠금</h2>
        <p className="sub">PIN은 앱 화면만 잠급니다. 브라우저에 저장된 기록은 암호화되지 않습니다.</p>
        {hasPin ? (
          <>
            <label className="backup-pin-label" htmlFor="lock-delay">
              앱을 벗어난 뒤 잠금
            </label>
            <select
              id="lock-delay"
              className="settings-select"
              value={delay}
              onChange={(event) => setDelay(event.target.value as typeof delay)}
            >
              <option value="instant">즉시</option>
              <option value="1m">1분 후</option>
              <option value="5m">5분 후</option>
            </select>
            <button className="btn btn-ghost wide" onClick={lock}>
              지금 잠그기
            </button>
          </>
        ) : (
          <Link className="btn btn-ghost wide settings-link" to="/lock">
            PIN 설정하기
          </Link>
        )}
      </section>
      <BackupPanel />
    </div>
  )
}
