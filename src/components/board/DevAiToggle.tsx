import { useStore } from '../../state/store'

/** 개발용. AI 요약 설정·동의 화면(F-05-1)이 생기면 지운다 */
export default function DevAiToggle() {
  const { state, dispatch } = useStore()
  const on = state.settings.aiSummaryEnabled
  return (
    <div className="dev-box">
      <span>개발용 · AI 요약 {on ? '켜짐' : '꺼짐(동의 전)'}</span>
      <button className="mini mini-ghost" onClick={() => dispatch({ type: 'SET_AI', enabled: !on })}>
        {on ? '끄기' : '켜기'}
      </button>
    </div>
  )
}
