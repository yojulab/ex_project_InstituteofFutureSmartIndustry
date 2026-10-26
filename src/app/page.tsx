import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Building2, BookOpen, GraduationCap, Network } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 대표 히어로 섹션 */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 text-center">
          <UiBadge id="P01-SEC01-HERO01" name="메인 히어로 비전 섹션" />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>비영리 공공 목적 전문 단체</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            AI와 디지털 기술로<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-300">
              미래산업의 변화
            </span>를 준비합니다.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            미래스마트산업진흥원은 인공지능·소프트웨어 분야의 조사·연구와 교육, 전문인력 양성, 기술 활용 및 산업 교류·협력을 추진하는 비영리 목적의 전문단체입니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
            >
              진흥원 소개 바로가기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/business"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              주요사업 안내
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
