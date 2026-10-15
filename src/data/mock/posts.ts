import { MockPost } from './types';

export const mockPosts: MockPost[] = [
  {
    type: 'notice',
    title: '2026년도 상반기 미래스마트산업진흥원 주요 지원사업 종합 설명회 안내',
    slug: '2026-h1-business-orientation',
    summary: '진흥원에서 주관하는 2026년도 상반기 AI·스마트제조 핵심 사업 종합 설명회를 온·오프라인으로 동시 개최합니다.',
    body: `### 행사 개요
- **일시**: 2026년 3월 25일 (수) 14:00 ~ 17:00
- **장소**: 미래스마트산업진흥원 본원 대강당 (유튜브 라이브 생중계 병행)
- **주요 내용**:
  1. 2026년도 스마트제조 R&D 및 보급사업 추진 방향
  2. 제조 AI 융합 실증 및 바우처 지원 안내
  3. 질의응답 및 1:1 상담 부스 운영
- **참가비**: 무료 (자료집 현장 배부)

많은 관심과 참여를 부탁드립니다.`,
    status: 'published',
    isPinned: true,
    daysAgo: 2,
    department: '기획조정본부',
    attachments: [
      {
        name: '2026년_상반기_지원사업_설명회_안내문.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 245000,
        mimeType: 'application/pdf',
      },
    ],
    tags: ['사업설명회', '2026사업', '스마트공장'],
  },
  {
    type: 'press',
    title: '[보도자료] 미래스마트산업진흥원, 중소 제조기업 AI 전환 지원 본격화',
    slug: 'press-2026-ai-dx-launch',
    summary: '진흥원은 올해 중소 제조기업 100개사를 대상으로 공정 최적화 및 품질 검사 특화 AI 도입을 중점 추진한다고 밝혔다.',
    body: `**[서울=연합]** 미래스마트산업진흥원(원장 홍길동)은 14일, 글로벌 공급망 재편과 인력 부족에 대응하여 국내 중소·중견 제조기업의 자율제조 생태계 전환을 지원하는 '2026 제조 AI 대도약 프로젝트'를 본격 착수한다고 발표했다.

진흥원 관계자는 "생성형 AI와 산업 데이터의 결합을 통해 공장 현장의 고질적인 불량과 안전사고를 획기적으로 줄이고, 중소기업의 글로벌 수출 경쟁력을 끌어올리는 마중물이 될 것"이라고 강조했다.`,
    status: 'published',
    isPinned: true,
    daysAgo: 3,
    department: '홍보팀',
    attachments: [],
    tags: ['보도자료', 'AI전환', '중소기업지원'],
  },
  {
    type: 'event',
    title: '제12회 스마트 제조혁신 테크포럼 (온디바이스 AI와 엣지 컴퓨팅)',
    slug: 'event-tech-forum-12',
    summary: '네트워크 연결 없이 공장 설비 자체에서 실시간 추론하는 온디바이스 AI 기술과 적용 사례를 공유합니다.',
    body: `### 포럼 일정 및 장소
- **일시**: 2026년 4월 10일(금) 13:30 ~ 17:30
- **장소**: 코엑스 컨퍼런스룸 3층 301호
- **발표 세션**:
  - 세션 1: 초저지연 온디바이스 머신러닝의 제조현장 도입 전략
  - 세션 2: 산업용 엣지 컴퓨터 하드웨어 아키텍처
  - 세션 3: 글로벌 선도 기업의 자율제조 PoC 사례 분석`,
    status: 'published',
    isPinned: false,
    daysAgo: 5,
    department: 'AI융합사업본부',
    attachments: [],
    tags: ['테크포럼', '온디바이스AI', '엣지컴퓨팅'],
  },
  {
    type: 'bid',
    title: '[입찰공고] 2026년도 미래스마트산업진흥원 통합 정보인프라 유지관리 용역',
    slug: 'bid-2026-infra-maintenance',
    summary: '진흥원 홈페이지 및 클라우드 인프라, 보안 관제 시스템의 안정적 운영을 위한 유지관리 용역 입찰공고입니다.',
    body: `### 입찰 정보
1. **공고명**: 2026년도 미래스마트산업진흥원 통합 정보인프라 유지관리 용역
2. **사업 기간**: 계약 체결일로부터 2026년 12월 31일까지
3. **사업 예산**: 250,000,000원 (부가가치세 포함)
4. **입찰 방식**: 일반경쟁입찰 (협상에 의한 계약)
5. **제안서 제출 마감**: 2026년 4월 5일 17:00까지

상세 제안요청서는 첨부파일을 확인해 주시기 바랍니다.`,
    status: 'published',
    isPinned: false,
    daysAgo: 6,
    department: '경영지원본부',
    attachments: [
      {
        name: '제안요청서_2026_정보인프라유지관리.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 512000,
        mimeType: 'application/pdf',
      },
    ],
    tags: ['입찰공고', '유지관리', '용역'],
  },
  {
    type: 'notice',
    title: '진흥원 누리집 전면 개편 및 이용 만족도 조사 실시 안내',
    slug: 'notice-portal-renewal-survey',
    summary: '사용자 중심의 정보 제공과 웹 접근성 강화를 위해 새롭게 단장된 진흥원 누리집을 안내해 드립니다.',
    body: `방문자 여러분께 보다 신속하고 투명한 정보를 제공하기 위해 미래스마트산업진흥원 누리집이 전면 개편되었습니다.

- 최신 반응형 디자인 및 KWCAG 2.2 웹 접근성 기준 준수
- 개인정보 보호를 위한 브라우저 온디바이스(On-Device) 의미 검색 도입
- 모바일 환경 최적화 및 쾌적한 정보 탐색 속도 제공`,
    status: 'published',
    isPinned: false,
    daysAgo: 7,
    department: '홍보팀',
    attachments: [],
    tags: ['누리집개편', '공지'],
  },
];
