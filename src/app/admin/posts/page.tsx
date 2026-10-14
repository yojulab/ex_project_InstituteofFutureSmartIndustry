import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  FileText,
  PlusCircle,
  Pin,
  ExternalLink,
  Edit,
  Trash2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const posts = await Post.find({ deletedAt: null })
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">게시중</span>;
      case 'draft':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300">임시저장</span>;
      case 'scheduled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">예약</span>;
      case 'hidden':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">비공개</span>;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'notice':
        return '공지사항';
      case 'press':
        return '보도자료';
      case 'event':
        return '행사·교육';
      case 'bid':
        return '입찰·공모';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 바 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">게시물 관리 (알림마당)</h1>
          </div>
          <p className="text-xs text-slate-400">
            공지사항, 보도자료, 행사·교육, 입찰공고 콘텐츠를 등록 및 관리합니다.
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

      {/* 게시물 목록 테이블 */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700">
              <th className="py-3.5 px-4 w-14 text-center">상태</th>
              <th className="py-3.5 px-4 w-24">분류</th>
              <th className="py-3.5 px-4">제목</th>
              <th className="py-3.5 px-4 w-28">담당부서</th>
              <th className="py-3.5 px-4 w-28 text-center">등록일시</th>
              <th className="py-3.5 px-4 w-28 text-center">포털열람</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  등록된 게시물이 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post: any) => (
                <tr key={post._id.toString()} className="hover:bg-slate-700/40 transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-400">
                    {getTypeLabel(post.type)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded font-bold">
                          <Pin className="w-2.5 h-2.5" />
                          고정
                        </span>
                      )}
                      <span className="line-clamp-1">{post.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 truncate">
                    {post.department || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {new Date(post.publishedAt || post.createdAt).toISOString().slice(0, 10)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/news/${post.type}/${post.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>보기</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
