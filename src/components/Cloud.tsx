/** 제목 옆의 은은한 원 장식. double은 넓은 화면용 크기 차이만 둔다. */
export default function Cloud({ double = false, size = 120 }: { double?: boolean; size?: number }) {
  return (
    <svg className="cloud" viewBox="0 0 140 100" width={size} height={(size * 100) / 140} aria-hidden>
      <circle cx="92" cy={double ? 47 : 43} r="29" fill="#fbeef2" />
      <circle cx="57" cy={double ? 69 : 65} r="25" fill="#f8dce8" />
    </svg>
  )
}
