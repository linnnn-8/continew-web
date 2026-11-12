import BackupPanel from '../components/BackupPanel'

// SCR-09 설정 · 우선 기기 변경용 백업과 복원을 제공한다.
export default function SettingsScreen() {
  return (
    <div className="page page-settings">
      <h1>설정</h1>
      <BackupPanel />
    </div>
  )
}
