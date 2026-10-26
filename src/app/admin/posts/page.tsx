import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { FileText, PlusCircle, Star, AlertCircle, Sparkles } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';
import PostListTable from './PostListTable';

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const rawPosts = await Post.find({ deletedAt: null })
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();

  const featuredCount = rawPosts.filter((p) => p.isFeatured && p.status === 'public').length;

  const serializedPosts = rawPosts.map((p: any) => ({
    _id: p._id.toString(),
    category: p.category,
    title: p.title,
    slug: p.slug,
    status: p.status,
    isFeatured: Boolean(p.isFeatured),
    eventDate: p.eventDate ? p.eventDate.toISOString() : undefined,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* 헤더 바 */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <UiBadge id="A02-PST-HD01" name="게시물 관리 헤더 및 신규 등록 버튼" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">통합 게시물 관리</h1>
          </div>
          <p className="text-xs text-slate-400">
            소식·성과(공지사항, 기관활동, 학술논문, 원장활동) 콘텐츠를 등록하고 메인 화면 노출을 제어합니다.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>게시물 신규 등록</span>
        </Link>
      </div>

      {/* 메인 화면 노출 현황 카드 (AC-07: 최대 3건 서버 엄격 검증) */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <UiBadge id="A02-PST-FEAT01" name="메인 화면 노출 현황 요약 카드" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">메인 화면 노출 현황</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                  featuredCount >= 3
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                }`}
              >
                {featuredCount} / 3건
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              메인 화면의 [주요 성과 및 활동] 섹션에는 최대 3건의 공개 게시물만 엄선 노출됩니다.
            </p>
          </div>
        </div>

        {featuredCount >= 3 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>최대 한도(3건)에 도달했습니다.</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
            <Sparkles className="w-4 h-4" />
            <span>{3 - featuredCount}건 추가 지정 가능</span>
          </div>
        )}
      </div>

      {/* 인터랙티브 게시물 테이블 */}
      <PostListTable initialPosts={serializedPosts} featuredCount={featuredCount} />
    </div>
  );
}
