import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Program } from '@/models/Program';
import { Briefcase, ArrowRight, Calendar, Users, Filter, Search } from 'lucide-react';

interface ProgramsPageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    q?: string;
  }>;
}

export const revalidate = 60;

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const { category, status, q } = await searchParams;

  await connectToDatabase();

  const query: any = { deletedAt: null };

  if (category && category !== 'all') {
    query.category = category;
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (q && q.trim()) {
    query.$or = [
      { title: { $regex: q.trim(), $options: 'i' } },
      { summary: { $regex: q.trim(), $options: 'i' } },
      { target: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  const programs = await Program.find(query).sort({ order: 1, createdAt: -1 }).lean();

  const categories = ['전체', 'AI융합', '스마트제조', '디지털인재', '글로벌진출'];
  const statuses = [
    { key: 'all', label: '전체 상태' },
    { key: 'open', label: '접수중' },
    { key: 'upcoming', label: '접수예정' },
    { key: 'closed', label: '마감' },
  ];

  const getStatusBadge = (s: string) => {
    switch (s) {
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* 상단 브레드크럼 및 타이틀 */}
        <div className="mb-8">
          <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
            <Link href="/" className="hover:underline">홈</Link>
            <span>&gt;</span>
            <span className="text-slate-800 font-semibold">사업안내</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            사업안내
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            중소·중견기업의 제조 혁신과 AI 전환을 지원하는 진흥원의 사업 목록입니다.
          </p>
        </div>

        {/* 필터 및 검색 바 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-xs space-y-4">
          {/* 분류 탭 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> 분야별:
            </span>
            {categories.map((cat) => {
              const isSelected = (!category && cat === '전체') || category === cat;
              return (
                <Link
                  key={cat}
                  href={`/programs?${new URLSearchParams({
                    ...(cat !== '전체' ? { category: cat } : {}),
                    ...(status && status !== 'all' ? { status } : {}),
                    ...(q ? { q } : {}),
                  }).toString()}`}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#0F2C59] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* 상태별 & 검색 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-2">진행상태:</span>
              {statuses.map((st) => {
                const isSelected = (!status && st.key === 'all') || status === st.key;
                return (
                  <Link
                    key={st.key}
                    href={`/programs?${new URLSearchParams({
                      ...(category && category !== '전체' ? { category } : {}),
                      ...(st.key !== 'all' ? { status: st.key } : {}),
                      ...(q ? { q } : {}),
                    }).toString()}`}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </Link>
                );
              })}
            </div>

            {/* 검색 폼 */}
            <form method="GET" action="/programs" className="flex items-center gap-2">
              {category && category !== '전체' && <input type="hidden" name="category" value={category} />}
              {status && status !== 'all' && <input type="hidden" name="status" value={status} />}
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={q || ''}
                  placeholder="사업명 또는 지원대상 검색"
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 w-52"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
              >
                검색
              </button>
            </form>
          </div>
        </div>

        {/* 사업 목록 그리드 */}
        {programs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            검색 조건에 해당하는 사업 안내가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog: any) => (
              <div
                key={prog._id.toString()}
                className="flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-sky-300 p-6 shadow-xs hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                    {prog.category}
                  </span>
                  {getStatusBadge(prog.status)}
                </div>

                <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-2">
                  <Link href={`/programs/${prog.slug}`}>{prog.title}</Link>
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                  {prog.summary}
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 mb-5">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">대상: {prog.target}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>기간: {prog.period?.rawText || '상시'}</span>
                  </div>
                </div>

                {/* 정보 안내 링크 (신청 폼 절대 배제) */}
                <Link
                  href={`/programs/${prog.slug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-[#0F2C59] text-slate-800 hover:text-white font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5 border border-slate-200 hover:border-[#0F2C59]"
                >
                  <span>상세 안내 보기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
