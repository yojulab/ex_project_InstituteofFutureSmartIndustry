'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSearchProps {
  visionStatement?: string;
  heroSubText?: string;
  popularKeywords?: string[];
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  visionStatement = '대한민국 미래 스마트 제조 및 AI 혁신 생태계를 선도합니다',
  heroSubText = '중소·중견기업의 AI 디지털 전환과 미래 신산업 육성을 전방위 지원합니다',
  popularKeywords = ['스마트공장', 'AI 바우처', '제조데이터', '인재양성', '글로벌진출', '지원사업'],
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeywordClick = (kw: string) => {
    router.push(`/search?q=${encodeURIComponent(kw)}`);
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-[#0F2C59] to-[#0A1E3D] text-white py-16 sm:py-24 px-4 sm:px-8 overflow-hidden">
      {/* 배경 장식 그리드 패턴 */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-6">
        {/* 태그 뱃지 */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs sm:text-sm font-semibold tracking-wide">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>미래스마트산업진흥원 공식 포털</span>
        </div>

        {/* 비전 타이틀 */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          {visionStatement}
        </h1>

        {/* 서브 텍스트 */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          {heroSubText}
        </p>

        {/* 중앙 통합 검색바 */}
        <form
          onSubmit={handleSearch}
          className="pt-4 max-w-2xl mx-auto"
          role="search"
          aria-label="누리집 통합검색"
        >
          <div className="relative flex items-center shadow-2xl rounded-2xl bg-white p-1.5 focus-within:ring-4 focus-within:ring-sky-400/50 transition-all">
            <label htmlFor="hero-search-input" className="sr-only">
              검색어를 입력하세요
            </label>
            <div className="pl-4 text-slate-400">
              <Search className="w-6 h-6 text-slate-400" />
            </div>

            <input
              id="hero-search-input"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="사업 공고, 통계 자료, 보도자료를 검색해 보세요"
              className="w-full py-3.5 px-3.5 text-slate-900 text-base sm:text-lg placeholder:text-slate-400 focus:outline-hidden font-medium"
            />

            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-[#0F2C59] to-[#0284C7] hover:from-[#163B75] hover:to-[#0369A1] text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              <span>검색</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* 추천/인기 검색어 태그 */}
        {popularKeywords.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-300">
            <span className="font-semibold text-sky-300">추천 검색어:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleKeywordClick(kw)}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10 hover:border-white/30"
              >
                #{kw}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSearch;
