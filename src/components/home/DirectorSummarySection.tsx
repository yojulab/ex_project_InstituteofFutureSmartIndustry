import React from 'react';
import Link from 'next/link';
import { User, Award, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const DirectorSummarySection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm overflow-hidden">
          <UiBadge id="P01-SEC04-DIR01" name="원장 프로필 요약 섹션" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 좌측: 원장 프로필 아바타 / 사진 영역 */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-[#0F2C59] via-slate-800 to-sky-700 p-1 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-slate-800 flex flex-col items-center justify-center text-white p-4">
                  <User className="w-16 h-16 text-sky-400 mb-2" />
                  <span className="text-xs text-sky-300 font-medium">미래스마트산업진흥원</span>
                  <span className="text-lg font-extrabold text-white">원장 김범준</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900">김범준 원장</h3>
                <p className="text-xs text-slate-500 mt-1">25년 이상 AI·소프트웨어 실무 및 직업교육 전문가</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                  컴퓨터공학 박사과정
                </div>
              </div>
            </div>

            {/* 우측: 핵심 경력 및 학술 활동 요약 (MOD-01, MOD-02 분리 고지) */}
            <div className="lg:col-span-8 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">Leadership & Research</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mt-1">
                  현장 실무와 학술 연구를 잇는 디지털 혁신 리더십
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  25년 이상의 정보기술 실무 및 직업교육 현장 경험을 바탕으로, 제조 현장과 중소기업의 실질적인 인공지능 전환(AX)과 전문 인력 양성에 앞장서고 있습니다.
                </p>
              </div>

              {/* 핵심 역량 3대 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <span>학력 및 전문분야</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    컴퓨터공학 박사과정<br />
                    AI 보안 및 정보윤리 연구
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>실무 및 교육 경력</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    25년 이상 IT 전문 직업교육<br />
                    소프트웨어 인재양성 총괄
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>대표 학술 연구</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    『융합과 통섭』 사이버보안(2026)<br />
                    생성형 AI 윤리 및 저작권(2025)
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about/director"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F2C59] hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all hover:translate-x-0.5"
                >
                  <span>원장 소개 상세 보기</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="block sm:inline sm:ml-4 mt-2 sm:mt-0 text-xs text-slate-400">
                  ※ 원장 개인의 경력·학술 성과는 기관 실적과 구분 표기됩니다.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DirectorSummarySection;
