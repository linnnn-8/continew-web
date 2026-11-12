import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FrameLayout, TabLayout } from './components/layouts'
import { StoreProvider, useStore } from './state/store'
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

/** 앱을 열면 공간 선택으로. 공간이 하나뿐이면 바로 연다 (store가 그 경우에만 공간을 열어 둔다) */
function Entry() {
  const { currentSpace } = useStore()
  return <Navigate to={currentSpace ? '/home' : '/spaces'} replace />
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </StoreProvider>
  )
}
