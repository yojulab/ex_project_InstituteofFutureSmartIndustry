import { MockProgram } from './types';

export const mockPrograms: MockProgram[] = [
  {
    title: '2026 제조 AI 융합 실증 지원사업',
    slug: '2026-manufacturing-ai-pilot',
    category: 'AI융합',
    summary: '제조 현장의 품질 검사, 예지보전 등 AI 알고리즘 도입 및 실증 비용을 지원합니다.',
    target: '국내 중소·중견 제조기업 및 AI 솔루션 공급기업 컨소시엄',
    content: `### 1. 사업 목적
제조 현장의 공정 효율화, 불량률 감소, 작업자 안전 확보를 위해 산업 특화 인공지능(AI) 솔루션 도입 및 현장 실증을 지원합니다.

### 2. 주요 지원 내용
- **지원 규모**: 과제당 최대 2억 원 이내 (총 15개 과제 내외)
- **지원 분야**:
  - 비전 AI 기반 실시간 품질 불량 검사
  - 센서 데이터 기반 설비 고장 사전 예측(예지보전)
  - 에너지 사용 최적화 및 공정 자동화 제어
- **지원 기간**: 협약일로부터 8개월

### 3. 추진 절차 안내
1. 사업 공고 및 설명회
2. 제안서 접수 (관련 공식 안내처 참조)
3. 서면 및 발표 평가
4. 협약 체결 및 정부지원금 교부
5. 중간 점검 및 최종 성과평가

### 4. 문의처
- 담당 부서: 미래스마트산업진흥원 AI융합사업본부 제조AI팀
- 연락처: 02-1234-5680 / ai-biz@smartindustry.or.kr`,
    period: { rawText: '2026.03.01 ~ 2026.04.15 (안내 중)' },
    status: 'open',
    department: 'AI융합사업본부',
    contact: '02-1234-5680',
    externalUrl: 'https://www.msit.go.kr',
    isFeatured: true,
    order: 1,
  },
  {
    title: '스마트공장 고도화 DX 전문 컨설팅 지원',
    slug: 'smart-factory-dx-consulting',
    category: '스마트제조',
    summary: '스마트공장 구축 기업의 운영 효율 극대화를 위한 전문위원 현장 진단 및 컨설팅을 제공합니다.',
    target: '스마트공장을 기 구축한 국내 중소·중견기업',
    content: `### 1. 사업 개요
기존 스마트공장 구축 기업이 겪는 시스템 운영 애로사항을 해결하고, 자율형 스마트공장으로 발전할 수 있도록 분야별 전문 컨설턴트를 1:1 매칭 지원합니다.

### 2. 지원 내용
- 기업당 최대 5회 현장 방문 진단 및 맞춤 솔루션 도출
- 데이터 연계성 점검, 보안 취약점 진단, 설비 인터페이스 고도화 가이드 제공
- 전액 무료 지원 (진흥원 100% 부담)

### 3. 문의처
- 스마트제조지원센터: 02-1234-5681`,
    period: { rawText: '상시 안내' },
    status: 'open',
    department: '스마트제조지원센터',
    contact: '02-1234-5681',
    isFeatured: true,
    order: 2,
  },
  {
    title: '산업현장 밀착형 스마트제조 DX 인재양성 교육',
    slug: 'smart-manufacturing-talent-training',
    category: '디지털인재',
    summary: '재직자 및 미취업 청년을 대상으로 실무 중심 스마트팩토리 운영 및 데이터 분석 교육을 진행합니다.',
    target: '제조기업 재직자 및 스마트산업 분야 취업 희망자',
    content: `### 1. 교육 목표
스마트 제조 공정에서 발생하는 센서·설비 데이터를 수집·가공하고, 이를 머신러닝 모델에 적용할 수 있는 현장 중심 실무 엔지니어를 양성합니다.

### 2. 교육 과정 안내
- 초급: 스마트제조 개론 및 IoT 센서 데이터 수집
- 중급: 파이썬 기반 제조 빅데이터 분석 및 시각화
- 고급: 엣지 컴퓨팅 및 현장 AI 모델 배포 실습

### 3. 교육비
- 국비 지원 (교재 및 실습비 무료)`,
    period: { rawText: '2026년 연중 기수별 운영' },
    status: 'open',
    department: '인재양성본부',
    contact: '02-1234-5682',
    isFeatured: true,
    order: 3,
  },
  {
    title: '글로벌 스마트인더스트리 해외 로드쇼 참가 지원',
    slug: 'global-smart-industry-roadshow',
    category: '글로벌진출',
    summary: '국내 우수 스마트제조 솔루션 기업의 글로벌 시장 진출 및 바이어 매칭을 지원합니다.',
    target: '스마트제조 소프트웨어/하드웨어 수출 유망 기업',
    content: `### 1. 지원 개요
독일 하노버 메세 등 세계 유수 산업 박람회 한국 공동관 참가 지원 및 현지 바이어 1:1 비즈니스 매칭 상담회를 운영합니다.`,
    period: { rawText: '2026.05 공고 예정' },
    status: 'upcoming',
    department: '글로벌협력실',
    contact: '02-1234-5683',
    isFeatured: true,
    order: 4,
  },
  {
    title: '제조 데이터 표준화 및 산업 데이터 스페이스 실증',
    slug: 'industrial-data-space-standard',
    category: '스마트제조',
    summary: '이기종 설비 간 데이터 연동을 위한 국제 표준(AAS) 적용 및 데이터 안심 거래 체계 구축 지원',
    target: '제조 데이터 공급 및 수요 기업',
    content: `### 1. 사업 목적
유럽 Catena-X 등 글로벌 데이터 스페이스 표준 규격에 부합하는 자산관리쉘(AAS) 기술을 보급하여 공급망 간 원활한 데이터 교환 기반을 마련합니다.`,
    period: { rawText: '2026.06 공고 예정' },
    status: 'upcoming',
    department: '스마트제조지원센터',
    contact: '02-1234-5684',
    isFeatured: false,
    order: 5,
  },
  {
    title: '2025 스마트산업 혁신 유공 표창 공모',
    slug: '2025-smart-industry-awards',
    category: '포상/공모',
    summary: '스마트제조 및 AI 산업 발전에 현저한 공로가 있는 기업과 개인을 발굴하여 시상합니다.',
    target: '스마트산업 관련 기업, 공공기관 및 연구인력',
    content: `2025년도 스마트산업 혁신 유공자 포상이 성공적으로 마무리되었습니다. 2026년도 일정은 하반기 공지될 예정입니다.`,
    period: { rawText: '2025.10 접수 마감' },
    status: 'closed',
    department: '기획조정본부',
    contact: '02-1234-5678',
    isFeatured: false,
    order: 6,
  },
];
