/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true'면 서버 없이 가짜 요약 응답을 쓴다 */
  readonly VITE_USE_MOCK_SUMMARY?: string
  /** 비우면 vite 프록시(/api)를 쓴다. 예: http://192.168.0.10:8080 */
  readonly VITE_API_BASE?: string
}
