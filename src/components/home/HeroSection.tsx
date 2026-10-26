import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-28 bg-gradient-to-b from-[#0F2C59] via-slate-900 to-slate-900 text-white overflow-hidden">
      {/* 배경 장식 패턴 */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 text-center">
        <UiBadge id="P01-SEC01-HERO01" name="메인 히어로 비전 섹션" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>비영리 목적의 공익 전문단체</span>
        </div>

        {/* 지시서 지정 타이틀 (원문 100% 일치) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto mb-6 text-white">
          AI와 디지털 기술로<br className="hidden sm:inline" />{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">
            미래산업의 변화
          </span>를 준비합니다.
        </h1>

        {/* 지시서 지정 서술 (원문 100% 일치) */}
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          미래스마트산업진흥원은 인공지능·소프트웨어 분야의 조사·연구와 교육, 전문인력 양성, 기술 활용 및 산업 교류·협력을 추진하는 비영리 목적의 전문단체입니다.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-sky-400"
          >
            <span>진흥원 소개 바로가기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/business"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all focus:outline-hidden focus:ring-2 focus:ring-slate-400"
          >
            <span>주요사업 전체보기</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
