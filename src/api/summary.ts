import { COPY } from '../copy'
import { getInstallationId } from './installation'
import { mockSummarize } from './mockSummary'
import { REQUEST_TIMEOUT_MS, type SummaryErrorCode, type SummaryRequest, type SummaryResponse } from './types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_SUMMARY === 'true'
const BASE = import.meta.env.VITE_API_BASE ?? '' // 비우면 vite 프록시(/api → localhost:8080)

export class SummaryError extends Error {
  code: SummaryErrorCode
  status?: number
  constructor(code: SummaryErrorCode, message: string, status?: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

/** 사용자가 취소 버튼을 누른 경우 */
export const isCancel = (e: unknown) =>
  e instanceof DOMException && e.name === 'AbortError' && !(e instanceof SummaryError)

export async function requestSummary(req: SummaryRequest, signal?: AbortSignal): Promise<SummaryResponse> {
  if (USE_MOCK) return mockSummarize(req, signal)

  // 25초 타임아웃 + 사용자 취소를 하나의 컨트롤러로 묶는다
  const ctrl = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    ctrl.abort()
  }, REQUEST_TIMEOUT_MS)
  signal?.addEventListener('abort', () => ctrl.abort())

  try {
    const res = await fetch(`${BASE}/api/v1/summaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Installation-Id': getInstallationId() },
      body: JSON.stringify(req),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new SummaryError(
        (err.code as SummaryErrorCode) ?? 'UNKNOWN',
        err.detail ?? '요약 실패',
        res.status,
      )
    }
    return (await res.json()) as SummaryResponse
  } catch (e) {
    if (e instanceof SummaryError) throw e
    if (timedOut) throw new SummaryError('TIMEOUT', COPY.summaryOffline)
    if (e instanceof DOMException && e.name === 'AbortError') throw e // 사용자 취소
    throw new SummaryError('NETWORK', COPY.summaryOffline)
  } finally {
    clearTimeout(timer)
  }
}

export interface ErrorInfo {
  message: string
  /** 요약 불가 + 원문 목록 보기 버튼을 보여줄지 */
  showOriginals: boolean
}

/** 사용자에게 보여줄 문구. 서버 detail 대신 앱 문구를 쓴다 */
export function errorInfo(e: unknown): ErrorInfo {
  const code = e instanceof SummaryError ? e.code : 'UNKNOWN'
  switch (code) {
    case 'TOO_MANY_ITEMS':
      return { message: '글이 너무 많아요. 기간을 줄여 주세요.', showOriginals: false }
    case 'DAILY_LIMIT_EXCEEDED':
      return { message: '오늘 쓸 수 있는 요약 횟수를 모두 썼어요.', showOriginals: true }
    case 'SUMMARY_UNAVAILABLE':
    case 'NETWORK':
    case 'TIMEOUT':
      return { message: COPY.summaryOffline, showOriginals: true }
    default:
      // 400대는 개발 중 실수. 사용자에게는 같은 안내를 보이고 콘솔에 남긴다
      console.error('[summary]', e)
      return { message: COPY.summaryOffline, showOriginals: true }
  }
}

/** F-05-2i 같은 범위는 기기 캐시(메모리)를 다시 쓴다. 요청 내용이 바뀌면 키가 달라져 자동으로 버려진다 */
const cache = new Map<string, SummaryResponse>()
export const summaryCache = {
  get: (req: SummaryRequest) => cache.get(JSON.stringify(req)),
  set: (req: SummaryRequest, res: SummaryResponse) => void cache.set(JSON.stringify(req), res),
  /** AI 요약을 끄면 즉시 지운다 (F-05-1e) */
  clear: () => cache.clear(),
}
