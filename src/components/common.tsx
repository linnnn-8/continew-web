import { ChevronRight, Lock, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { COPY } from '../copy'
import { dateTileParts } from '../state/utils'

/** 개인 기록(라벤더) / 공유 기록(베이지)을 구분하는 표시 */
export function ScopeBadge({ scope }: { scope: 'personal' | 'shared' }) {
  return scope === 'personal' ? (
    <span className="badge badge-personal">
      <Lock size={11} aria-hidden />
      {COPY.memoOnlyHere}
    </span>
  ) : (
    <span className="badge badge-shared">
      <Users size={11} aria-hidden />
      모든 공간에서 보임
    </span>
  )
}

export function SectionHead({
  title,
  badge,
  onMore,
}: {
  title: string
  badge?: ReactNode
  onMore?: () => void
}) {
  return (
    <div className="sec-head">
      <h3>{title}</h3>
      {badge}
      {onMore && (
        <button className="sec-more" onClick={onMore}>
          전체 보기
          <ChevronRight size={14} aria-hidden />
        </button>
      )}
    </div>
  )
}

export function DateTile({ iso, muted = false }: { iso: string; muted?: boolean }) {
  const p = dateTileParts(iso)
  return (
    <div className={`date-tile${muted ? ' muted' : ''}`} aria-hidden>
      <span className="dt-month">{p.month}</span>
      <span className="dt-day">{p.day}</span>
      <span className="dt-dow">{p.dow}</span>
    </div>
  )
}
