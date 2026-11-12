import type { AppState } from '../state/reducer'
import { DEFAULT_WIDGETS } from '../types/model'

const at = (days: number, h: number, m = 0, base = new Date()) => {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const widgets = () => DEFAULT_WIDGETS.map((w) => ({ ...w }))

/** 화면 작업용 가상 데이터 (실제 기록 아님, 10장 연구 윤리). 공간 이름·용도는 예시일 뿐이다 */
export function makeSeed(base = new Date()): AppState {
  const post = (
    id: string,
    p: Partial<AppState['posts'][number]> & Pick<AppState['posts'][number], 'type' | 'title' | 'authorLabel'>,
    created: string,
  ): AppState['posts'][number] => ({
    body: '',
    origin: 'manual',
    pinned: p.type === 'caution',
    confirmRequested: false,
    createdAt: created,
    updatedAt: created,
    deletedAt: null,
    id,
    ...p,
  })

  return {
    spaces: [
      {
        id: 'space_a',
        name: '하루',
        icon: 'cloud',
        color: '#8b6fe8',
        description: '전체 할 일 · 일정 · 공유 기록',
        homeWidgets: widgets(),
        sortOrder: 0,
        hidden: false,
        deletedAt: null,
        aiMemoEnabled: false,
      },
      {
        id: 'space_b',
        name: '업무 A',
        icon: 'calendar',
        color: '#e16b94',
        description: '프로젝트 기획 · 진행 관리',
        homeWidgets: widgets(),
        sortOrder: 1,
        hidden: false,
        deletedAt: null,
        aiMemoEnabled: false,
      },
      {
        id: 'space_c',
        name: '업무 B',
        icon: 'calendar',
        color: '#e16b94',
        description: '자료 정리 · 운영',
        homeWidgets: widgets(),
        sortOrder: 2,
        hidden: false,
        deletedAt: null,
        aiMemoEnabled: false,
      },
      {
        id: 'space_d',
        name: '공부',
        icon: 'book',
        color: '#e9a23b',
        description: '학습 계획 · 공부 기록',
        homeWidgets: widgets(),
        sortOrder: 3,
        hidden: false,
        deletedAt: null,
        aiMemoEnabled: false,
      },
    ],
    memos: [
      {
        id: 'memo_1',
        spaceId: 'space_a',
        body: '회의 전에 정리할 것\n자료 목차 다시 보기, 질문 세 개 적어 가기',
        pinned: true,
        sharedPostIds: ['post_1'],
        createdAt: at(-1, 9, 0, base),
        updatedAt: at(-1, 9, 5, base),
        deletedAt: null,
      },
      {
        id: 'memo_2',
        spaceId: 'space_a',
        body: '오늘 읽은 책\n3장까지 읽음. 다음엔 4장부터.',
        pinned: false,
        sharedPostIds: [],
        createdAt: at(-2, 21, 0, base),
        updatedAt: at(-2, 21, 0, base),
        deletedAt: null,
      },
      {
        id: 'memo_3',
        spaceId: 'space_a',
        body: '장볼 것\n우유, 달걀, 식빵',
        pinned: false,
        sharedPostIds: [],
        createdAt: at(-3, 18, 0, base),
        updatedAt: at(-3, 18, 0, base),
        deletedAt: null,
      },
      {
        id: 'memo_4',
        spaceId: 'space_b',
        body: '기획안 초안\n범위는 1차 시안까지',
        pinned: false,
        sharedPostIds: [],
        createdAt: at(-1, 14, 0, base),
        updatedAt: at(-1, 14, 0, base),
        deletedAt: null,
      },
      {
        id: 'memo_5',
        spaceId: 'space_d',
        body: '시험 범위\n2단원~4단원',
        pinned: false,
        sharedPostIds: [],
        createdAt: at(-2, 20, 0, base),
        updatedAt: at(-2, 20, 0, base),
        deletedAt: null,
      },
    ],
    posts: [
      post(
        'post_1',
        {
          type: 'event',
          title: '팀 회의',
          eventAt: at(1, 10, 0, base),
          place: '3층 회의실',
          authorLabel: '업무 A',
          confirmRequested: true,
          origin: 'memo',
        },
        at(-1, 9, 10, base),
      ),
      post(
        'post_2',
        { type: 'event', title: '전체 회의', eventAt: at(2, 10, 0, base), authorLabel: '업무 A' },
        at(-2, 11, 0, base),
      ),
      post(
        'post_3',
        {
          type: 'event',
          title: '프로젝트 마감',
          eventAt: at(3, 18, 0, base),
          authorLabel: '업무 B',
          confirmRequested: true,
        },
        at(-3, 10, 0, base),
      ),
      post(
        'post_4',
        { type: 'event', title: '프로젝트 중간 공유', eventAt: at(4, 16, 0, base), authorLabel: '이름 없이' },
        at(-1, 15, 0, base),
      ),
      post(
        'post_5',
        { type: 'event', title: '도서관 반납', eventAt: at(-2, 17, 0, base), authorLabel: '공부' },
        at(-6, 12, 0, base),
      ),
      post(
        'post_6',
        { type: 'todo', title: '회의 자료 공유하기', authorLabel: '업무 A', doneAt: at(0, 8, 30, base) },
        at(-2, 9, 0, base),
      ),
      post(
        'post_7',
        { type: 'todo', title: '프로젝트 일정 확인하기', dueAt: at(1, 18, 0, base), authorLabel: '업무 B' },
        at(-1, 10, 0, base),
      ),
      post(
        'post_8',
        { type: 'todo', title: '주간 회고 작성하기', dueAt: at(2, 18, 0, base), authorLabel: '하루' },
        at(-1, 11, 0, base),
      ),
      post(
        'post_9',
        {
          type: 'caution',
          title: '출입증 위치',
          body: '회사 출입증은 가방 안쪽 주머니에 있음',
          authorLabel: '이름 없이',
          confirmRequested: true,
        },
        at(-4, 8, 0, base),
      ),
      post(
        'post_10',
        {
          type: 'note',
          title: '다음 주 회의 안건 정리',
          body: '안건 세 가지를 먼저 정해 두기',
          authorLabel: '업무 A',
        },
        at(-1, 16, 0, base),
      ),
      post(
        'post_11',
        {
          type: 'note',
          title: '작업 인수인계 사항 정리해요!',
          body: '공유 폴더에 올려 둔 문서 기준으로 정리',
          authorLabel: '이름 없이',
        },
        at(-1, 17, 0, base),
      ),
    ],
    messages: [
      {
        id: 'msg_1',
        body: '내일 팀 회의 몇 시였지?',
        authorLabel: '업무 B',
        createdAt: at(-1, 22, 0, base),
        deletedAt: null,
      },
      {
        id: 'msg_2',
        body: '10시야. 게시판에 올려 뒀어.',
        authorLabel: '업무 A',
        replyToId: 'msg_1',
        createdAt: at(-1, 22, 5, base),
        deletedAt: null,
      },
      {
        id: 'msg_3',
        body: '주말 일정은 아직 정하지 않았어',
        authorLabel: '이름 없이',
        createdAt: at(0, 8, 30, base),
        deletedAt: null,
      },
    ],
    confirmations: [],
    boardViewed: {},
    currentSpaceId: null,
    settings: { aiSummaryEnabled: false, notifyPreview: false },
  }
}
