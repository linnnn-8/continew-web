import { ChevronLeft, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ScopeBadge } from '../components/common'
import { useStore } from '../state/store'

export default function MemoEditorScreen() {
  const { id } = useParams()
  const { state, currentSpace, dispatch } = useStore()
  const nav = useNavigate()
  const memo = state.memos.find((item) => item.id === id && item.spaceId === currentSpace?.id && !item.deletedAt)
  const [body, setBody] = useState(memo?.body ?? '')
  if (!currentSpace) return <Navigate to="/spaces" replace />
  if (id !== 'new' && !memo) return <Navigate to="/home" replace />

  const save = () => {
    if (!body.trim()) return
    dispatch(id === 'new' ? { type: 'ADD_MEMO', body: body.trim() } : { type: 'UPDATE_MEMO', id: id!, body: body.trim() })
    nav('/home')
  }
  return (
    <div className="page editor-page">
      <button className="back" onClick={() => nav('/home')}><ChevronLeft size={20} aria-hidden /> 내 공간</button>
      <h1>{id === 'new' ? '메모 추가' : '메모 보기·수정'}</h1>
      <ScopeBadge scope="personal" />
      <p className="sub">{currentSpace.name} 공간에만 저장돼요.</p>
      <label className="form-label" htmlFor="memo-body">메모 내용</label>
      <textarea id="memo-body" className="form-input memo-input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="기억하고 싶은 내용을 적어 주세요." autoFocus />
      <button className="btn btn-primary wide" disabled={!body.trim()} onClick={save}>메모 저장</button>
      {memo && <>
        <button className="btn btn-ghost wide" disabled={!body.trim()} onClick={() => {
          if (body.trim() !== memo.body) dispatch({ type: 'UPDATE_MEMO', id: memo.id, body: body.trim() })
          nav(`/share?memo=${encodeURIComponent(memo.id)}`)
        }}><Share2 size={17} aria-hidden /> 공용 게시판에 공유하기</button>
        <button className="editor-delete" onClick={() => { if (window.confirm('이 메모를 삭제할까요?')) { dispatch({ type: 'DELETE_MEMO', id: memo.id }); nav('/home') } }}><Trash2 size={16} aria-hidden /> 메모 삭제</button>
      </>}
    </div>
  )
}
