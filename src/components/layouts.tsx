import { Home, MessageCircle, Settings, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import Logo from './Logo'
import SpacePill from './SpacePill'

/** 폰 크기(390×844) 프레임. 잠금·공간 선택처럼 탭이 없는 화면에 쓴다 */
export function FrameLayout() {
  return (
    <div className="frame">
      <Outlet />
    </div>
  )
}

const TABS = [
  { to: '/home', label: '내 공간', Icon: Home },
  { to: '/board', label: '공용', Icon: Users },
  { to: '/chat', label: '대화', Icon: MessageCircle },
  { to: '/settings', label: '설정', Icon: Settings },
]

/** 상단 로고 + 공간 표시, 하단 탭 4개 (내 공간 · 공유 게시판 · 대화 · 설정) */
export function TabLayout() {
  return (
    <div className="frame">
      <header className="app-header">
        <Logo />
        <SpacePill />
      </header>
      <main className="scroll">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="하단 탭">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `tab${isActive ? ' on' : ''}`}>
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.3 : 1.9}
                  fill={isActive ? 'currentColor' : 'none'}
                  aria-hidden
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
