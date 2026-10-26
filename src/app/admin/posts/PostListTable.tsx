'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Edit,
  Trash2,
  Star,
  CheckCircle2,
  Clock,
  EyeOff,
  AlertTriangle,
  Search,
} from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

interface PostItem {
  _id: string;
  category: 'notice' | 'activity' | 'paper' | 'director';
  title: string;
  slug: string;
  status: 'draft' | 'private' | 'public';
  isFeatured: boolean;
  eventDate?: string;
  createdAt: string;
}

interface PostListTableProps {
  initialPosts: PostItem[];
  featuredCount: number;
}

export default function PostListTable({
  initialPosts,
  featuredCount: initialFeaturedCount,
}: PostListTableProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [featuredCount, setFeaturedCount] = useState<number>(initialFeaturedCount);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 메인 노출 토글
  const handleToggleFeatured = async (post: PostItem) => {
    setErrorMessage(null);
    const newFeatured = !post.isFeatured;

    if (newFeatured && post.status !== 'public') {
      setErrorMessage('공개(public) 상태인 게시물만 메인 화면에 노출할 수 있습니다.');
      return;
    }

    if (newFeatured && featuredCount >= 3) {
      setErrorMessage('메인 노출 게시물은 최대 3건까지만 지정할 수 있습니다. 기존 게시물의 메인 노출을 먼저 해제해 주세요.');
      return;
    }

    setActionLoading(post._id);
    try {
      const res = await fetch(`/api/admin/posts/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          isFeatured: newFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || '메인 노출 설정에 실패했습니다.');
        setActionLoading(null);
        return;
      }

      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, isFeatured: newFeatured } : p))
      );
      setFeaturedCount((prev) => (newFeatured ? prev + 1 : prev - 1));
      router.refresh();
    } catch {
      setErrorMessage('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 삭제 처리
  const handleDelete = async (id: string) => {
    setActionLoading(id);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || '게시물 삭제에 실패했습니다.');
        setActionLoading(null);
        setDeleteConfirmId(null);
        return;
      }

      const deletedPost = posts.find((p) => p._id === id);
      if (deletedPost?.isFeatured) {
        setFeaturedCount((prev) => Math.max(0, prev - 1));
      }
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setDeleteConfirmId(null);
      router.refresh();
    } catch {
      setErrorMessage('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchTerm.trim() && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'notice':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">공지사항</span>;
      case 'activity':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300">기관활동</span>;
      case 'paper':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">학술논문</span>;
      case 'director':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">원장활동</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'public':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5" />
            공개
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300">
            <Clock className="w-2.5 h-2.5" />
            임시저장
          </span>
        );
      case 'private':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
            <EyeOff className="w-2.5 h-2.5" />
            비공개
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* 알림 메시지 */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* 필터 및 검색 바 */}
      <div className="relative p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <UiBadge id="A02-PST-FLTR01" name="게시물 목록 필터 및 검색 바" />
        <div className="flex flex-wrap items-center gap-2">
          {/* 분류 필터 */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:border-sky-500"
          >
            <option value="all">전체 분류</option>
            <option value="notice">공지사항</option>
            <option value="activity">기관활동</option>
            <option value="paper">학술논문</option>
            <option value="director">원장활동</option>
          </select>

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:border-sky-500"
          >
            <option value="all">전체 상태</option>
            <option value="public">공개</option>
            <option value="draft">임시저장</option>
            <option value="private">비공개</option>
          </select>
        </div>

        {/* 검색 인풋 */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="제목 검색..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* 게시물 목록 테이블 */}
      <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <UiBadge id="A02-PST-LIST01" name="게시물 목록 테이블" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-700">
                <th className="py-3 px-3 w-12 text-center">메인</th>
                <th className="py-3 px-3 w-16 text-center">상태</th>
                <th className="py-3 px-3 w-20">분류</th>
                <th className="py-3 px-4">제목</th>
                <th className="py-3 px-3 w-24 text-center">등록일시</th>
                <th className="py-3 px-3 w-28 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    조건에 해당하는 게시물이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-700/30 transition-colors">
                    {/* 메인 노출 토글 */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(post)}
                        disabled={actionLoading === post._id}
                        title={
                          post.isFeatured
                            ? '메인 노출 중 (클릭 시 해제)'
                            : featuredCount >= 3
                            ? '메인 노출 한도(3건) 도달'
                            : '메인 노출 지정'
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          post.isFeatured
                            ? 'text-amber-400 bg-amber-400/20 hover:bg-amber-400/30'
                            : 'text-slate-600 hover:text-slate-400 hover:bg-slate-700/50'
                        } disabled:opacity-50`}
                      >
                        <Star className={`w-4 h-4 ${post.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    {/* 상태 */}
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(post.status)}
                    </td>

                    {/* 분류 */}
                    <td className="py-3 px-3">
                      {getCategoryBadge(post.category)}
                    </td>

                    {/* 제목 */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {post.isFeatured && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0">
                            메인 3선
                          </span>
                        )}
                        <Link
                          href={`/admin/posts/${post._id}/edit`}
                          className="font-bold text-slate-100 hover:text-sky-400 transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        /{post.slug}
                      </div>
                    </td>

                    {/* 일시 */}
                    <td className="py-3 px-3 text-center text-slate-400">
                      {new Date(post.createdAt).toISOString().slice(0, 10)}
                    </td>

                    {/* 관리 액션 */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/updates/${post.slug}`}
                          target="_blank"
                          title="포털 열람"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-700/50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/posts/${post._id}/edit`}
                          title="게시물 수정"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(post._id)}
                          title="게시물 삭제"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">게시물 삭제 확인</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              정말로 이 게시물을 삭제하시겠습니까? 삭제된 게시물은 포털 및 메인 화면에서 즉시 제외됩니다.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionLoading !== null}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionLoading !== null}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {actionLoading === deleteConfirmId ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
