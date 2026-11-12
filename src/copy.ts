// 명세서에 정해진 고정 문구. 화면에서 직접 쓰지 말고 여기서 가져다 쓴다.
export const COPY = {
  spaceNotice:
    '공간은 이 앱 안에서 화면과 기록을 나누는 기능이에요. 기기나 앱 잠금을 여는 다른 사람은 모든 공간을 볼 수 있어요. 다른 사람이 보면 안 되는 내용은 앱 잠금을 설정해 주세요.',
  spaceSelectTitle: '어느 공간을 열까요?',
  memoOnlyHere: '이 공간에서만 보임',
  publicScope: '앱 안의 모든 공간에서 보입니다',
  shareCancelNotice: '이미 다른 공간에서 봤을 수 있어요',
  summaryDisclaimer:
    'AI가 만든 요약이라 빠지거나 틀린 내용이 있을 수 있어요. 중요한 일정은 원문을 확인해 주세요.',
  summaryOffline: '지금은 요약할 수 없어요',
  aiOn: 'AI 요약 켜짐',
  noConfirmYet: '아직 확인 기록 없음',
  notifyHidden: 'contiNEW · 확인할 일정이 있어요',
  notifySummary: 'contiNEW · 확인할 요약이 있어요',
  confirmMeaning: "'확인했어요'는 버튼을 누른 기록이에요. 누가 확인했는지의 증거는 아니에요.",
} as const

// F-10-1: 출시 전 번호 최신 여부 확인 필요
export const HELP_LINES = [
  { name: '자살예방상담전화', number: '109' },
  { name: '정신건강위기상담전화', number: '1577-0199' },
] as const
