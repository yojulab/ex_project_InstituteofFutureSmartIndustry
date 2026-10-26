import React from 'react';
import Link from 'next/link';
import {
  Building2,
  FileText,
  UserCheck,
  Cpu,
  GraduationCap,
  Microscope,
  Award,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const metadata = {
  title: '진흥원 소개 | 미래스마트산업진흥원',
  description: 'AI와 디지털 기술로 미래산업의 변화를 준비하는 비영리 공익 전문단체 미래스마트산업진흥원 소개입니다.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 페이지 타이틀 헤더 */}
      <section className="bg-gradient-to-b from-[#0F2C59] to-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-3xl">
            <UiBadge id="P02-SEC01-TIT01" name="진흥원 소개 타이틀 섹션" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">About Institute</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
              미래스마트산업진흥원 소개
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              인공지능과 디지털 전환(DX)을 바탕으로 산업의 고도화를 촉진하고, 전문 인재를 양성하여 지속 가능한 산업 생태계를 구축하는 비영리 목적의 전문단체입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 2. 설립 취지 및 비영리 공익성 안내 (지시서 4.2 준수: 미승인 법적 지위 단정 표현 배제) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
              <UiBadge id="P02-SEC02-PURP01" name="설립 취지 및 성격 섹션" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
                설립 취지 및 기관 성격
              </h2>
            </div>

            <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                오늘날 전 세계 산업계는 생성형 인공지능(AI), 클라우드, 데이터 기반의 급격한 기술 혁신을 경험하고 있으며, 제조업과 서비스업 전반에 걸친 디지털 전환(DX)은 국가와 기업의 생존을 결정짓는 핵심 과제로 부상하였습니다.
              </p>
              <p>
                <strong>미래스마트산업진흥원</strong>은 인공지능·소프트웨어 분야의 조사·연구, 산업 현장 중심의 전문인력 양성, 기술 실증 및 산업 교류·협력을 체계적으로 추진하기 위하여 설립된 비영리 목적의 공익 전문단체입니다.
              </p>
              <p>
                본원은 고유목적사업의 수행을 통해 산업 현장의 기술 격차를 해소하고, 중소·중견기업의 실질적인 AI 전환(AX)을 촉진하며, 건전하고 신뢰성 있는 미래 스마트 산업 생태계를 조성하는 데 기여하고자 합니다.
              </p>
            </div>

            {/* 비영리성 및 운영 원칙 박스 */}
            <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F2C59]">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <span>투명하고 공정한 기관 운영 원칙</span>
              </div>
              <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc list-inside">
                <li>본원의 수익과 재산은 고유목적사업 및 운영을 위해서만 사용되며 구성원에게 이익을 분배하지 않습니다.</li>
                <li>공공성과 공익성을 최우선으로 하여 산업 현장과 교육 수요자의 권익을 보호합니다.</li>
                <li>학술 연구 및 교육 실적은 사실에 근거하여 투명하게 공개합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 진흥원 4대 핵심 역할 */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <UiBadge id="P02-SEC03-ROLE01" name="4대 핵심 역할 섹션" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
              진흥원 4대 핵심 역할
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              미래 스마트 산업의 도약과 인재 양성을 위해 집중 추진하는 4대 활동 영역입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* 역할 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. AI 기술개발 및 산업 실증 지원</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                제조·물류·서비스 등 산업 현장에 인공지능 솔루션을 접목하여 공정 자동화, 품질 예측, 에너지 최적화 등 실증 과제를 발굴하고 현장 적용을 지원합니다.
              </p>
            </div>

            {/* 역할 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">2. AI 민간자격 및 교육체계 연구</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">준비 중</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                산업 현장이 요구하는 실무 역량을 표준화하여 공인 수준의 교육과정과 AI 직무 평가 체계를 연구·기획하고 있습니다. (주무부처 등록 및 공인 절차 준비 중)
              </p>
            </div>

            {/* 역할 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. 실무 중심 전문교육 및 인재양성</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                재직자의 직무 전환과 청년 구직자의 소프트웨어 역량 강화를 위해 파이썬 프로그래밍, 데이터 분석, 최신 생성형 AI 응용 실습 교육을 운영합니다.
              </p>
            </div>

            {/* 역할 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. 조사·연구 및 산·학·연 협력</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                미래 기술 트렌드와 산업 규제 및 정책 방향성을 심층 조사·분석하여 학술 연구를 진행하고, 학계 및 산업계 간 지속 가능한 교류 생태계를 마련합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 공개용 정관 열람 및 원장 소개 링크 섹션 (지시서 4.2 준수, AC-11) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 정관 PDF 카드 */}
            <div className="relative p-7 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <UiBadge id="P02-SEC04-DOC01" name="공개용 정관 다운로드/열람" />
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">공개용 정관 열람</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  진흥원의 설립 목적, 조직 구성, 재정 원칙 및 총회 규정을 명시한 공식 정관입니다. (개인정보 보호를 위해 임원 명부 및 서명란은 제외된 공람용 사본입니다.)
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="/docs/articles-public.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>공개용 정관(PDF) 열람하기</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>

            {/* 원장 소개 이동 카드 */}
            <div className="relative p-7 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between">
              <UiBadge id="P02-SEC04-DIR01" name="원장 소개 링크 카드" />
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">진흥원장 소개</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  25년 이상 정보기술 실무 및 직업교육 현장을 이끌어 온 김범준 원장의 약력, 학술 연구 성과(DOI 논문), 대외 활동 내역을 상세히 확인하실 수 있습니다.
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href="/about/director"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-sky-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <span>원장 소개 상세 보기</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
