import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import { summaryCache } from '../api/summary'
import { makeSeed } from '../mocks/seed'
import { isAppState } from '../security/backup'
import { reducer, type Action, type AppState } from './reducer'

// 연동 전: 브라우저 localStorage에 저장한다. 서버 연동 시 이 파일만 바꾸면 된다.
const KEY = 'continew:v2'
const READ_WARNING = '저장된 기록을 읽지 못했습니다. 기존 데이터를 덮어쓰지 않도록 자동 저장을 멈췄어요.'
const WRITE_WARNING =
  '변경 내용을 이 기기에 저장하지 못했습니다. 저장 공간을 확인하고 백업 파일을 만들어 주세요.'

interface LoadedState {
  state: AppState
  warning: string | null
  canSave: boolean
}

/** 앱을 열 때 공간을 자동으로 선택하지 않는다. */
function entry(s: AppState): AppState {
  return { ...s, currentSpaceId: null }
}

export function loadFromRaw(raw: string | null): LoadedState {
  try {
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw)
      if (!isAppState(parsed)) throw new Error('저장된 기록의 형식이 올바르지 않습니다.')
      return { state: entry(parsed), warning: null, canSave: true }
    }
    return { state: entry(makeSeed()), warning: null, canSave: true }
  } catch {
    return { state: entry(makeSeed()), warning: READ_WARNING, canSave: false }
  }
}

function load(): LoadedState {
  try {
    return loadFromRaw(localStorage.getItem(KEY))
  } catch {
    return { state: entry(makeSeed()), warning: READ_WARNING, canSave: false }
  }
}

interface Store {
  state: AppState
  dispatch: Dispatch<Action>
  currentSpace: AppState['spaces'][number] | null
}
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(load)
  const [state, dispatch] = useReducer(reducer, loaded.state)
  const [storageWarning, setStorageWarning] = useState<string | null>(loaded.warning)
  useEffect(() => {
    if (!loaded.canSave) return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
      setStorageWarning(null)
    } catch {
      setStorageWarning(WRITE_WARNING)
    }
  }, [state, loaded.canSave])
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
  return (
    <Ctx.Provider value={value}>
      {children}
      {storageWarning && (
        <p className="storage-warning" role="alert">
          {storageWarning}
        </p>
      )}
    </Ctx.Provider>
  )
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
