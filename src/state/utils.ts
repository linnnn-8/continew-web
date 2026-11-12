export const nowIso = () => new Date().toISOString()

export const newId = (prefix: string) =>
  `${prefix}_${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`

const DAY = ['일', '월', '화', '수', '목', '금', '토']

// 예: 11/13(금) 오후 2시
export function formatKoDateTime(iso: string, withTime = true) {
  const d = new Date(iso)
  const date = `${d.getMonth() + 1}/${d.getDate()}(${DAY[d.getDay()]})`
  if (!withTime) return date
  const h = d.getHours()
  const m = d.getMinutes()
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${date} ${ampm} ${h12}시${m ? ` ${m}분` : ''}`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 기기 시간대 오프셋을 붙인 ISO. 예: 2026-11-12T15:00:00+09:00 (API는 오프셋 포함 ISO를 요구) */
export function toOffsetIso(input: string | Date) {
  const d = new Date(input)
  const off = -d.getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const abs = Math.abs(off)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

/** 기기 시간대 기준 날짜·시각 조각 (목 요약 등에서 사용) */
export function localParts(iso: string) {
  const d = new Date(iso)
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

/** 'YYYY-MM-DD' (+ 'HH:mm') → '11/13(금) 오후 2시'. new Date('YYYY-MM-DD')는 UTC로 읽히므로 직접 쪼갠다 */
export function formatYmd(ymd: string, time?: string | null) {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const base = `${m}/${d}(${DAY[date.getDay()]})`
  if (!time) return base
  const [hh, mm] = time.split(':').map(Number)
  const ampm = hh < 12 ? '오전' : '오후'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${base} ${ampm} ${h12}시${mm ? ` ${mm}분` : ''}`
}

/** '오전 10:00' / '오후 4:00' */
export function formatTime(iso: string) {
  const d = new Date(iso)
  const h = d.getHours()
  return `${h < 12 ? '오전' : '오후'} ${h % 12 === 0 ? 12 : h % 12}:${pad(d.getMinutes())}`
}

/** 날짜 타일용 조각: 11월 / 14 / (토) */
export function dateTileParts(iso: string) {
  const d = new Date(iso)
  return { month: `${d.getMonth() + 1}월`, day: String(d.getDate()), dow: `(${DAY[d.getDay()]})` }
}

/** 11월 12일 (목) */
export function formatLongDate(d = new Date()) {
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY[d.getDay()]})`
}

/** 마감 11/15(일) */
export function formatShortDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}(${DAY[d.getDay()]})`
}
