import React from 'react';
import Link from 'next/link';
import { getFeaturedCourses } from '@/lib/queries/courses';
import { GraduationCap, ArrowRight, Video, FileText, User } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  ai: { label: '인공지능·IT', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  beauty: { label: '스마트뷰티·미용', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  vocational: { label: '직업교육·자격', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  etc: { label: '기타', color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export default async function FeaturedCoursesSection() {
  const featuredCourses = await getFeaturedCourses();

  // [원칙 준수] 등록된 메인 노출 강좌가 0건인 경우, 가상 더미를 띄우지 않고 섹션 전체를 완전히 숨김(Hide)
  if (!featuredCourses || featuredCourses.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div className="relative">
            <UiBadge id="P01-SEC06-CRS01" name="메인 추천 강좌 섹션" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Online Courses</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              추천 온라인 강좌
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl">
              미래스마트산업진흥원이 제공하는 KOCW형 차시별 유튜브 강의 및 실무 강의노트를 만나보세요.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              href="/lectures"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>전체 강좌 보기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 강좌 카드 그리드 (최대 3건) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => {
            const categoryInfo = CATEGORY_STYLES[course.category] || CATEGORY_STYLES.etc;
            const detailUrl =
              course.courseType === 'markdown'
                ? `/lectures/note/${course.slug}`
                : `/lectures/${course.slug}`;

            return (
              <Link
                key={course.id}
                href={detailUrl}
                className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] hover:border-blue-400 hover:bg-white transition-all flex flex-col"
              >
                {/* 16:9 비율 썸네일 */}
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
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    {course.courseType === 'video' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-600 text-white shadow-xs backdrop-blur-xs">
                        <Video className="w-3 h-3" />
                        <span>동영상 {course.episodeCount}강</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs backdrop-blur-xs">
                        <FileText className="w-3 h-3" />
                        <span>강의노트</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border backdrop-blur-xs bg-white/95 ${categoryInfo.color}`}
                    >
                      {categoryInfo.label}
                    </span>
                  </div>
                </div>

                {/* 카드 본문 */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.instructor}</span>
                    </span>

                    <span className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>수강하기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

