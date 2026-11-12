import type { ReactNode } from 'react'

// 안내 문구 박스 (공간 구분 안내, AI 요약 안내 등)
export default function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="notice" role="note">
      {children}
    </p>
  )
}
