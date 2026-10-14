import { connectToDatabase } from '../lib/db';
import { getInitialAdminConfig } from '../lib/config/env';
import {
  AdminUser,
  Post,
  Program,
  Resource,
  Banner,
  QuickLink,
  Faq,
  SiteSetting,
} from '../models';
import { hashPassword } from '../lib/auth/password';

export async function runSeed() {
  console.log('[Seed] Starting database seed process...');
  await connectToDatabase();

  // 1. 관리자 계정 생성 (기존 계정 없을 경우)
  const adminConfig = getInitialAdminConfig();
  const existingAdmin = await AdminUser.findOne({
    $or: [{ username: adminConfig.username }, { email: adminConfig.email }],
  });
  let adminUserId;

  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminConfig.password);

    const admin = await AdminUser.create({
      username: adminConfig.username,
      email: adminConfig.email,
      passwordHash,
      name: '진흥원 시스템관리자',
      role: 'admin',
      isActive: true,
      failedAttempts: 0,
      passwordChangedAt: new Date(),
    });
    adminUserId = admin._id;
    console.log(`[Seed] Initial Admin account created: ${adminConfig.username} (${adminConfig.email})`);
  } else {
    adminUserId = existingAdmin._id;
    console.log('[Seed] Admin account already exists. Skipping admin creation.');
  }

  // 2. 사이트 기본 설정
  const existingSetting = await SiteSetting.findOne();
  if (!existingSetting) {
    await SiteSetting.create({
      institutionName: '미래스마트산업진흥원',
      visionStatement: '대한민국 미래 스마트 제조 및 AI 혁신 생태계를 선도합니다',
      heroSubText: '중소·중견기업의 AI 디지털 전환과 미래 신산업 육성을 전방위 지원합니다',
      phone: '02-1234-5678',
      fax: '02-1234-5679',
      email: 'contact@smartindustry.or.kr',
      address: '서울특별시 서초구 반포대로 123 미래스마트산업진흥원 본원',
      popularKeywords: ['스마트공장', 'AI 바우처', '제조데이터', '인재양성', '글로벌진출', '지원사업'],
      familySites: [
        { name: '과학기술정보통신부', url: 'https://www.msit.go.kr' },
        { name: '중소벤처기업부', url: 'https://www.mss.go.kr' },
        { name: '한국지능정보사회진흥원(NIA)', url: 'https://www.nia.or.kr' },
        { name: '한국소프트웨어산업협회(KOSA)', url: 'https://www.sw.or.kr' },
      ],
    });
    console.log('[Seed] SiteSettings seeded.');
  }

  // 3. 퀵링크 6종 (§4.1 메인 빠른 메뉴)
  const quickLinkCount = await QuickLink.countDocuments();
  if (quickLinkCount === 0) {
    await QuickLink.insertMany([
      {
        title: '사업안내',
        description: '진흥원 핵심 지원사업 한눈에 보기',
        icon: 'Briefcase',
        href: '/programs',
        order: 1,
        isActive: true,
      },
      {
        title: '행사·교육',
        description: '스마트산업 전문 세미나 및 교육',
        icon: 'Calendar',
        href: '/news/events',
        order: 2,
        isActive: true,
      },
      {
        title: '자료실',
        description: '산업 동향 보고서 및 통계 자료',
        icon: 'FileText',
        href: '/resources',
        order: 3,
        isActive: true,
      },
      {
        title: '자주 묻는 질문',
        description: '궁금한 점을 빠르게 확인하세요',
        icon: 'HelpCircle',
        href: '/guide/faq',
        order: 4,
        isActive: true,
      },
      {
        title: '오시는 길',
        description: '진흥원 본원 및 교육장 안내',
        icon: 'MapPin',
        href: '/about/location',
        order: 5,
        isActive: true,
      },
      {
        title: '문의 안내',
        description: '부서별 업무 담당자 및 연락처',
        icon: 'PhoneCall',
        href: '/guide/contact',
        order: 6,
        isActive: true,
      },
    ]);
    console.log('[Seed] QuickLinks (6 items) seeded.');
  }

  // 4. 공지 배너 (KWCAG 2.2 대체텍스트 필수)
  const bannerCount = await Banner.countDocuments();
  if (bannerCount === 0) {
    await Banner.insertMany([
      {
        title: '2026 미래스마트제조 AI 혁신 컨퍼런스 개최 안내',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        altText: '2026 미래스마트제조 AI 혁신 컨퍼런스 홍보 배너: 제조 AI 기술 실증 사례 및 네트워킹 세미나 안내',
        linkUrl: '/news/events',
        isExternal: false,
        order: 1,
        isActive: true,
      },
      {
        title: '중소·중견기업 스마트제조 역량진단 및 컨설팅 지원사업',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
        altText: '스마트제조 혁신 진단 및 맞춤형 DX 로드맵 수립 지원 프로그램 홍보 배너',
        linkUrl: '/programs',
        isExternal: false,
        order: 2,
        isActive: true,
      },
    ]);
    console.log('[Seed] Banners (2 items) seeded.');
  }

  // 5. 주요 사업 안내 (6건, 신청 기능 배제, 안내 중심)
  const programCount = await Program.countDocuments();
  if (programCount === 0) {
    await Program.insertMany([
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
    ]);
    console.log('[Seed] Programs (6 items) seeded.');
  }

  // 6. 게시물(공지/보도/행사/입찰) 8건
  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    await Post.insertMany([
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
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
        createdBy: adminUserId,
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
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        department: '홍보팀',
        attachments: [],
        tags: ['보도자료', 'AI전환', '중소기업지원'],
        createdBy: adminUserId,
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
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        department: 'AI융합사업본부',
        attachments: [],
        tags: ['테크포럼', '온디바이스AI', '엣지컴퓨팅'],
        createdBy: adminUserId,
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
        publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
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
        createdBy: adminUserId,
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
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        department: '홍보팀',
        attachments: [],
        tags: ['누리집개편', '공지'],
        createdBy: adminUserId,
      },
    ]);
    console.log('[Seed] Posts (5 items) seeded.');
  }

  // 7. 자료실 (4건)
  const resourceCount = await Resource.countDocuments();
  if (resourceCount === 0) {
    await Resource.insertMany([
      {
        kind: 'publication',
        title: '2026 스마트제조 산업 동향 및 정책 분석 보고서',
        summary: '주요 선진국의 인공지능 기반 스마트제조 육성 정책과 국내 산업계 시사점을 심층 분석한 연구 보고서입니다.',
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
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
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
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
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
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
        publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
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
    ]);
    console.log('[Seed] Resources (4 items) seeded.');
  }

  // 8. FAQ (6건)
  const faqCount = await Faq.countDocuments();
  if (faqCount === 0) {
    await Faq.insertMany([
      {
        category: '사업안내',
        question: '진흥원 지원사업 신청은 어떻게 진행되나요?',
        answer: '본 진흥원 누리집은 **정보 안내 전용** 포털입니다. 사업 신청 및 온라인 접수는 사업 상세 안내에 기재된 정부 주관 공식 접수 시스템 링크를 통해서만 진행하실 수 있습니다.',
        order: 1,
        isActive: true,
      },
      {
        category: '사업안내',
        question: '지원 대상 기업의 자격 조건은 무엇인가요?',
        answer: '대부분의 스마트공장 및 제조 AI 지원사업은 중소기업기본법 제2조에 따른 중소기업 및 중견기업 특별법에 따른 중견기업을 대상으로 합니다. 세부 사업별 지원 대상 요건은 각 사업 상세 페이지의 요약 카드를 확인하시기 바랍니다.',
        order: 2,
        isActive: true,
      },
      {
        category: '교육안내',
        question: '진흥원 교육 과정 수강료는 전액 무료인가요?',
        answer: '네, 진흥원에서 주관하는 재직자 및 구직자 대상 스마트제조 DX 교육 과정은 정부 지원 예산으로 운영되어 교육비 및 실습 교재비 전액이 무료로 지원됩니다.',
        order: 3,
        isActive: true,
      },
      {
        category: '자료이용',
        question: '발간 보고서나 통계 자료를 외부 보고서에 인용할 수 있나요?',
        answer: '진흥원에서 발간한 보고서와 통계 자료는 공공누리 제1유형(출처표시) 조건에 따라 자유롭게 인용 및 재배포가 가능합니다. 단, 출처(미래스마트산업진흥원)를 반드시 명시해야 합니다.',
        order: 4,
        isActive: true,
      },
      {
        category: '누리집이용',
        question: '온디바이스(On-Device) 의미 검색이란 무엇인가요?',
        answer: '사용자가 입력한 검색어가 외부 AI 서버로 전송되지 않고, 사용자 컴퓨터/스마트폰 브라우저 내에서 안전하게 유사도를 분석하여 관련 문서를 찾아주는 프라이버시 보호형 최신 검색 기술입니다.',
        order: 5,
        isActive: true,
      },
      {
        category: '기타',
        question: '진흥원 방문 상담을 원할 경우 어떻게 예약하나요?',
        answer: '방문 상담은 원활한 진행을 위해 [이용안내 > 문의 안내] 메뉴의 담당 부서 유선 전화를 통해 사전 일정을 조율하신 후 방문해 주시기 바랍니다.',
        order: 6,
        isActive: true,
      },
    ]);
    console.log('[Seed] FAQs (6 items) seeded.');
  }

  console.log('[Seed] Database seed completed successfully!');
}

// 직접 CLI 실행 시 호출
if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('[Seed CLI] Process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed CLI] Error:', err);
      process.exit(1);
    });
}
