import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Resource } from '@/models/Resource';
import { BookOpen, Download, FileText, Search, ChevronLeft, ChevronRight, FileCheck2 } from 'lucide-react';

interface ResourcesKindPageProps {
  params: Promise<{
    kind: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export const revalidate = 60;

// URL slug <-> DB kind 매핑
const KIND_MAP: Record<string, { dbKey: string; label: string; desc: string }> = {
  publications: {
    dbKey: 'publication',
    label: '간행물·보고서',
    desc: '산업 동향 분석 보고서 및 진흥원 정기 발간물을 열람하고 다운로드하실 수 있습니다.',
  },
  publication: {
    dbKey: 'publication',
    label: '간행물·보고서',
    desc: '산업 동향 분석 보고서 및 진흥원 정기 발간물을 열람하고 다운로드하실 수 있습니다.',
  },
  statistics: {
    dbKey: 'statistics',
    label: '통계·동향',
    desc: '국내외 스마트제조 및 AI 전환 실태조사 통계 데이터를 제공합니다.',
  },
  regulations: {
    dbKey: 'regulation',
    label: '법령·규정',
    desc: '진흥원 정관, 업무 규정 및 산업 관련 주요 법령을 확인하실 수 있습니다.',
  },
  regulation: {
    dbKey: 'regulation',
    label: '법령·규정',
    desc: '진흥원 정관, 업무 규정 및 산업 관련 주요 법령을 확인하실 수 있습니다.',
  },
};

const TABS = [
  { slug: 'all', href: '/resources', label: '전체 자료' },
  { slug: 'publications', href: '/resources/publications', label: '간행물·보고서' },
  { slug: 'statistics', href: '/resources/statistics', label: '통계·동향' },
  { slug: 'regulations', href: '/resources/regulations', label: '법령·규정' },
];

export default async function ResourcesKindPage({ params, searchParams }: ResourcesKindPageProps) {
  const { kind: slugKind } = await params;
  const { q = '', page = '1' } = await searchParams;

  const currentKindInfo = KIND_MAP[slugKind.toLowerCase()];
  if (!currentKindInfo) {
    redirect('/resources');
  }

  await connectToDatabase();

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 9;

  const query: any = {
    deletedAt: null,
    kind: currentKindInfo.dbKey,
  };

  if (q.trim()) {
    query.$or = [
      { title: { $regex: q.trim(), $options: 'i' } },
      { summary: { $regex: q.trim(), $options: 'i' } },
      { authorOrDept: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  const [totalCount, resources] = await Promise.all([
    Resource.countDocuments(query),
    Resource.find(query)
      .sort({ publishedAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const canonicalSlug =
    slugKind.toLowerCase() === 'publication'
      ? 'publications'
      : slugKind.toLowerCase() === 'regulation'
      ? 'regulations'
      : slugKind.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <Link href="/resources" className="hover:underline">자료실</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">{currentKindInfo.label}</span>
        </nav>

        {/* 상단 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            자료실 — {currentKindInfo.label}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {currentKindInfo.desc}
          </p>
        </div>

        {/* 서브 탭 & 검색 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => {
              const isSelected = tab.slug === canonicalSlug;
              return (
                <Link
                  key={tab.slug}
                  href={`${tab.href}${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-[#0F2C59] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <form method="GET" action={`/resources/${canonicalSlug}`} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder={`${currentKindInfo.label} 내 검색`}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 w-56 shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
            >
              검색
            </button>
          </form>
        </div>

        {/* 자료 그리드 */}
        {resources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            등록된 자료가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((item: any) => {
              const firstAtt = item.attachments?.[0];
              const publishedDateStr = item.publishedAt
                ? new Date(item.publishedAt).toISOString().slice(0, 10)
                : '';

              return (
                <div
                  key={item._id.toString()}
                  className="flex flex-col bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-sky-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700">
                      {currentKindInfo.label}
                    </span>
                    {publishedDateStr && (
                      <time className="text-xs text-slate-400" dateTime={publishedDateStr}>
                        {publishedDateStr}
                      </time>
                    )}
                  </div>

                  <Link href={`/resources/${canonicalSlug}/${item._id.toString()}`} className="group-hover:text-[#0284C7] transition-colors">
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-6 flex-1">
                    {item.summary}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">{item.authorOrDept}</span>

                    {firstAtt?.url ? (
                      <a
                        href={firstAtt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F2C59] hover:text-white font-semibold text-slate-700 transition-colors shrink-0"
                        aria-label={`${item.title} 첨부파일 다운로드`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>다운로드 {firstAtt.size ? `(${formatFileSize(firstAtt.size)})` : ''}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">원문 없음</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Link
              href={`/resources/${canonicalSlug}?page=${Math.max(1, currentPage - 1)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 ${
                currentPage === 1 ? 'pointer-events-none opacity-40' : ''
              }`}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <span className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>

            <Link
              href={`/resources/${canonicalSlug}?page=${Math.min(totalPages, currentPage + 1)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 ${
                currentPage === totalPages ? 'pointer-events-none opacity-40' : ''
              }`}
              aria-label="다음 페이지"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
