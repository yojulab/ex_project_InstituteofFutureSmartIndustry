import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Users, Building, Layers } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export interface ProgramItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  target: string;
  status: 'open' | 'upcoming' | 'closed';
  periodText: string;
  department: string;
}

interface FeaturedProgramsProps {
  programs: ProgramItem[];
}

export const FeaturedPrograms: React.FC<FeaturedProgramsProps> = ({ programs }) => {
  const getStatusBadge = (status: 'open' | 'upcoming' | 'closed') => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            접수중
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            접수예정
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            마감
          </span>
        );
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16" aria-labelledby="featured-programs-heading">
      <UiBadge id="P01-SEC04-PRG00" name="진흥원 주요 지원사업 안내 영역" />
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-[#0284C7]" />
            <span className="text-sm font-bold text-[#0284C7] tracking-wider uppercase">Key Initiatives</span>
          </div>
          <h2 id="featured-programs-heading" className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59]">
            진흥원 주요 지원사업 안내
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            중소·중견기업의 AI 디지털 전환과 기술 고도화를 지원하는 핵심 사업입니다.
          </p>
        </div>

        <Link
          href="/programs"
          className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors group shrink-0"
        >
          <UiBadge id="P01-SEC04-BTN01" name="전체 사업보기 링크" />
          <span>전체 사업보기</span>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((prog, idx) => (
          <div
            key={prog.id}
            className="relative flex flex-col bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 p-6 shadow-xs hover:shadow-lg transition-all duration-200 group"
          >
            <UiBadge id={`P01-SEC04-CRD0${idx + 1}`} name={`지원사업 카드: ${prog.title}`} />
            {/* 상단 뱃지: 분류 & 상태 */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                {prog.category}
              </span>
              {getStatusBadge(prog.status)}
            </div>

            {/* 사업명 */}
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-2">
              <Link href={`/programs/${prog.slug}`}>{prog.title}</Link>
            </h3>

            {/* 사업 요약 */}
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
              {prog.summary}
            </p>

            {/* 메타 정보 (대상, 기간) */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500 mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">지원 대상: {prog.target}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>접수 기간: {prog.periodText}</span>
              </div>
            </div>

            {/* 상세 안내 링크 (신청 폼 절대 배제) */}
            <Link
              href={`/programs/${prog.slug}`}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#0F2C59] text-slate-800 hover:text-white font-bold text-xs sm:text-sm text-center transition-colors flex items-center justify-center gap-1.5 border border-slate-200 hover:border-[#0F2C59]"
            >
              <span>상세 안내 보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPrograms;
