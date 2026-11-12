import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { buildSummaryRequest, type Target } from './buildRequest'
import { restoreResponse } from './pseudonym'
import { errorInfo, isCancel, requestSummary, summaryCache, type ErrorInfo } from './summary'
import { SLOW_AFTER_MS, type SummaryResponse } from './types'

export type SummaryPhase =
  | { kind: 'idle' }
  | { kind: 'loading'; slow: boolean } // slow=3초 초과: 진행 표시 + 취소 버튼
  | { kind: 'done'; result: SummaryResponse }
  | { kind: 'originals'; reason: 'few'; postIds: string[]; messageIds: string[] }
  | { kind: 'tooMany'; count: number }
  | { kind: 'error'; info: ErrorInfo }

/** SCR-08에서 쓰는 훅. 버튼 잠금(loading 동안 run 무시), 3초 후 취소 버튼, 캐시, 가명화·복원을 처리한다 */
export function useSummary() {
  const { state } = useStore()
  const [phase, setPhase] = useState<SummaryPhase>({ kind: 'idle' })
  const abortRef = useRef<AbortController | null>(null)
  const busy = useRef(false)

  useEffect(() => () => abortRef.current?.abort(), [])

  const run = useCallback(
    async (range: { from: Date; to: Date }, target: Target = 'both') => {
      if (!state.settings.aiSummaryEnabled || busy.current) return // 꺼져 있으면 요약하지 않는다 (F-05-1a)
      const built = buildSummaryRequest(state, { ...range, target })
      if (built.kind === 'few') {
        setPhase({ kind: 'originals', reason: 'few', postIds: built.postIds, messageIds: built.messageIds })
        return
      }
      if (built.kind === 'too_many') {
        setPhase({ kind: 'tooMany', count: built.count })
        return
      }
      const cached = summaryCache.get(built.request)
      if (cached) {
        setPhase({ kind: 'done', result: restoreResponse(cached, built.pseudonymizer) })
        return
      }

      busy.current = true
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setPhase({ kind: 'loading', slow: false })
      const slowTimer = setTimeout(
        () => setPhase((p) => (p.kind === 'loading' ? { ...p, slow: true } : p)),
        SLOW_AFTER_MS,
      )
      try {
        const res = await requestSummary(built.request, ctrl.signal)
        summaryCache.set(built.request, res)
        setPhase({ kind: 'done', result: restoreResponse(res, built.pseudonymizer) })
      } catch (e) {
        setPhase(isCancel(e) ? { kind: 'idle' } : { kind: 'error', info: errorInfo(e) })
      } finally {
        clearTimeout(slowTimer)
        busy.current = false
      }
    },
    [state],
  )

  const cancel = useCallback(() => abortRef.current?.abort(), [])
  const reset = useCallback(() => setPhase({ kind: 'idle' }), [])
  return { phase, run, cancel, reset, enabled: state.settings.aiSummaryEnabled }
}
