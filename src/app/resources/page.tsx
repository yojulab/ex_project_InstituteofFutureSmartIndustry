import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Resource } from '@/models/Resource';
import { BookOpen, Download, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResourcesPageProps {
  searchParams: Promise<{
    kind?: string;
    q?: string;
    page?: string;
  }>;
}

export const revalidate = 60;

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const { kind, q = '', page = '1' } = await searchParams;

  await connectToDatabase();

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 9;

  const query: any = { deletedAt: null };

  if (kind && kind !== 'all') {
    query.kind = kind;
  }

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

  const kinds = [
    { key: 'all', label: '전체 자료' },
    { key: 'publication', label: '간행물·보고서' },
    { key: 'statistics', label: '통계·동향' },
    { key: 'regulation', label: '법령·규정' },
  ];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getKindLabel = (k: string) => {
    switch (k) {
      case 'publication':
        return '간행물·보고서';
      case 'statistics':
        return '통계·동향';
      case 'regulation':
        return '법령·규정';
      default:
        return '자료';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">자료실</span>
        </nav>

        {/* 상단 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            자료실
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            미래스마트산업진흥원이 발간한 연구 보고서, 통계 자료집 및 관련 법령 정보를 제공합니다.
          </p>
        </div>

        {/* 서브 탭 & 검색 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {kinds.map((item) => {
              const isSelected = (!kind && item.key === 'all') || kind === item.key;
              return (
                <Link
                  key={item.key}
                  href={`/resources?${new URLSearchParams({
                    ...(item.key !== 'all' ? { kind: item.key } : {}),
                    ...(q ? { q } : {}),
                  }).toString()}`}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-[#0F2C59] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <form method="GET" action="/resources" className="flex items-center gap-2">
            {kind && kind !== 'all' && <input type="hidden" name="kind" value={kind} />}
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="자료명 또는 부서 검색"
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 w-52 shadow-xs"
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
            검색 조건에 해당하는 자료가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((item: any) => {
              const firstAtt = item.attachments?.[0];
              return (
                <div
                  key={item._id.toString()}
                  className="flex flex-col bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-sky-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700">
                      {getKindLabel(item.kind)}
                    </span>
                    <time className="text-xs text-slate-400" dateTime={item.publishedAt}>
                      {new Date(item.publishedAt).toISOString().slice(0, 10)}
                    </time>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h2>

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
          <div className="flex items-center justify-center gap-2 mt-8">
            <Link
              href={`/resources?page=${Math.max(1, currentPage - 1)}${kind ? `&kind=${kind}` : ''}${q ? `&q=${q}` : ''}`}
              className={`p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 ${
                currentPage === 1 ? 'pointer-events-none opacity-40' : ''
              }`}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <span className="text-xs sm:text-sm font-semibold px-4 text-slate-700">
              {currentPage} / {totalPages}
            </span>

            <Link
              href={`/resources?page=${Math.min(totalPages, currentPage + 1)}${kind ? `&kind=${kind}` : ''}${q ? `&q=${q}` : ''}`}
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
