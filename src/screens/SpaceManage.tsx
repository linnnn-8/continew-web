import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SPACE_ICONS, SpaceIcon } from '../components/icons'
import { SPACE_COLORS } from '../styles/palette'
import { useStore } from '../state/store'

export default function SpaceManageScreen() {
  const { state, dispatch } = useStore()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('cloud')
  const [color, setColor] = useState<string>(SPACE_COLORS[0])
  const trimmed = name.trim()
  const duplicate = state.spaces.some((s) => !s.deletedAt && s.name === trimmed)
  const valid = trimmed.length >= 1 && trimmed.length <= 20 && !duplicate
  return (
    <main className="scroll page editor-page">
      <Link to="/spaces" className="back"><ChevronLeft size={20} aria-hidden /> 공간 선택</Link>
      <h1>새 공간 만들기</h1>
      <p className="sub">목적에 맞게 이름과 모습을 정해 주세요.</p>
      <label className="form-label" htmlFor="space-name">공간 이름 <small>1~20자</small></label>
      <input id="space-name" className="form-input" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 공부" autoFocus />
      {duplicate && <p className="form-error" role="alert">이미 사용 중인 공간 이름이에요.</p>}
      <label className="form-label" htmlFor="space-description">한 줄 설명 <small>선택</small></label>
      <input id="space-description" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="이 공간에서 할 일을 적어 주세요." />
      <span className="form-label" id="space-icon-label">아이콘</span>
      <div className="choice-grid" role="group" aria-labelledby="space-icon-label">
        {Object.keys(SPACE_ICONS).map((key) => <button key={key} type="button" className={`choice-icon${icon === key ? ' selected' : ''}`} aria-label={`${key} 아이콘`} aria-pressed={icon === key} onClick={() => setIcon(key)}><SpaceIcon name={key} /></button>)}
      </div>
      <span className="form-label" id="space-color-label">색상</span>
      <div className="choice-grid" role="group" aria-labelledby="space-color-label">
        {SPACE_COLORS.map((value) => <button key={value} type="button" className={`choice-color${color === value ? ' selected' : ''}`} style={{ background: value }} aria-label={`${value} 색상`} aria-pressed={color === value} onClick={() => setColor(value)} />)}
      </div>
      <button className="btn btn-primary wide" disabled={!valid} onClick={() => { dispatch({ type: 'ADD_SPACE', name: trimmed, description: description.trim(), icon, color }); nav('/spaces') }}>공간 만들기</button>
    </main>
  )
}
