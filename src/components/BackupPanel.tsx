import { useState, type ChangeEvent } from 'react'
import { FileUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createBackup, readBackup } from '../security/backup'
import { useLock } from '../security/LockProvider'
import { useStore } from '../state/store'
import type { AppState } from '../state/reducer'

export default function BackupPanel() {
  const { state, dispatch } = useStore()
  const { hasPin, verify } = useLock()
  const navigate = useNavigate()
  const [exportPassword, setExportPassword] = useState('')
  const [exportAgain, setExportAgain] = useState('')
  const [importPassword, setImportPassword] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pending, setPending] = useState<AppState | null>(null)
  const [confirmation, setConfirmation] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function exportFile() {
    setMessage('')
    if (exportPassword !== exportAgain) return setMessage('비밀번호가 서로 다릅니다.')
    setBusy(true)
    try {
      if (hasPin && !(await verify(currentPin))) throw new Error('현재 앱 PIN이 맞지 않습니다.')
      const content = await createBackup(state, exportPassword)
      const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `continew-backup-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      setExportPassword('')
      setExportAgain('')
      setCurrentPin('')
      setMessage('암호화된 백업 파일 다운로드를 시작했습니다. 파일과 비밀번호를 각각 안전하게 보관해 주세요.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '백업 파일을 만들지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
    setPending(null)
    setConfirmation('')
    setMessage('')
  }

  async function inspectFile() {
    if (!file) return
    setBusy(true)
    setMessage('')
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('백업 파일이 너무 큽니다.')
      const restored = await readBackup(await file.text(), importPassword)
      setPending(restored)
      setImportPassword('')
    } catch (error) {
      setPending(null)
      setMessage(error instanceof Error ? error.message : '백업 파일을 열지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function restore() {
    if (!pending || confirmation !== '복원') return
    setBusy(true)
    try {
      if (hasPin && !(await verify(currentPin))) {
        setMessage('현재 앱 PIN이 맞지 않습니다.')
        return
      }
      dispatch({ type: 'RESTORE_BACKUP', state: pending })
      setPending(null)
      setConfirmation('')
      setFile(null)
      setCurrentPin('')
      navigate('/spaces')
    } catch {
      setMessage('복원하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="settings-section backup-panel">
      <h2>기기 변경용 백업</h2>
      <p className="sub">
        기록은 이 기기에 저장됩니다. 새 기기로 옮기려면 암호화된 파일을 직접 보관하고 복원해 주세요.
      </p>
      <p className="backup-hint">
        앱 PIN과 백업 비밀번호는 서로 달라요. 백업 비밀번호를 잊으면 파일을 열 수 없습니다.
      </p>
      {hasPin && (
        <>
          <label className="backup-pin-label" htmlFor="backup-current-pin">
            현재 앱 PIN · 백업 저장·복원 시 확인
          </label>
          <input
            className="backup-pin-input"
            id="backup-current-pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            autoComplete="off"
            value={currentPin}
            onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, ''))}
          />
        </>
      )}

      <div className="settings-group">
        <h3>백업 파일 만들기</h3>
        <p className="backup-hint">
          비밀번호를 정하고 저장하면 contiNEW 백업 파일(.json)이 다운로드돼요. 파일과 비밀번호를 각각 보관해
          주세요.
        </p>
        <label htmlFor="backup-password">백업 비밀번호 · 12자 이상</label>
        <input
          id="backup-password"
          type="password"
          autoComplete="new-password"
          value={exportPassword}
          onChange={(event) => setExportPassword(event.target.value)}
        />
        <label htmlFor="backup-again">비밀번호 다시 입력</label>
        <input
          id="backup-again"
          type="password"
          autoComplete="new-password"
          value={exportAgain}
          onChange={(event) => setExportAgain(event.target.value)}
        />
        <button
          className="btn btn-primary wide"
          type="button"
          disabled={busy || exportPassword.length < 12 || !exportAgain || (hasPin && currentPin.length !== 6)}
          onClick={exportFile}
        >
          암호화 백업 저장
        </button>
      </div>

      <div className="settings-group">
        <h3>백업 파일 복원</h3>
        <p className="backup-hint">
          새 기기에서 이전에 저장한 파일을 선택하고, 그때 정한 백업 비밀번호를 입력해 주세요.
        </p>
        <input
          id="backup-file"
          className="backup-file-input"
          type="file"
          accept=".json,application/json"
          onChange={chooseFile}
        />
        <label className="backup-file-picker" htmlFor="backup-file">
          <FileUp size={18} aria-hidden />
          백업 파일 선택
        </label>
        <span className="backup-file-name" aria-live="polite">
          {file?.name ?? '선택된 파일이 없어요'}
        </span>
        <label htmlFor="restore-password">백업 비밀번호</label>
        <input
          id="restore-password"
          type="password"
          autoComplete="off"
          value={importPassword}
          onChange={(event) => setImportPassword(event.target.value)}
        />
        <button
          className="btn btn-ghost wide"
          type="button"
          disabled={busy || !file || !importPassword}
          onClick={inspectFile}
        >
          파일 확인
        </button>
        {pending && (
          <div className="restore-confirm">
            <strong>
              복원할 내용: 공간 {pending.spaces.length}개 · 메모 {pending.memos.length}개
            </strong>
            <p>
              현재 기기의 모든 기록이 백업 파일 내용으로 바뀝니다. 되돌릴 수 없으니 현재 기록도 먼저 백업해
              주세요.
            </p>
            <label htmlFor="restore-confirmation">계속하려면 ‘복원’을 입력해 주세요</label>
            <input
              id="restore-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
            <button
              className="btn btn-danger wide"
              type="button"
              disabled={busy || confirmation !== '복원' || (hasPin && currentPin.length !== 6)}
              onClick={restore}
            >
              현재 기록 교체하고 복원
            </button>
          </div>
        )}
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
