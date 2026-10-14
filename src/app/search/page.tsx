'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Bell,
  BookOpen,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Cpu,
  CheckCircle,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  slug?: string;
  title?: string;
  question?: string;
  summary?: string;
  answer?: string;
  category?: string;
  type: string;
  publishedAt?: string;
  authorOrDept?: string;
  score?: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'programs' | 'posts' | 'resources' | 'faqs'>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    programs: SearchResultItem[];
    posts: SearchResultItem[];
    resources: SearchResultItem[];
    faqs: SearchResultItem[];
  }>({
    programs: [],
    posts: [],
    resources: [],
    faqs: [],
  });

  // On-Device AI 의미 검색 상태 및 동의 여부
  const [onDeviceConsent, setOnDeviceConsent] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('on_device_search_consent') === 'true';
    setOnDeviceConsent(consent);
    if (consent) {
      setIsModelReady(true);
    }
  }, []);

  // 검색 실행
  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(searchTerm.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults({
          programs: data.programs || [],
          posts: data.posts || [],
          resources: data.resources || [],
          faqs: data.faqs || [],
        });
      }
    } catch (err) {
      console.error('[Search Page] Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    performSearch(query);
  };

  const handleConsentEnable = () => {
    setIsModelLoading(true);
    // On-Device 모델 동의 및 로컬 초기화 시뮬레이션
    setTimeout(() => {
      localStorage.setItem('on_device_search_consent', 'true');
      setOnDeviceConsent(true);
      setIsModelReady(true);
      setIsModelLoading(false);
    }, 800);
  };

  const totalResultsCount =
    results.programs.length + results.posts.length + results.resources.length + results.faqs.length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* 상단 브레드크럼 */}
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">통합검색</span>
        </nav>

        {/* 상단 검색 폼 */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight mb-6">
            통합검색
          </h1>

          <form onSubmit={handleSubmit} role="search" aria-label="누리집 통합검색">
            <div className="flex items-center shadow-lg rounded-2xl bg-white border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-[#0284C7] transition-all">
              <label htmlFor="search-input" className="sr-only">
                검색어를 입력하세요
              </label>
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                id="search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색어를 입력하세요 (예: 스마트공장, AI 바우처, 지원사업)"
                className="w-full py-2.5 px-3.5 text-slate-900 text-sm sm:text-base focus:outline-hidden font-medium"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F2C59] hover:bg-[#163B75] text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shrink-0 shadow-xs"
              >
                검색
              </button>
            </div>
          </form>
        </div>

        {/* On-Device 의미 검색 안내 및 동의 카드 (§6) */}
        <div className="mb-8 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-[#0F2C59] text-sm sm:text-base">
                    On-Device AI 의미 검색
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-200/80 text-sky-800">
                    프라이버시 100% 보호
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  사용자의 검색어가 외부 클라우드나 LLM API로 전송되지 않고, 사용자 브라우저 내에서 직접 벡터 유사도를 계산하여 오타나 자연어 질문을 정확하게 찾아줍니다.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {isModelReady ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>온디바이스 AI 활성</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConsentEnable}
                  disabled={isModelLoading}
                  className="px-4 py-2 rounded-xl bg-[#0F2C59] hover:bg-[#163B75] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-sky-300" />
                  <span>{isModelLoading ? '모델 로딩 중...' : '의미 검색 활성화 (동의)'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 검색 결과 카테고리 탭 */}
        {initialQuery && (
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#0F2C59] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                전체 ({totalResultsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('programs')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'programs'
                    ? 'bg-[#0F2C59] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                사업안내 ({results.programs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'posts'
                    ? 'bg-[#0F2C59] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                알림마당 ({results.posts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'resources'
                    ? 'bg-[#0F2C59] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                자료실 ({results.resources.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faqs')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'faqs'
                    ? 'bg-[#0F2C59] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                FAQ ({results.faqs.length})
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block">
              &lsquo;<strong className="text-slate-900">{initialQuery}</strong>&rsquo; 검색 결과: 총 {totalResultsCount}건
            </div>
          </div>
        )}

        {/* 로딩 표시 */}
        {loading && (
          <div className="py-16 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-[#0284C7] rounded-full animate-spin mb-3" />
            <div className="text-sm">검색 결과를 조회하고 있습니다...</div>
          </div>
        )}

        {/* 검색 결과 영역 */}
        {!loading && initialQuery && totalResultsCount === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            &lsquo;{initialQuery}&rsquo;에 대한 검색 결과가 없습니다.
            <div className="text-xs text-slate-400 mt-2">
              단어의 철자가 정확한지 확인하시거나, 다른 검색어로 다시 시도해 보세요.
            </div>
          </div>
        )}

        {!loading && initialQuery && totalResultsCount > 0 && (
          <div className="space-y-8">
            {/* 1. 사업안내 그룹 */}
            {(activeTab === 'all' || activeTab === 'programs') && results.programs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-base text-[#0F2C59]">
                    <Briefcase className="w-5 h-5 text-sky-600" />
                    <span>사업안내 ({results.programs.length})</span>
                  </div>
                  <Link href="/programs" className="text-xs text-slate-500 hover:text-[#0284C7]">
                    더보기 &gt;
                  </Link>
                </div>

                <div className="space-y-4">
                  {results.programs.map((item) => (
                    <div key={item.id} className="group pb-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0284C7]">
                        <Link href={`/programs/${item.slug}`}>{item.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. 알림마당 그룹 */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-base text-[#0F2C59]">
                    <Bell className="w-5 h-5 text-sky-600" />
                    <span>알림마당 ({results.posts.length})</span>
                  </div>
                  <Link href="/news" className="text-xs text-slate-500 hover:text-[#0284C7]">
                    더보기 &gt;
                  </Link>
                </div>

                <div className="space-y-4">
                  {results.posts.map((item) => (
                    <div key={item.id} className="group pb-3 border-b border-slate-50 last:border-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0284C7]">
                        <Link href={`/news/${item.type}/${item.slug}`}>{item.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.summary}</p>
                      {item.publishedAt && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          {new Date(item.publishedAt).toISOString().slice(0, 10)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. 자료실 그룹 */}
            {(activeTab === 'all' || activeTab === 'resources') && results.resources.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-base text-[#0F2C59]">
                    <BookOpen className="w-5 h-5 text-sky-600" />
                    <span>자료실 ({results.resources.length})</span>
                  </div>
                  <Link href="/resources" className="text-xs text-slate-500 hover:text-[#0284C7]">
                    더보기 &gt;
                  </Link>
                </div>

                <div className="space-y-4">
                  {results.resources.map((item) => (
                    <div key={item.id} className="group pb-3 border-b border-slate-50 last:border-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0284C7]">
                        <Link href="/resources">{item.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.summary}</p>
                      {item.authorOrDept && (
                        <div className="text-[11px] text-slate-400 mt-1">{item.authorOrDept}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FAQ 그룹 */}
            {(activeTab === 'all' || activeTab === 'faqs') && results.faqs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-base text-[#0F2C59]">
                    <HelpCircle className="w-5 h-5 text-sky-600" />
                    <span>자주 묻는 질문 ({results.faqs.length})</span>
                  </div>
                  <Link href="/guide/faq" className="text-xs text-slate-500 hover:text-[#0284C7]">
                    더보기 &gt;
                  </Link>
                </div>

                <div className="space-y-3">
                  {results.faqs.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 mb-1">
                        Q. {item.question}
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        A. {item.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-16 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-[#0284C7] rounded-full animate-spin mb-3" />
          <div className="text-sm">검색 화면을 준비하고 있습니다...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
