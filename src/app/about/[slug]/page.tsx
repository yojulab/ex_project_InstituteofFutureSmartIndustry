import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Building2,
  Target,
  Award,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  MapPin,
  Bus,
  Car,
  Train,
} from 'lucide-react';

interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

const TABS = [
  { slug: 'vision', title: '인사말·비전' },
  { slug: 'history', title: '연혁' },
  { slug: 'organization', title: '조직·담당자 안내' },
  { slug: 'location', title: '찾아오시는 길' },
];

export default async function AboutSubPage({ params }: AboutPageProps) {
  const { slug } = await params;

  if (!TABS.some((t) => t.slug === slug)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <Link href="/about/vision" className="hover:underline">진흥원 소개</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">
            {TABS.find((t) => t.slug === slug)?.title}
          </span>
        </nav>

        {/* 상단 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            진흥원 소개
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            미래스마트산업진흥원은 대한민국 제조 산업의 AI 디지털 전환을 이끄는 전문 공공기관입니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-slate-200 pb-3">
          {TABS.map((tab) => {
            const isActive = slug === tab.slug;
            return (
              <Link
                key={tab.slug}
                href={`/about/${tab.slug}`}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#0F2C59] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.title}
              </Link>
            );
          })}
        </div>

        {/* 탭 1: 인사말 및 비전 */}
        {slug === 'vision' && (
          <div className="space-y-10">
            {/* 인사말 카드 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 mb-4 inline-block">
                원장 인사말
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] mb-6 leading-snug">
                "인공지능과 데이터로 대한민국 제조 현장의 새로운 도약을 열어갑니다"
              </h2>

              <div className="prose-content space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
                <p>
                  안녕하십니까? 미래스마트산업진흥원 누리집을 방문해 주신 국민과 기업인 여러분을 진심으로 환영합니다.
                </p>
                <p>
                  글로벌 기술 패권 경쟁과 공급망 불안, 인구 구조 변화 속에서 전통적인 제조업은 그 어느 때보다 거센 도전에 직면해 있습니다. 
                  이에 우리 진흥원은 첨단 인공지능(AI)과 사물인터넷(IoT), 데이터 스페이스 기술을 제조 현장 전반에 융합하여 공정 생산성을 극대화하고 고품질·무탄소 자율제조 생태계를 구축하는 데 총력을 기울이고 있습니다.
                </p>
                <p>
                  기업의 목소리에 귀 기울이며, 현장의 애로사항을 선제적으로 해결하는 든든한 동반자가 되겠습니다. 
                  대한민국이 글로벌 스마트산업을 선도하는 그날까지 변함없는 관심과 성원을 부탁드립니다.
                </p>
                <div className="pt-6 text-right font-extrabold text-[#0F2C59] text-base">
                  미래스마트산업진흥원 원장 홍 길 동
                </div>
              </div>
            </div>

            {/* 비전 및 핵심 가치 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs">
              <h2 className="text-xl font-bold text-[#0F2C59] mb-8 flex items-center gap-2">
                <Target className="w-6 h-6 text-sky-600" />
                <span>진흥원 미션 및 3대 핵심 목표</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black text-xl mb-4">
                    01
                  </div>
                  <h3 className="font-bold text-[#0F2C59] text-base mb-2">제조 AI 대도약 실증</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    중소·중견기업 1,000개사 이상 현장 맞춤형 AI 불량검사 및 설비 예지보전 모델 구축 지원
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black text-xl mb-4">
                    02
                  </div>
                  <h3 className="font-bold text-[#0F2C59] text-base mb-2">데이터 스페이스 표준화</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    이기종 설비 간 데이터 연동(AAS) 규격 보급 및 안전한 산업 데이터 유통 생태계 마련
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black text-xl mb-4">
                    03
                  </div>
                  <h3 className="font-bold text-[#0F2C59] text-base mb-2">현장 맞춤형 DX 인재 양성</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    산업 도메인 지식과 인공지능 분석 역량을 겸비한 실무 엔지니어 연 5,000명 육성
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 연혁 */}
        {slug === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs">
            <h2 className="text-xl font-bold text-[#0F2C59] mb-8 flex items-center gap-2">
              <Clock className="w-6 h-6 text-sky-600" />
              <span>진흥원 발자취 (주요 연혁)</span>
            </h2>

            <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
              <div className="relative flex items-start gap-6">
                <div className="w-10 h-10 rounded-full bg-[#0F2C59] text-white flex items-center justify-center font-bold text-xs shrink-0 z-10">
                  2026
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">2026년</h3>
                  <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>• 10월: 차세대 정보 제공 포털 전면 개편 및 온디바이스 검색 체계 가동</li>
                    <li>• 03월: 2026 대한민국 제조 AI 대도약 이니셔티브 선포</li>
                    <li>• 01월: 산업데이터 스페이스 표준화 실증센터 개소</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-start gap-6">
                <div className="w-10 h-10 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shrink-0 z-10">
                  2025
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">2025년</h3>
                  <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>• 11월: 제1회 미래스마트제조 글로벌 컨퍼런스 개최</li>
                    <li>• 07월: 스마트공장 보급 확산 5,000개사 달성 기념식</li>
                    <li>• 02월: 전국 권역별 5대 DX 지원센터 설립</li>
                  </ul>
                </div>
              </div>

              <div className="relative flex items-start gap-6">
                <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-xs shrink-0 z-10">
                  2024
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">2024년</h3>
                  <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>• 08월: 제조 특화 파운데이션 모델 실증 컨소시엄 구성</li>
                    <li>• 03월: 미래스마트산업진흥원 법인 설립 인가 및 출범</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 3: 조직도 및 담당 부서 안내 */}
        {slug === 'organization' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <h2 className="text-xl font-bold text-[#0F2C59] mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-sky-600" />
                <span>진흥원 조직 구성</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-extrabold text-[#0F2C59] mb-1">기획조정본부</div>
                  <p className="text-slate-600 text-xs">경영 전략 수립, 대외 협력 및 예산 기획 총괄</p>
                  <div className="mt-3 text-sky-700 font-semibold text-xs">연락처: 02-1234-5678</div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-extrabold text-[#0F2C59] mb-1">AI융합사업본부</div>
                  <p className="text-slate-600 text-xs">제조 현장 AI 알고리즘 실증 및 바우처 사업 운영</p>
                  <div className="mt-3 text-sky-700 font-semibold text-xs">연락처: 02-1234-5680</div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-extrabold text-[#0F2C59] mb-1">스마트제조지원센터</div>
                  <p className="text-slate-600 text-xs">스마트공장 고도화 컨설팅 및 데이터 표준화 지원</p>
                  <div className="mt-3 text-sky-700 font-semibold text-xs">연락처: 02-1234-5681</div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-extrabold text-[#0F2C59] mb-1">인재양성본부</div>
                  <p className="text-slate-600 text-xs">스마트제조 재직자 교육 및 청년 실무 아카데미 운영</p>
                  <div className="mt-3 text-sky-700 font-semibold text-xs">연락처: 02-1234-5682</div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-extrabold text-[#0F2C59] mb-1">글로벌협력실</div>
                  <p className="text-slate-600 text-xs">해외 바이어 매칭, 국제 로드쇼 참가 및 통상 협력</p>
                  <div className="mt-3 text-sky-700 font-semibold text-xs">연락처: 02-1234-5683</div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-extrabold text-[#0F2C59] mb-1">경영지원본부</div>
                  <p className="text-slate-600 text-xs">인사, 총무, 회계 및 시설·정보보안 인프라 관리</p>
                  <div className="mt-3 text-sky-700 font-semibold text-xs">연락처: 02-1234-5685</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 4: 찾아오시는 길 */}
        {slug === 'location' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <h2 className="text-xl font-bold text-[#0F2C59] mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-sky-600" />
                <span>본원 위치 안내</span>
              </h2>

              <div className="bg-slate-100 rounded-xl p-6 mb-6 text-sm text-slate-800">
                <div className="font-bold text-base text-[#0F2C59] mb-1">미래스마트산업진흥원 본원</div>
                <div>(06578) 서울특별시 서초구 반포대로 123 미래스마트산업진흥원 빌딩 3~7층</div>
                <div className="text-xs text-slate-500 mt-1">대표전화: 02-1234-5678 | 팩스: 02-1234-5679</div>
              </div>

              {/* 대중교통 안내 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-[#0F2C59] mb-3">
                    <Train className="w-5 h-5 text-sky-600" />
                    <span>지하철 이용 시</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• <strong>2호선 서초역</strong> 3번 출구 도보 5분</li>
                    <li>• <strong>3호선 교대역</strong> 8번 출구 도보 10분</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-[#0F2C59] mb-3">
                    <Bus className="w-5 h-5 text-sky-600" />
                    <span>버스 이용 시</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• 간선: 405, 740 (서초역 정류장 하차)</li>
                    <li>• 지선: 5413, 서초13, 서초21</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-[#0F2C59] mb-3">
                    <Car className="w-5 h-5 text-sky-600" />
                    <span>자가용 / 주차</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    본원 지하 1~2층 방문객 전용 주차장 완비 (방문 확인 도장 시 2시간 무료 주차 지원)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
