import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import LectureListTable, { CourseAdminItem } from './LectureListTable';
import { Plus, GraduationCap } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const dynamic = 'force-dynamic';

export default async function AdminLecturesPage() {
  await connectToDatabase();

  const [rawCourses, featuredCount] = await Promise.all([
    Course.find({ deletedAt: null })
      .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
      .lean(),
    Course.countDocuments({ isFeatured: true, deletedAt: null }),
  ]);

  const courses: CourseAdminItem[] = rawCourses.map((c: any) => ({
    _id: c._id.toString(),
    title: c.title,
    slug: c.slug,
    courseType: c.courseType,
    category: c.category,
    instructor: c.instructor,
    status: c.status,
    isFeatured: Boolean(c.isFeatured),
    featuredOrder: c.featuredOrder || 0,
    sortOrder: c.sortOrder || 0,
    episodeCount: Array.isArray(c.episodes) ? c.episodes.length : 0,
    createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              온라인 강좌 관리 (ADM-03)
            </h1>
            <UiBadge id="ADM03-HDR-TIT01" name="강좌 관리 헤더" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            KOCW형 차시별 동영상 강좌 및 노션 마크다운(MD) 강의를 등록·관리하고 메인 추천 강좌(최대 3건)를 지정합니다.
          </p>
        </div>

        <Link
          href="/admin/lectures/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>신규 강좌 등록</span>
        </Link>
      </div>

      {/* 강좌 목록 테이블 */}
      <LectureListTable initialCourses={courses} featuredCount={featuredCount} />
    </div>
  );
}

