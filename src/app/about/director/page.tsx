import React from 'react';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  ExternalLink,
  Info,
  Calendar,
  Building,
  ArrowLeft,
} from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const metadata = {
  title: '원장 소개 | 미래스마트산업진흥원',
  description: '미래스마트산업진흥원 김범준 원장의 25년 이상 실무·교육 경력, 학술 연구(DOI 논문) 및 대외 활동 소개입니다.',
};

export default function DirectorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 타이틀 헤더 */}
      <section className="bg-gradient-to-b from-[#0F2C59] to-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-3xl">
            <UiBadge id="P03-SEC01-TIT01" name="원장 소개 타이틀 섹션" />
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>진흥원 소개로 돌아가기</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              원장 소개
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              25년 이상의 현장 실무와 직업교육을 바탕으로 미래 스마트 산업 혁신을 이끕니다.
            </p>
          </div>
        </div>
      </section>

      {/* 2. [필수] 개인 실적과 기관 실적 분리 고지문 (MOD-02, AC-05) */}
      <section className="bg-amber-50/80 border-b border-amber-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-start sm:items-center gap-3 text-xs sm:text-sm text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <p className="leading-relaxed">
              <strong>[표시 투명성 안내]</strong> 본 페이지에 수록된 학술 연구, 강의, 프로젝트 및 경력 사항은 <strong>김범준 원장 개인의 전문 이력</strong>이며, 미래스마트산업진흥원 기관 설립 이후의 고유 사업 수행 실적과 엄격히 구분하여 투명하게 공개합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 원장 프로필 기본 정보 (사진 + 학력/약력 요약) */}
      <section className="py-14 sm:py-18 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-5xl mx-auto">
            <UiBadge id="P03-SEC02-PROF01" name="원장 프로필 요약 카드" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* 프로필 아바타 / 사진 */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-[#0F2C59] via-slate-800 to-sky-700 p-1.5 shadow-xl">
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white p-6">
                    <User className="w-20 h-20 text-sky-400 mb-3" />
                    <span className="text-xs text-sky-300 font-semibold tracking-wide">미래스마트산업진흥원</span>
                    <span className="text-2xl font-black tracking-tight text-white mt-1">김 범 준</span>
                    <span className="text-xs text-slate-400 mt-1">초대 원장</span>
                  </div>
                </div>
              </div>

              {/* 기본 이력 및 학력 (MOD-01: '박사과정' 명확히 기술) */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    김범준 원장 <span className="text-base font-normal text-slate-500">(Kim Beom-Jun)</span>
                  </h2>
                  <p className="text-sm font-semibold text-[#0284C7] mt-1">
                    미래스마트산업진흥원 초대 원장 / IT 직업교육·인공지능 연구자
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  25년 이상 정보통신기술(ICT) 및 소프트웨어 개발, 인공지능 응용 분야에서 산업체 실무와 전문 인력 양성을 병행해 온 전문가입니다. 직업교육 현장에서 검증된 교육 모델과 최신 산업 AI 기술을 융합하여 미래 산업 발전에 기여하고 있습니다.
                </p>

                {/* 학력 정보 (MOD-01 준수: 박사학위와 박사과정 엄격 구분) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <span>학력 사항 (정규 학위 및 수료 과정)</span>
                  </div>
                  <ul className="text-xs sm:text-sm text-slate-700 space-y-1 pl-6 list-disc">
                    <li>
                      <strong>컴퓨터공학 박사과정 수료</strong> (인공지능 보안, IT 윤리 전공)
                    </li>
                    <li>공학 석사 학위 취득 (소프트웨어 공학)</li>
                    <li>공학사 학위 취득 (컴퓨터과학)</li>
                  </ul>
                  <p className="text-[11px] text-slate-500 pt-1">
                    ※ 학력 위조/과장 오해 방지를 위해 '박사학위 취득'이 아닌 '박사과정 수료' 상태임을 명확히 기재합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 대표 학술 연구 성과 (DOI 링크 포함, AC-13) */}
      <section className="py-14 sm:py-18 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative mb-8">
              <UiBadge id="P03-SEC03-PAPER01" name="학술 논문 및 연구 성과 섹션" />
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                <BookOpen className="w-4 h-4" />
                <span>Academic Research</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mt-1">
                대표 학술 논문 (Peer-Reviewed Papers)
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                인공지능 기술의 직업교육 적용 및 윤리적 방향성에 대한 공인 등재학술지 게재 논문입니다. (DOI 공식 링크 연결)
              </p>
            </div>

            <div className="space-y-4">
              {/* 논문 1 (지시서 4.3항) */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    2026년 발표 논문
                  </span>
                  <span className="text-xs text-slate-400">『융합과 통섭』 9(5), 309–325</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  정보기술 직업교육 전문가들의 사이버보안 인식과 방향성 탐색
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <strong>저자:</strong> 김범준 (단독)<br />
                  <strong>학술지:</strong> 『융합과 통섭』, 제9권 제5호, pp. 309–325 (2026)<br />
                  <strong>주요 내용:</strong> IT 및 AI 전문 직업교육 현장 전문가들의 실무 사이버보안 위협 인식 수준을 정량·정성적으로 분석하고, 산업 현장의 보안 역량 내재화를 위한 표준 교육 방향성을 제시함.
                </p>

                <div className="pt-2">
                  <a
                    href="https://doi.org/10.33090/SFCC.9.5.18"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-[#0F2C59] underline underline-offset-4"
                  >
                    <span>DOI 원문 열람: https://doi.org/10.33090/SFCC.9.5.18</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 논문 2 (지시서 4.3항) */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    2025년 발표 논문
                  </span>
                  <span className="text-xs text-slate-400">『융합과 통섭』 8(5), 112–130</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  생성형 인공지능 시대, IT산업의 윤리적 방향성 탐색: 저작권의 딜레마
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <strong>저자:</strong> 김범준·김찬선<br />
                  <strong>학술지:</strong> 『융합과 통섭』, 제8권 제5호, pp. 112–130 (2025)<br />
                  <strong>주요 내용:</strong> 생성형 인공지능(GenAI) 학습 데이터와 생성 산출물의 저작권 귀속 및 공정 이용(Fair Use) 기준에 관한 법제도적 딜레마를 고찰하고, 기업의 신뢰할 수 있는 AI 개발 지침을 제안함.
                </p>

                <div className="pt-2">
                  <a
                    href="https://doi.org/10.33090/SFCC.8.5.8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-[#0F2C59] underline underline-offset-4"
                  >
                    <span>DOI 원문 열람: https://doi.org/10.33090/SFCC.8.5.8</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 25년 이상 주요 실무 및 교육 경력 타임라인 */}
      <section className="py-14 sm:py-18 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative mb-10">
              <UiBadge id="P03-SEC04-CAREER01" name="주요 경력 타임라인 섹션" />
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                <Briefcase className="w-4 h-4" />
                <span>Professional Experience</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mt-1">
                주요 실무 및 직업교육 경력
              </h2>
            </div>

            <div className="space-y-6 border-l-2 border-slate-200 pl-6 sm:pl-8 ml-2 sm:ml-4">
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-sky-600 border-4 border-white shadow-xs" />
                <span className="text-xs font-bold text-sky-600">2026 ~ 현재</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">미래스마트산업진흥원 초대 원장</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  인공지능·소프트웨어 기술 실증, 산업 직업교육 체계 기획 및 산·학·연 협력 총괄
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-xs" />
                <span className="text-xs font-bold text-slate-500">2015 ~ 2025</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">소프트웨어 및 데이터 사이언스 전문 교육 총괄</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  국가기간·전략산업 직종 훈련과정 개발 및 산학 프로젝트 지도 (머신러닝, 풀스택 소프트웨어 개발)
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-xs" />
                <span className="text-xs font-bold text-slate-500">2005 ~ 2014</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">IT 기업 시스템 엔지니어링 및 기술 교육 리드</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  네트워크, 시스템 보안 아키텍처 설계 및 기업 재직자 직무 역량 강화 교육 운영
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-xs" />
                <span className="text-xs font-bold text-slate-500">1999 ~ 2004</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">소프트웨어 개발 및 초기 직업교육 현장 입문</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  상용 소프트웨어 프로그램 개발, 전산 교육장 인프라 구축 및 초급 프로그래밍 강의
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 하단 목록 복귀 링크 */}
      <section className="py-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>진흥원 소개 페이지로 돌아가기</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
