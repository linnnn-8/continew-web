import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FrameLayout, TabLayout } from './components/layouts'
import { StoreProvider } from './state/store'
import { LockProvider, useLock } from './security/LockProvider'
import Board from './screens/Board'
import Chat from './screens/Chat'
import Lock from './screens/Lock'
import MemoEditor from './screens/MemoEditor'
import Settings from './screens/Settings'
import ShareConfirm from './screens/ShareConfirm'
import SpaceHome from './screens/SpaceHome'
import SpaceManage from './screens/SpaceManage'
import SpaceSelect from './screens/SpaceSelect'
import SummaryResult from './screens/SummaryResult'

/** 앱을 열면 항상 공간 선택 화면에서 시작한다. */
function Entry() {
  return <Navigate to="/spaces" replace />
}

function AppRoutes() {
  const { status } = useLock()
  if (status !== 'open')
    return (
      <div className="frame">
        <Lock />
      </div>
    )
  return (
    <Routes>
      <Route path="/" element={<Entry />} />
      <Route element={<FrameLayout />}>
        <Route path="/lock" element={<Lock />} />
        <Route path="/spaces" element={<SpaceSelect />} />
        <Route path="/spaces/manage" element={<SpaceManage />} />
      </Route>
      <Route element={<TabLayout />}>
        <Route path="/home" element={<SpaceHome />} />
        <Route path="/memo/:id" element={<MemoEditor />} />
        <Route path="/share" element={<ShareConfirm />} />
        <Route path="/board" element={<Board />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/summary" element={<SummaryResult />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <LockProvider>
      <StoreProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppRoutes />
        </BrowserRouter>
      </StoreProvider>
    </LockProvider>
  )
}
