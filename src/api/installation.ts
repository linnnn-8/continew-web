// 앱 설치마다 한 번 만드는 익명 id. 하루 요청 상한 계산에만 쓰인다.
const KEY = 'continew:installation'
let memoryFallback: string | null = null

export function getInstallationId(): string {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return saved
    const id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
    return id
  } catch {
    memoryFallback ??= crypto.randomUUID()
    return memoryFallback
  }
}
