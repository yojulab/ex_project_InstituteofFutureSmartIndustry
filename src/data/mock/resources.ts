import { MockResource } from './types';

export const mockResources: MockResource[] = [
  {
    kind: 'publication',
    title: '2026 스마트제조 산업 동향 및 정책 분석 보고서',
    summary: '주요 선진국의 인공지능 기반 스마트제조 육성 정책과 국내 산업계 시사점을 심층 분석한 연구 보고서입니다.',
    daysAgo: 4,
    authorOrDept: '정책연구실',
    downloadCount: 142,
    attachments: [
      {
        name: '2026_스마트제조_산업동향보고서.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 3840000,
      },
    ],
  },
  {
    kind: 'statistics',
    title: '2025 국내 중소기업 스마트공장 도입 현황 및 경제적 파급효과 실태조사',
    summary: '스마트공장 도입 기업의 생산성 향상률, 불량률 감소 효과, 고용 창출 기여도 통계 자료집입니다.',
    daysAgo: 10,
    authorOrDept: '데이터통계분석팀',
    downloadCount: 98,
    attachments: [
      {
        name: '2025_스마트공장_실태조사_통계집.xlsx',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 1250000,
      },
    ],
  },
  {
    kind: 'regulation',
    title: '미래스마트산업진흥원 정관 및 운영 규정집 (2026년 개정판)',
    summary: '진흥원 조직 구성, 사업 수행, 회계 처리 및 정보보안에 관한 제반 규정 모음집입니다.',
    daysAgo: 20,
    authorOrDept: '경영기획실',
    downloadCount: 56,
    attachments: [
      {
        name: '미래스마트산업진흥원_정관_및_규정집.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 890000,
      },
    ],
  },
  {
    kind: 'publication',
    title: '중소 제조기업을 위한 제조데이터 수집 및 표준화 실무 가이드라인 v2.0',
    summary: 'PLC 및 센서 통신 표준화(OPC-UA, MQTT)와 보안 준수 지침을 기술한 실무 가이드북입니다.',
    daysAgo: 25,
    authorOrDept: '표준인증팀',
    downloadCount: 310,
    attachments: [
      {
        name: '제조데이터_표준화_실무가이드_v2.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        size: 2450000,
      },
    ],
  },
];
