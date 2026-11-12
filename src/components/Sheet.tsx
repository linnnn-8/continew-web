import { useEffect, type ReactNode } from 'react'

/** 하단 시트. 폰 프레임(.frame) 안에서만 뜬다 */
export default function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="sheet-wrap">
      <button className="sheet-backdrop" aria-label="닫기" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grip" />
        <h3 className="sheet-title">{title}</h3>
        {children}
      </div>
    </div>
  )
}
