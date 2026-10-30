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
  Video,
  FileText,
  Layers,
} from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export interface CourseAdminItem {
  _id: string;
  title: string;
  slug: string;
  courseType: 'video' | 'markdown';
  category: 'ai' | 'beauty' | 'vocational' | 'etc';
  instructor: string;
  status: 'draft' | 'private' | 'public';
  isFeatured: boolean;
  featuredOrder: number;
  sortOrder: number;
  episodeCount: number;
  createdAt: string;
}

interface LectureListTableProps {
  initialCourses: CourseAdminItem[];
  featuredCount: number;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  ai: { label: '인공지능·IT', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  beauty: { label: '스마트뷰티·미용', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  vocational: { label: '직업교육·자격', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  etc: { label: '기타', color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export default function LectureListTable({
  initialCourses,
  featuredCount: initialFeaturedCount,
}: LectureListTableProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseAdminItem[]>(initialCourses);
  const [featuredCount, setFeaturedCount] = useState<number>(initialFeaturedCount);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 메인 노출 토글 (Q6: 관리자 권한 전용 & LAC-18)
  const handleToggleFeatured = async (course: CourseAdminItem) => {
    const nextFeatured = !course.isFeatured;
    if (nextFeatured && featuredCount >= 3) {
      setErrorMessage('메인 화면에는 최대 3건의 강좌만 노출할 수 있습니다. 기존 노출 강좌를 먼저 해제해주세요.');
      return;
    }

    setActionLoading(course._id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/lectures/${course._id}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '메인 노출 상태를 변경하지 못했습니다.');
      }

      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, isFeatured: nextFeatured } : c))
      );
      setFeaturedCount((prev) => (nextFeatured ? prev + 1 : prev - 1));
    } catch (err: any) {
      setErrorMessage(err.message || '오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 상태 토글
  const handleStatusChange = async (course: CourseAdminItem, nextStatus: 'public' | 'private' | 'draft') => {
    setActionLoading(course._id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/lectures/${course._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '상태 변경에 실패했습니다.');
      }

      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id
            ? { ...c, status: nextStatus, isFeatured: nextStatus !== 'public' ? false : c.isFeatured }
            : c
        )
      );
      if (course.isFeatured && nextStatus !== 'public') {
        setFeaturedCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setErrorMessage(err.message || '오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 삭제 처리
  const handleDelete = async (courseId: string) => {
    setActionLoading(courseId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/lectures/${courseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '삭제하지 못했습니다.');
      }

      const deleted = courses.find((c) => c._id === courseId);
      if (deleted?.isFeatured) {
        setFeaturedCount((prev) => Math.max(0, prev - 1));
      }
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      setErrorMessage(err.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  // 클라이언트 필터링
  const filteredCourses = courses.filter((c) => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (typeFilter !== 'all' && c.courseType !== typeFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchInstructor = c.instructor.toLowerCase().includes(q);
      const matchSlug = c.slug.toLowerCase().includes(q);
      if (!matchTitle && !matchInstructor && !matchSlug) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 에러 알림창 */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">오류 안내</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 font-bold text-xs"
          >
            닫기
          </button>
        </div>
      )}

      {/* 상단 필터 및 검색 바 */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* 카테고리 필터 */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 분야</option>
            <option value="ai">인공지능·IT</option>
            <option value="beauty">스마트뷰티·미용</option>
            <option value="vocational">직업교육·자격</option>
            <option value="etc">기타</option>
          </select>

          {/* 유형 필터 */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 강좌유형</option>
            <option value="video">동영상 강좌(KOCW형)</option>
            <option value="markdown">텍스트 강좌(노션MD)</option>
          </select>

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="public">공개</option>
            <option value="private">비공개</option>
            <option value="draft">임시저장</option>
          </select>
        </div>

        {/* 검색창 */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="강좌명, 강사명, 슬러그 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 테이블 목록 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 w-12 text-center">번호</th>
                <th className="py-3 px-4 w-28">분야/유형</th>
                <th className="py-3 px-4">강좌명 / 슬러그</th>
                <th className="py-3 px-4 w-28">강사명</th>
                <th className="py-3 px-4 w-20 text-center">차시</th>
                <th className="py-3 px-4 w-24 text-center">공개상태</th>
                <th className="py-3 px-4 w-28 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>메인추천</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                      {featuredCount}/3
                    </span>
                  </div>
                </th>
                <th className="py-3 px-4 w-28 text-center">등록일</th>
                <th className="py-3 px-4 w-28 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    등록된 강좌가 없거나 조건과 일치하는 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c, index) => {
                  const categoryInfo = CATEGORY_LABELS[c.category] || CATEGORY_LABELS.etc;
                  const isLoading = actionLoading === c._id;

                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        c.isFeatured ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">
                        {filteredCourses.length - index}
                      </td>

                      <td className="py-3 px-4 space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryInfo.color}`}
                        >
                          {categoryInfo.label}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          {c.courseType === 'video' ? (
                            <>
                              <Video className="w-3 h-3 text-blue-500" />
                              <span>동영상</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3 text-emerald-500" />
                              <span>노션MD</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          /lectures/{c.courseType === 'markdown' ? 'note/' : ''}
                          {c.slug}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700">{c.instructor}</td>

                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-600">
                        {c.courseType === 'video' ? `${c.episodeCount}강` : '-'}
                      </td>

                      {/* 상태 토글 드롭다운 */}
                      <td className="py-3 px-4 text-center">
                        <select
                          disabled={isLoading}
                          value={c.status}
                          onChange={(e) =>
                            handleStatusChange(
                              c,
                              e.target.value as 'public' | 'private' | 'draft'
                            )
                          }
                          className={`text-[11px] font-bold px-2 py-1 rounded-md border focus:outline-hidden ${
                            c.status === 'public'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : c.status === 'private'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="public">공개</option>
                          <option value="private">비공개</option>
                          <option value="draft">임시저장</option>
                        </select>
                      </td>

                      {/* 메인 노출 토글 버튼 (Q6: 관리자 권한 전용 & LAC-18) */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLoading || c.status !== 'public'}
                          onClick={() => handleToggleFeatured(c)}
                          title={
                            c.status !== 'public'
                              ? '공개 상태의 강좌만 메인에 노출할 수 있습니다.'
                              : c.isFeatured
                              ? '메인 노출 해제'
                              : '메인 노출 지정 (최대 3건)'
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            c.isFeatured
                              ? 'bg-amber-400 text-slate-900 shadow-xs hover:bg-amber-500'
                              : c.status !== 'public'
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              c.isFeatured ? 'fill-slate-900 text-slate-900' : 'text-slate-400'
                            }`}
                          />
                          <span>{c.isFeatured ? '노출중' : '미노출'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-400 text-[11px] whitespace-nowrap">
                        {c.createdAt ? c.createdAt.slice(0, 10) : '-'}
                      </td>

                      {/* 액션 버튼 */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* 포털 보기 링크 */}
                          <a
                            href={`/lectures/${c.courseType === 'markdown' ? 'note/' : ''}${c.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            title="공개 화면 새창 열기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* 수정 링크 */}
                          <Link
                            href={`/admin/lectures/${c._id}/edit`}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                            title="강좌 수정"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(c._id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            title="강좌 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">강좌를 삭제하시겠습니까?</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              강좌가 목록에서 숨겨지며 공개 화면에서 더 이상 접근할 수 없게 됩니다.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
