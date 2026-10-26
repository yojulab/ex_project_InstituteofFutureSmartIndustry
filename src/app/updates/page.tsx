import React from 'react';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/queries/posts';
import { Calendar, Search, ArrowRight, BookOpen, ExternalLink, FileText } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

interface UpdatesPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    q?: string;
  }>;
}

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'notice', label: '공지사항' },
  { key: 'activity', label: '기관 활동·보도' },
  { key: 'paper', label: '학술논문' },
  { key: 'director', label: '원장 대외활동' },
];

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  notice: { label: '공지사항', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  activity: { label: '기관 활동·보도', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paper: { label: '학술논문', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  director: { label: '원장 대외활동', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export const metadata = {
  title: '소식·성과 | 미래스마트산업진흥원',
  description: '미래스마트산업진흥원의 공지사항, 기관 활동 및 언론 보도, 학술 연구 논문, 원장 대외활동 소식입니다.',
};

export default async function UpdatesPage({ searchParams }: UpdatesPageProps) {
  const params = await searchParams;
  const currentCategory = params.category || 'all';
  const currentPage = parseInt(params.page || '1', 10) || 1;
  const searchQuery = params.q || '';

  const { posts, total, totalPages } = await getPublishedPosts({
    category: currentCategory,
    page: currentPage,
    limit: 10,
    q: searchQuery,
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 타이틀 헤더 */}
      <section className="bg-gradient-to-b from-[#0F2C59] to-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-3xl">
            <UiBadge id="P05-SEC01-TIT01" name="소식·성과 헤더 섹션" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">News & Updates</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
              소식·성과
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              미래스마트산업진흥원의 주요 공지사항, 활동 소식 및 학술 성과를 투명하게 공개합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 2. 카테고리 탭 및 검색 바 */}
      <section className="bg-white border-b border-slate-200 sticky top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            {/* 4대 카테고리 탭 필터 (지시서 4.5항 준수) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" aria-label="게시물 카테고리 탭">
              {CATEGORIES.map((cat) => {
                const isActive = currentCategory === cat.key;
                const href =
                  cat.key === 'all'
                    ? `/updates${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`
                    : `/updates?category=${cat.key}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;

                return (
                  <Link
                    key={cat.key}
                    href={href}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#0F2C59] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {/* 통합게시판 내 키워드 검색 */}
            <form method="GET" action="/updates" className="relative flex items-center">
              {currentCategory !== 'all' && (
                <input type="hidden" name="category" value={currentCategory} />
              )}
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="게시물 제목/내용 검색"
                className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            </form>
          </div>
        </div>
      </section>

      {/* 3. 게시물 목록 */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            {/* 총 건수 안내 */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
              <span>총 <strong>{total}</strong>건의 게시물이 등록되어 있습니다.</span>
              {searchQuery && (
                <span>
                  &apos;{searchQuery}&apos; 검색 결과 (
                  <Link href={`/updates?category=${currentCategory}`} className="text-sky-600 underline">
                    초기화
                  </Link>
                  )
                </span>
              )}
            </div>

            {/* 데이터가 0건일 때 (DEL-06: 가상 데이터 금지 안내) */}
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-700">등록된 게시물이 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">
                  선택하신 분류에 승인된 공개 게시물이 없거나 검색 결과가 존재하지 않습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, idx) => {
                  const catStyle = CATEGORY_STYLES[post.category] || {
                    label: post.category,
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                  };
                  const displayDate = post.eventDate
                    ? new Date(post.eventDate).toLocaleDateString('ko-KR')
                    : new Date(post.createdAt).toLocaleDateString('ko-KR');

                  return (
                    <article
                      key={post.id}
                      className="group bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catStyle.color}`}>
                            {catStyle.label}
                          </span>
                          {post.isFeatured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              메인 노출
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                            <Calendar className="w-3.5 h-3.5" />
                            {displayDate}
                          </span>
                        </div>

                        <Link href={`/updates/${post.slug || post.id}`} className="block">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors leading-snug">
                            {post.title}
                          </h2>
                        </Link>

                        {post.summary && (
                          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {post.summary}
                          </p>
                        )}

                        {/* 논문 메타데이터 미리보기 */}
                        {post.category === 'paper' && post.journal && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-purple-700 bg-purple-50/60 px-3 py-1.5 rounded-lg border border-purple-100">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>
                              {post.journal} {post.volumeIssuePages && `(${post.volumeIssuePages})`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0284C7]">
                        <Link href={`/updates/${post.slug || post.id}`} className="hover:underline flex items-center gap-1">
                          <span>게시물 상세 보기</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {post.doi && (
                          <a
                            href={post.doi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
                          >
                            <span>DOI 원문 링크</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* 4. 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isCurrent = pageNum === currentPage;
                  const pageHref = `/updates?category=${currentCategory}&page=${pageNum}${
                    searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''
                  }`;

                  return (
                    <Link
                      key={pageNum}
                      href={pageHref}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                        isCurrent
                          ? 'bg-[#0F2C59] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
