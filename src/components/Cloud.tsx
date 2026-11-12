function CloudBody({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g fill="#fff">
        <rect x="22" y="50" width="90" height="32" rx="16" />
        <circle cx="46" cy="50" r="20" />
        <circle cx="76" cy="40" r="27" />
        <circle cx="98" cy="56" r="16" />
      </g>
      <g stroke="#7c5ce0" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M56 62 q4 -6 8 0" />
        <path d="M82 62 q4 -6 8 0" />
        <path d="M68 70 q5 5 10 0" />
      </g>
      <circle cx="54" cy="70" r="4.5" fill="#f9c6d6" opacity=".8" />
      <circle cx="92" cy="70" r="4.5" fill="#f9c6d6" opacity=".8" />
    </g>
  )
}

/** 구름 캐릭터. double=true면 두 마리 (공용 영역) */
export default function Cloud({ double = false, size = 120 }: { double?: boolean; size?: number }) {
  return (
    <svg className="cloud" viewBox="0 0 140 100" width={size} height={(size * 100) / 140} aria-hidden>
      <g stroke="#a58cf0" strokeWidth="3" strokeLinecap="round">
        <path d="M108 12 L112 22" />
        <path d="M120 10 L126 18" />
        <path d="M128 24 L120 26" />
      </g>
      {double ? (
        <>
          <CloudBody x={-10} y={22} s={0.6} />
          <CloudBody x={36} y={4} s={0.8} />
        </>
      ) : (
        <CloudBody x={4} y={4} s={0.92} />
      )}
    </svg>
  )
}
