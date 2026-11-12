import type { AppState } from '../state/reducer'

const FORMAT = 'continew-backup'
const VERSION = 1
const ITERATIONS = 310_000
const MAX_FILE_BYTES = 10 * 1024 * 1024

interface BackupFile {
  format: typeof FORMAT
  version: typeof VERSION
  iterations: number
  salt: string
  iv: string
  ciphertext: string
}

const encode = (bytes: Uint8Array) => {
  let binary = ''
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192))
  }
  return btoa(binary)
}
const decode = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

async function keyFor(password: string, salt: Uint8Array, iterations: number) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isText = (value: unknown) => typeof value === 'string'
const isOptionalText = (value: unknown) => value === undefined || isText(value)
const isNullableText = (value: unknown) => value === null || isText(value)
const isList = (value: unknown, check: (item: unknown) => boolean): value is unknown[] =>
  Array.isArray(value) && value.every(check)

function isSpace(value: unknown) {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isText(value.name) &&
    isText(value.color) &&
    typeof value.sortOrder === 'number' &&
    typeof value.hidden === 'boolean' &&
    typeof value.aiMemoEnabled === 'boolean' &&
    isNullableText(value.deletedAt) &&
    isList(
      value.homeWidgets,
      (widget) => isRecord(widget) && isText(widget.id) && typeof widget.visible === 'boolean',
    )
  )
}

function isMemo(value: unknown) {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isText(value.spaceId) &&
    isText(value.body) &&
    typeof value.pinned === 'boolean' &&
    isList(value.sharedPostIds, isText) &&
    isText(value.createdAt) &&
    isText(value.updatedAt) &&
    isNullableText(value.deletedAt)
  )
}

function isPost(value: unknown) {
  return (
    isRecord(value) &&
    isText(value.id) &&
    ['event', 'todo', 'caution', 'note'].includes(String(value.type)) &&
    isText(value.title) &&
    isText(value.body) &&
    isText(value.authorLabel) &&
    isText(value.createdAt) &&
    isText(value.updatedAt) &&
    isNullableText(value.deletedAt) &&
    typeof value.pinned === 'boolean' &&
    typeof value.confirmRequested === 'boolean' &&
    isOptionalText(value.eventAt) &&
    isOptionalText(value.dueAt)
  )
}

function isMessage(value: unknown) {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isText(value.body) &&
    isText(value.authorLabel) &&
    isText(value.createdAt) &&
    isNullableText(value.deletedAt)
  )
}

function isConfirmation(value: unknown) {
  return (
    isRecord(value) &&
    isText(value.id) &&
    ['post', 'message'].includes(String(value.targetType)) &&
    isText(value.targetId) &&
    isText(value.confirmedAt)
  )
}

/** 복원 전에 데이터 형태를 확인해 현재 기록이 잘못된 파일로 바뀌는 일을 막는다. */
export function isAppState(value: unknown): value is AppState {
  if (!isRecord(value) || !isRecord(value.settings) || !isRecord(value.boardViewed)) return false
  return (
    isList(value.spaces, isSpace) &&
    isList(value.memos, isMemo) &&
    isList(value.posts, isPost) &&
    isList(value.messages, isMessage) &&
    isList(value.confirmations, isConfirmation) &&
    Object.values(value.boardViewed).every(isText) &&
    isNullableText(value.currentSpaceId) &&
    typeof value.settings.aiSummaryEnabled === 'boolean' &&
    typeof value.settings.notifyPreview === 'boolean'
  )
}

export async function createBackup(state: AppState, password: string): Promise<string> {
  if (password.length < 12) throw new Error('백업 비밀번호는 12자 이상으로 설정해 주세요.')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await keyFor(password, salt, ITERATIONS)
  const plaintext = new TextEncoder().encode(JSON.stringify({ version: VERSION, state }))
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext))
  const file: BackupFile = {
    format: FORMAT,
    version: VERSION,
    iterations: ITERATIONS,
    salt: encode(salt),
    iv: encode(iv),
    ciphertext: encode(ciphertext),
  }
  return JSON.stringify(file)
}

export async function readBackup(fileText: string, password: string): Promise<AppState> {
  if (new TextEncoder().encode(fileText).byteLength > MAX_FILE_BYTES)
    throw new Error('백업 파일이 너무 큽니다.')
  let file: unknown
  try {
    file = JSON.parse(fileText)
  } catch {
    throw new Error('contiNEW 백업 파일을 읽을 수 없습니다.')
  }
  if (
    !isRecord(file) ||
    file.format !== FORMAT ||
    file.version !== VERSION ||
    file.iterations !== ITERATIONS ||
    typeof file.salt !== 'string' ||
    typeof file.iv !== 'string' ||
    typeof file.ciphertext !== 'string'
  )
    throw new Error('지원하지 않는 백업 파일입니다.')

  try {
    const salt = decode(file.salt)
    const iv = decode(file.iv)
    if (salt.length !== 16 || iv.length !== 12) throw new Error('invalid parameters')
    const key = await keyFor(password, salt, file.iterations)
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, decode(file.ciphertext))
    const payload: unknown = JSON.parse(new TextDecoder().decode(plaintext))
    if (!isRecord(payload) || payload.version !== VERSION || !isAppState(payload.state)) {
      throw new Error('invalid contents')
    }
    return payload.state
  } catch {
    throw new Error('비밀번호가 다르거나 백업 파일이 손상되었습니다.')
  }
}
