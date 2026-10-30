import React from 'react';
import Link from 'next/link';
import { getPublishedCourses } from '@/lib/queries/courses';
import {
  GraduationCap,
  Search,
  Video,
  FileText,
  Calendar,
  User,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const dynamic = 'force-dynamic';

interface LecturesPageProps {
  searchParams: Promise<{
    category?: string;
    type?: string;
    page?: string;
    q?: string;
  }>;
}

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'ai', label: '인공지능·IT' },
  { key: 'beauty', label: '스마트뷰티·미용' },
  { key: 'vocational', label: '직업교육·자격' },
  { key: 'etc', label: '기타' },
];

const TYPES = [
  { key: 'all', label: '전체 형태' },
  { key: 'video', label: '동영상 강좌 (KOCW형)' },
  { key: 'markdown', label: '텍스트 강좌 (노션MD)' },
];

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  ai: { label: '인공지능·IT', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  beauty: { label: '스마트뷰티·미용', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  vocational: { label: '직업교육·자격', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  etc: { label: '기타', color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export const metadata = {
  title: '온라인 강좌 | 미래스마트산업진흥원',
  description:
    '미래스마트산업진흥원의 KOCW형 차시별 유튜브 강의 및 노션 마크다운(MD) 교육 아카이브입니다. 인공지능, 스마트뷰티, 직업교육 등 다양한 실무 강의를 제공합니다.',
};

export default async function LecturesPage({ searchParams }: LecturesPageProps) {
  const params = await searchParams;
  const currentCategory = params.category || 'all';
  const currentType = params.type || 'all';
  const currentPage = parseInt(params.page || '1', 10) || 1;
  const searchQuery = params.q || '';

  const { courses, total, totalPages } = await getPublishedCourses({
    category: currentCategory !== 'all' ? currentCategory : undefined,
    courseType: currentType !== 'all' ? currentType : undefined,
    page: currentPage,
    limit: 9,
    q: searchQuery,
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 타이틀 히어로 헤더 */}
      <section className="bg-gradient-to-b from-[#0F2C59] to-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-3xl">
            <UiBadge id="P09-SEC01-TIT01" name="온라인 강좌 헤더 섹션" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Online Lectures & Courses
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
              온라인 강좌
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              미래스마트산업진흥원이 연구·기획하고 전문 강사진이 제공하는 KOCW형 차시별 유튜브 강의 및 노션 마크다운 교재 아카이브입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 2. 본문 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 w-full flex-1">
        {/* 상단 필터 및 검색 컨트롤 */}
        <div className="space-y-4 mb-8">
          {/* 2-1. 카테고리 탭 */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <UiBadge id="P09-FLT-CAT01" name="카테고리 탭 필터" />
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat.key;
              const nextParams = new URLSearchParams();
              if (cat.key !== 'all') nextParams.set('category', cat.key);
              if (currentType !== 'all') nextParams.set('type', currentType);
              if (searchQuery) nextParams.set('q', searchQuery);
              const href = `/lectures${nextParams.toString() ? `?${nextParams.toString()}` : ''}`;

              return (
                <Link
                  key={cat.key}
                  href={href}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>

          {/* 2-2. 강좌 형태 필터 & 강좌 내 검색창 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* 형태 필터 버튼군 */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit">
              {TYPES.map((t) => {
                const isActive = currentType === t.key;
                const nextParams = new URLSearchParams();
                if (currentCategory !== 'all') nextParams.set('category', currentCategory);
                if (t.key !== 'all') nextParams.set('type', t.key);
                if (searchQuery) nextParams.set('q', searchQuery);
                const href = `/lectures${nextParams.toString() ? `?${nextParams.toString()}` : ''}`;

                return (
                  <Link
                    key={t.key}
                    href={href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>

            {/* 강좌 내 검색창 ($text 검색 연동, 전역 검색창 배제 가드레일 준수) */}
            <form action="/lectures" method="GET" className="relative sm:w-80">
              {currentCategory !== 'all' && (
                <input type="hidden" name="category" value={currentCategory} />
              )}
              {currentType !== 'all' && (
                <input type="hidden" name="type" value={currentType} />
              )}
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="강좌명, 강사진, 키워드 검색..."
                className="w-full text-xs pl-9 pr-14 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-colors"
              >
                검색
              </button>
            </form>
          </div>
        </div>

        {/* 3. 강좌 카드 그리드 (PC 3열 / 태블릿 2열 / 모바일 1열) */}
        {courses.length === 0 ? (
          /* 빈 화면 상태 (Empty State) */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 sm:p-16 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">등록된 강좌가 없습니다.</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              선택하신 조건에 해당하는 온라인 강좌가 아직 개설되지 않았거나 등록 준비 중입니다.
            </p>
            {(currentCategory !== 'all' || currentType !== 'all' || searchQuery) && (
              <div className="mt-6">
                <Link
                  href="/lectures"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>조건 초기화 및 전체 보기</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UiBadge id="P09-GRD-CRD01" name="강좌 카드 그리드" />
            {courses.map((course) => {
              const categoryInfo = CATEGORY_STYLES[course.category] || CATEGORY_STYLES.etc;
              const detailUrl =
                course.courseType === 'markdown'
                  ? `/lectures/note/${course.slug}`
                  : `/lectures/${course.slug}`;

              return (
                <Link
                  key={course.id}
                  href={detailUrl}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] hover:border-blue-400 transition-all flex flex-col"
                >
                  {/* 16:9 비율 썸네일 영역 */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    {course.thumbnail?.url ? (
                      <img
                        src={course.thumbnail.url}
                        alt={course.thumbnail.alt || course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-800 to-slate-900">
                        <GraduationCap className="w-10 h-10 text-slate-600 mb-1" />
                        <span className="text-[11px] font-semibold text-slate-400">
                          미래스마트산업진흥원 온라인 강좌
                        </span>
                      </div>
                    )}

                    {/* 유형 배지 (상단 좌측) */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {course.courseType === 'video' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs backdrop-blur-xs">
                          <Video className="w-3 h-3" />
                          <span>동영상 {course.episodeCount}차시</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs backdrop-blur-xs">
                          <FileText className="w-3 h-3" />
                          <span>강의노트/MD</span>
                        </span>
                      )}
                    </div>

                    {/* 카테고리 배지 (상단 우측) */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border backdrop-blur-xs bg-white/95 ${categoryInfo.color}`}
                      >
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* 카드 본문 콘텐츠 */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* 강좌 제목 (최대 2줄 말줄임) */}
                      <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>

                      {/* 강좌 설명 */}
                      {course.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* 하단 메타 정보 */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.instructor}</span>
                      </div>

                      <div className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>강의 보기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 4. 페이징 네비게이션 */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              const nextParams = new URLSearchParams();
              if (currentCategory !== 'all') nextParams.set('category', currentCategory);
              if (currentType !== 'all') nextParams.set('type', currentType);
              if (searchQuery) nextParams.set('q', searchQuery);
              nextParams.set('page', pageNum.toString());
              const href = `/lectures?${nextParams.toString()}`;

              return (
                <Link
                  key={pageNum}
                  href={href}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
