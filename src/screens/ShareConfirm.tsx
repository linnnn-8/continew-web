import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ScopeBadge } from '../components/common'
import { useStore } from '../state/store'
import type { PostType } from '../types/model'

const TYPES: { value: PostType; label: string }[] = [
  { value: 'note', label: '게시글' }, { value: 'event', label: '일정' },
  { value: 'todo', label: '할 일' }, { value: 'caution', label: '주의사항' },
]

export default function ShareConfirmScreen() {
  const { state, currentSpace, dispatch } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const memo = state.memos.find((m) => m.id === params.get('memo') && m.spaceId === currentSpace?.id && !m.deletedAt)
  const requestedType = params.get('type')
  const [type, setType] = useState<PostType>(TYPES.some((t) => t.value === requestedType) ? requestedType as PostType : 'note')
  const [title, setTitle] = useState(memo?.body.split('\n')[0] ?? '')
  const [body, setBody] = useState(memo?.body ?? '')
  const [eventAt, setEventAt] = useState('')
  const [authorLabel, setAuthorLabel] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const valid = title.trim() && body.trim() && authorLabel && confirmed && (type !== 'event' || eventAt)
  return <div className="page editor-page">
    <button className="back" onClick={() => nav(memo ? `/memo/${memo.id}` : '/board')}><ChevronLeft size={20} aria-hidden /> 돌아가기</button>
    <h1>공용에 공유하기</h1>
    <ScopeBadge scope="shared" />
    <p className="sub">게시하면 모든 공간에서 볼 수 있어요. 원본 메모는 현재 공간에 남아요.</p>
    <label className="form-label" htmlFor="share-type">유형</label>
    <select id="share-type" className="form-input" value={type} onChange={(e) => setType(e.target.value as PostType)}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
    <label className="form-label" htmlFor="share-title">제목</label>
    <input id="share-title" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
    <label className="form-label" htmlFor="share-body">내용</label>
    <textarea id="share-body" className="form-input memo-input" value={body} onChange={(e) => setBody(e.target.value)} />
    {type === 'event' && <><label className="form-label" htmlFor="share-date">날짜와 시간</label><input id="share-date" type="datetime-local" className="form-input" value={eventAt} onChange={(e) => setEventAt(e.target.value)} /></>}
    <label className="form-label" htmlFor="share-author">작성자 표기</label>
    <select id="share-author" className="form-input" value={authorLabel} onChange={(e) => setAuthorLabel(e.target.value)}><option value="">선택해 주세요</option><option value="이름 없이">이름 없이</option>{currentSpace && <option value={currentSpace.name}>{currentSpace.name}</option>}</select>
    <label className="share-consent"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> 이 내용을 공용 게시판에 공개하는 데 동의해요.</label>
    <button className="btn btn-primary wide" disabled={!valid} onClick={() => { if (!valid) return; dispatch({ type: 'PUBLISH_POST', draft: { type, title: title.trim(), body: body.trim(), eventAt: type === 'event' ? new Date(eventAt).toISOString() : undefined, authorLabel, confirmRequested: false, origin: memo ? 'memo' : 'manual', fromMemoId: memo?.id } }); nav('/board') }}>공용 게시판에 올리기</button>
  </div>
}
