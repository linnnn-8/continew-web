import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

// ⑤ 공간 관리 — 아직 구현하지 않음 (공간 추가·수정·삭제, 이름·아이콘·색상·배경, 순서 변경)
export default function SpaceManageScreen() {
  return (
    <main className="scroll page">
      <div className="select-top">
        <Link to="/spaces" className="back">
          <ChevronLeft size={20} aria-hidden />
          공간 선택
        </Link>
      </div>
      <h1>공간 관리</h1>
      <p className="sub">아직 만들지 않은 화면이에요. (F-01-1 ~ F-01-7)</p>
    </main>
  )
}
