import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { summaryCache } from '../api/summary'
import { makeSeed } from '../mocks/seed'
import { reducer, type Action, type AppState } from './reducer'

// 연동 전: 브라우저 localStorage에 저장한다. 서버 연동 시 이 파일만 바꾸면 된다.
const KEY = 'continew:v2'

/** 앱을 열 때 마지막 공간을 자동으로 열지 않는다. 공간이 하나뿐일 때만 바로 연다 (F-01, 원칙2) */
function entry(s: AppState): AppState {
  const visible = s.spaces.filter((x) => !x.hidden && !x.deletedAt)
  return { ...s, currentSpaceId: visible.length === 1 ? visible[0].id : null }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return entry(JSON.parse(raw) as AppState)
  } catch {
    /* 저장소를 못 읽으면 시드로 시작 */
  }
  return entry(makeSeed())
}

interface Store {
  state: AppState
  dispatch: Dispatch<Action>
  currentSpace: AppState['spaces'][number] | null
}
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [state])
  useEffect(() => {
    if (!state.settings.aiSummaryEnabled) summaryCache.clear() // F-05-1e
  }, [state.settings.aiSummaryEnabled])
  const value = useMemo<Store>(
    () => ({
      state,
      dispatch,
      currentSpace: state.spaces.find((s) => s.id === state.currentSpaceId) ?? null,
    }),
    [state],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('StoreProvider 안에서만 쓸 수 있어요')
  return v
}

/** 개발 중 데이터 초기화용 */
export function resetLocalData() {
  localStorage.removeItem(KEY)
  location.reload()
}
