import React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Award,
  GraduationCap,
  Microscope,
  ArrowRight,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const metadata = {
  title: '주요사업 | 미래스마트산업진흥원',
  description: 'AI 기술개발 실증, AI 민간자격 개발(준비 중), 전문교육 및 인재양성, 조사·연구 및 산업협력 4대 사업 안내입니다.',
};

export default function BusinessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 페이지 타이틀 헤더 */}
      <section className="bg-gradient-to-b from-[#0F2C59] to-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-3xl">
            <UiBadge id="P04-SEC01-TIT01" name="주요사업 헤더 섹션" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Our Business</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
              주요사업 안내
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              미래스마트산업진흥원은 산업 현장의 인공지능 기술 융합과 실무형 인재 양성을 위해 4대 전략 사업을 중점 추진합니다.
            </p>

            {/* 4대 앵커 점프 네비게이션 */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              <a
                href="#tech"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors"
              >
                1. AI 기술개발·실증
              </a>
              <a
                href="#qualification"
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold text-amber-300 border border-amber-400/30 transition-colors"
              >
                2. AI 민간자격 (준비 중)
              </a>
              <a
                href="#edu"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors"
              >
                3. 전문교육·인재양성
              </a>
              <a
                href="#research"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors"
              >
                4. 조사·연구·산업협력
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 섹션 1: AI 기술개발 및 실증 (#tech) */}
      <section
        id="tech"
        className="scroll-mt-24 py-16 sm:py-20 bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6">
              <UiBadge id="P04-SEC02-TECH01" name="AI 기술개발 및 실증 섹션" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-200">
                <Cpu className="w-3.5 h-3.5" />
                <span>사업 영역 01</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
                AI 기술개발 및 산업 실증
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
              제조, 물류, 서비스 등 전통 산업 현장에 최신 인공지능(AI)과 컴퓨터 비전, 데이터 분석 기술을 도입하여 생산 효율성을 극대화하고 공정 지능화를 실증합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>공정 지능화 및 품질 검사 실증</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  비전 AI 기술을 활용한 실시간 불량 판독, 설비 이상 예측 진단 모델 개발 및 현장 테스트베드 적용
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>현장 맞춤형 솔루션 컨설팅</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  중소·중견기업의 데이터 수집 환경 진단, 도입 타당성 검토 및 최적 알고리즘 추천 기술 지원
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/contact?type=coop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F2C59] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>AI 실증 사업 협력 문의하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 섹션 2: AI 민간자격 개발 (#qualification) — DEL-02, AC-04 절대 가드레일 준수 */}
      <section
        id="qualification"
        className="scroll-mt-24 py-16 sm:py-20 bg-amber-50/40 border-b border-amber-200/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6">
              <UiBadge id="P04-SEC03-QUAL01" name="AI 민간자격 개발 섹션" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3 border border-amber-200">
                <Award className="w-3.5 h-3.5" />
                <span>사업 영역 02</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
                  AI 민간자격 개발
                </h2>
                {/* 지시서 필수 표기: [준비 중] 배지 */}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                  준비 중
                </span>
              </div>
            </div>

            {/* 지시서 4.4항 지정 안내 문구 준수 */}
            <div className="p-6 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    표준 교육체계 및 자격 검정 체계 연구·기획 안내
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong>향후 국가공인 및 민간자격 기준에 맞추어 표준 교육체계를 연구·기획 중입니다.</strong>
                  </p>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    본 사업은 주무부처 정식 등록 및 인가 절차를 준비하는 단계이며, 산업 수요에 부합하는 공정하고 신뢰할 수 있는 실무 검정 기준을 마련하고 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* [절대 가드레일] 접수하기, 시험 일정, 응시료 결제, 자격증 신청 등의 버튼/링크 생성 일체 금지 */}
            <div className="pt-2">
              <Link
                href="/contact?type=coop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>자격 교육체계 연구 협력 문의하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="block text-[11px] text-slate-500 mt-2">
                ※ 현재 온라인 접수, 응시 신청 또는 결제 모듈은 운영하지 않습니다.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 섹션 3: 전문교육 및 인재양성 (#edu) */}
      <section
        id="edu"
        className="scroll-mt-24 py-16 sm:py-20 bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6">
              <UiBadge id="P04-SEC04-EDU01" name="전문교육 및 인재양성 섹션" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-200">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>사업 영역 03</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
                전문교육 및 인재양성
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
              기업 재직자의 직무 전환과 청년 구직자의 소프트웨어 역량 강화를 위해 실무 중심의 인공지능, 빅데이터, 클라우드 전문 교육 커리큘럼을 기획·운영합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>생성형 AI 및 데이터 분석 실무 과정</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  대규모 언어 모델(LLM) 프롬프트 엔지니어링, RAG 파이프라인 이해, 파이썬 기반 데이터 시각화 집중 교육
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>산업 맞춤형 방문·위탁 직무 교육</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  기업 수요 맞춤형 커리큘럼 설계, 산업 보안 및 인공지능 윤리 교육, 임직원 DX 마인드셋 제고 세미나
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/contact?type=edu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F2C59] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>전문 교육 위탁 문의하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 섹션 4: 조사·연구 및 산업협력 (#research) */}
      <section
        id="research"
        className="scroll-mt-24 py-16 sm:py-20 bg-slate-50 border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6">
              <UiBadge id="P04-SEC05-RES01" name="조사·연구 및 산업협력 섹션" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-3 border border-teal-200">
                <Microscope className="w-3.5 h-3.5" />
                <span>사업 영역 04</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
                조사·연구 및 산업협력
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
              국내외 스마트 산업 기술 트렌드와 관련 정책·법제도를 심층 연구하고, 산·학·연 전문가 교류를 통해 현장 중심의 정책 제언과 산학 협력을 활성화합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-xl bg-white border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>스마트 산업 기술 및 정책 학술 연구</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  인공지능 저작권, 직업교육 사이버보안 인식 조사 등 공인 등재학술지 논문 발표 및 정책 보고서 발간
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200/80">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>산·학·연 파트너십 네트워크 구축</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  학술 연구단체, 대학교육기관, 산업체와의 기술 교류 포럼 및 공동 프로젝트 컨소시엄 지원
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/contact?type=coop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F2C59] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                <Mail className="w-4 h-4" />
                <span>공동 연구 및 제휴 문의하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
