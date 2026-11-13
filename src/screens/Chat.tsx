import { Check, ChevronDown, Send } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sheet from '../components/Sheet'
import { visibleSpaces } from '../state/selectors'
import { useStore } from '../state/store'
import { ANONYMOUS_LABEL } from '../types/model'

const time = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(new Date(value))

const authorTone = (label: string) =>
  Array.from(label).reduce((hash, char) => hash + char.codePointAt(0)!, 0) % 4

/** 열린 공간을 기본 작성자로 보여 주고, 전송 전 다른 표기로 바꿀 수 있다. */
export default function ChatScreen() {
  const { state, dispatch, currentSpace } = useStore()
  const [authorChoice, setAuthorChoice] = useState<{ spaceId: string | null; label: string } | null>(null)
  const spaceId = currentSpace?.id ?? null
  const authorLabel = authorChoice?.spaceId === spaceId ? authorChoice.label : (currentSpace?.name ?? '')
  const [body, setBody] = useState('')
  const [authorOpen, setAuthorOpen] = useState(false)
  const [params] = useSearchParams()
  const focusMessage = params.get('message')
  const messages = state.messages.filter((message) => !message.deletedAt)
  const listRef = useRef<HTMLUListElement>(null)
  const scrollAfterSend = useRef(false)

  useEffect(() => {
    if (!scrollAfterSend.current) return
    scrollAfterSend.current = false
    const list = listRef.current
    if (!list) return
    const frame = requestAnimationFrame(() => {
      list.scrollTo({
        top: list.scrollHeight,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [messages.length])

  useEffect(() => {
    if (!focusMessage) return
    const frame = requestAnimationFrame(() =>
      document.getElementById(`message-${focusMessage}`)?.scrollIntoView({ block: 'center' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [focusMessage])

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!authorLabel || !body.trim()) return
    scrollAfterSend.current = true
    dispatch({ type: 'SEND_MESSAGE', authorLabel, body: body.trim() })
    setBody('')
  }

  return (
    <div className="page page-chat">
      <div className="chat-head">
        <h1>대화</h1>
        <p className="sub">공간을 넘어 자유롭게 이야기해요.</p>
      </div>

      <ul className="chat-list" aria-label="공용 대화" ref={listRef}>
        {messages.map((message) => (
          <li
            className={`chat-message chat-tone-${authorTone(message.authorLabel)}${message.id === focusMessage ? ' is-target' : ''}`}
            id={`message-${message.id}`}
            key={message.id}
          >
            <span className="chat-avatar" aria-hidden>
              {message.authorLabel.slice(0, 1)}
            </span>
            <div className="chat-content">
              <div className="chat-meta">
                <strong>{message.authorLabel}</strong>
                <time dateTime={message.createdAt}>{time(message.createdAt)}</time>
              </div>
              <p className="chat-bubble">{message.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <form className="chat-compose" onSubmit={send}>
        <div className="chat-author-row">
          <span className="chat-author-label">작성자</span>
          <button type="button" className="chat-author-button" onClick={() => setAuthorOpen(true)}>
            <span>{authorLabel || '선택해 주세요'}</span>
            <ChevronDown size={15} aria-hidden />
          </button>
        </div>
        <div className="chat-input-row">
          <input
            aria-label="메시지"
            placeholder="메시지를 입력하세요..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={5000}
          />
          <button type="submit" aria-label="메시지 보내기" disabled={!authorLabel || !body.trim()}>
            <Send size={18} aria-hidden />
          </button>
        </div>
      </form>
      <Sheet open={authorOpen} onClose={() => setAuthorOpen(false)} title="작성자 표기">
        <p className="sheet-note">이 메시지에 표시할 이름을 선택해 주세요.</p>
        <ul className="switch-list">
          {[...visibleSpaces(state).map((space) => space.name), ANONYMOUS_LABEL].map((label) => (
            <li key={label}>
              <button
                className="switch-item"
                onClick={() => {
                  setAuthorChoice({ spaceId, label })
                  setAuthorOpen(false)
                }}
              >
                <span className="switch-name">{label}</span>
                {label === authorLabel && <Check size={18} aria-label="선택됨" />}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  )
}
