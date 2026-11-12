import { ANONYMOUS_LABEL } from '../types/model'
import type { SummaryResponse } from './types'

/**
 * F-05-6b 가명화·복원. 대응표는 요청마다 새로 만들고 기기 밖으로 내보내지 않는다.
 * 작성자 표기를 만난 순서대로 작성자1, 작성자2… 를 붙인다.
 */
export function createPseudonymizer() {
  const toAlias = new Map<string, string>()
  const toLabel = new Map<string, string>()
  return {
    /** '이름 없이'는 undefined를 돌려 author_label을 비운다 (F-05-2f) */
    alias(label: string): string | undefined {
      if (label === ANONYMOUS_LABEL) return undefined
      let a = toAlias.get(label)
      if (!a) {
        a = `작성자${toAlias.size + 1}`
        toAlias.set(label, a)
        toLabel.set(a, label)
      }
      return a
    },
    restore(alias: string): string {
      return toLabel.get(alias) ?? alias
    },
  }
}

export type Pseudonymizer = ReturnType<typeof createPseudonymizer>

/** 응답의 author_labels를 원래 표기로 되돌린다 */
export function restoreResponse(res: SummaryResponse, p: Pseudonymizer): SummaryResponse {
  return {
    ...res,
    conversation: res.conversation.map((c) => ({
      ...c,
      author_labels: c.author_labels.map((a) => p.restore(a)),
    })),
  }
}
