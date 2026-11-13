import { connectToDatabase } from '@/lib/db';
import { SiteContent, ISiteContent } from '@/models/SiteContent';

export interface SiteContentData {
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  metadata: Record<string, any>;
  updatedAt?: string;
}

export const DEFAULT_ABOUT_CONTENT: SiteContentData = {
  slug: 'about',
  title: '미래스마트산업진흥원 소개',
  subtitle:
    '인공지능과 디지털 전환(DX)을 바탕으로 산업의 고도화를 촉진하고, 전문 인재를 양성하여 지속 가능한 산업 생태계를 구축하는 비영리 목적의 전문단체입니다.',
  content: `## 설립 취지 및 기관 성격

오늘날 전 세계 산업계는 생성형 인공지능(AI), 클라우드, 데이터 기반의 급격한 기술 혁신을 경험하고 있으며, 제조업과 서비스업 전반에 걸친 디지털 전환(DX)은 국가와 기업의 생존을 결정짓는 핵심 과제로 부상하였습니다.

**미래스마트산업진흥원**은 인공지능·소프트웨어 분야의 조사·연구, 산업 현장 중심의 전문인력 양성, 기술 실증 및 산업 교류·협력을 체계적으로 추진하기 위하여 설립된 비영리 목적의 공익 전문단체입니다.

본원은 고유목적사업의 수행을 통해 산업 현장의 기술 격차를 해소하고, 중소·중견기업의 실질적인 AI 전환(AX)을 촉진하며, 건전하고 신뢰성 있는 미래 스마트 산업 생태계를 조성하는 데 기여하고자 합니다.

### 투명하고 공정한 기관 운영 원칙
- 본원의 수익과 재산은 고유목적사업 및 운영을 위해서만 사용되며 구성원에게 이익을 분배하지 않습니다.
- 공공성과 공익성을 최우선으로 하여 산업 현장과 교육 수요자의 권익을 보호합니다.
- 학술 연구 및 교육 실적은 사실에 근거하여 투명하게 공개합니다.`,
  metadata: {
    roles: [
      {
        title: '1. AI 기술개발 및 산업 실증 지원',
        desc: '중소·중견 제조 현장의 공정 자동화와 AI 품질 검사 등 현장 밀착형 실증 모델 연구 및 확산 지원',
      },
      {
        title: '2. 미래 스마트 산업 전문인재 양성',
        desc: '산업체 재직자 직무 전환, 온디바이스 AI 및 산업 소프트웨어 실무 교육과정 운영',
      },
      {
        title: '3. 산·학·연 융합 네트워크 및 포럼 운영',
        desc: '기업, 대학, 연구기관이 참여하는 정기 기술 세미나, 산업 동향 리포트 발간 및 산학 교류 협력',
      },
      {
        title: '4. 신뢰성 있는 AI 표준 및 가이드 연구',
        desc: '산업 현장의 윤리적·안전한 AI 적용을 위한 자체 가이드라인 연구 및 실무 표준 체계 지원',
      },
    ],
    charterUrl: '/files/fsipi-charter.pdf',
    charterFileName: '미래스마트산업진흥원_정관.pdf',
  },
};

export const DEFAULT_DIRECTOR_CONTENT: SiteContentData = {
  slug: 'director',
  title: '원장 소개',
  subtitle:
    '25년 이상의 현장 실무와 직업교육을 바탕으로 미래 스마트 산업 혁신을 이끕니다.',
  content: `## 원장 인사말

안녕하십니까. 미래스마트산업진흥원 초대 원장 김범준입니다.

25년 이상 정보통신기술(ICT) 및 소프트웨어 개발, 인공지능 응용 분야에서 산업체 실무와 전문 인력 양성을 병행해 왔습니다. 급변하는 기술의 물결 속에서 중소 제조기업의 실질적인 AI 도입과 현장 인재 육성을 최우선 목표로 진흥원을 이끌어가겠습니다.

직업교육 현장에서 검증된 교육 모델과 최신 산업 AI 기술을 융합하여, 대한민국 스마트 산업이 글로벌 경쟁력을 확보할 수 있도록 헌신하겠습니다.`,
  metadata: {
    directorName: '김범준',
    directorEnName: 'Kim Beom-Jun',
    directorTitle: '미래스마트산업진흥원 초대 원장 / IT 직업교육·인공지능 연구자',
    profileImageUrl: '',
    transparencyNotice:
      '본 페이지에 수록된 학술 연구, 강의, 프로젝트 및 경력 사항은 김범준 원장 개인의 전문 이력이며, 미래스마트산업진흥원 기관 설립 이후의 고유 사업 수행 실적과 엄격히 구분하여 투명하게 공개합니다.',
    education: [
      '컴퓨터공학 박사과정 수료 (인공지능 보안, IT 윤리 전공)',
      '공학석사 (소프트웨어공학 및 지능형 시스템 전공)',
      '전자계산학 공학사 (컴퓨터시스템 구조 전공)',
    ],
    timeline: [
      {
        period: '2026 ~ 현재',
        title: '미래스마트산업진흥원 초대 원장',
        desc: '산업 AI 실증 및 미래 스마트 기술 전문 인재 양성 총괄',
      },
      {
        period: '2015 ~ 2025',
        title: 'IT 직업전문교육기관 수석교수 및 학과장',
        desc: '인공지능 소프트웨어 실무 개발자 1,200여 명 양성, 고용노동부 직업능력개발훈련 성과 평가 우수교원 표창',
      },
      {
        period: '2008 ~ 2014',
        title: '스마트제조 솔루션 전문기업 기술이사(CTO)',
        desc: '공장 자동화 PLC 및 엣지 임베디드 모니터링 시스템 아키텍처 설계',
      },
      {
        period: '2000 ~ 2007',
        title: '산업용 소프트웨어 개발팀 리드',
        desc: '실시간 제어 프로토콜 및 데이터베이스 연동 프레임워크 개발',
      },
    ],
    papers: [
      {
        title: '정보기술 직업교육 전문가들의 사이버보안 인식과 방향성 탐색',
        journal: '『융합과 통섭』, 제9권 제5호, pp. 309–325, 2026',
        doi: 'https://doi.org/10.33090/SFCC.9.5.18',
      },
      {
        title: '생성형 인공지능 시대, IT산업의 윤리적 방향성 탐색: 저작권의 딜레마',
        journal: '『융합과 통섭』, 제8권 제5호, pp. 112–130, 2025',
        doi: 'https://doi.org/10.33090/SFCC.8.5.8',
      },
    ],
  },
};

/**
 * 고정 페이지 콘텐츠 조회 (DB 우선, 부재 시 기본 템플릿 반환)
 */
export async function getSiteContent(slug: 'about' | 'director' | string): Promise<SiteContentData> {
  const defaultData = slug === 'director' ? DEFAULT_DIRECTOR_CONTENT : DEFAULT_ABOUT_CONTENT;

  try {
    await connectToDatabase();
    const doc = await SiteContent.findOne({ slug }).lean();

    if (!doc) {
      return defaultData;
    }

    return {
      slug: doc.slug,
      title: doc.title || defaultData.title,
      subtitle: doc.subtitle || defaultData.subtitle,
      content: doc.content || defaultData.content,
      metadata: {
        ...defaultData.metadata,
        ...(doc.metadata || {}),
      },
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    };
  } catch (error) {
    console.error(`[Queries] getSiteContent error (${slug}):`, error);
    return defaultData;
  }
}
