'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Edit3, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

export default function AdminNewPostPage() {
  const router = useRouter();

  const [type, setType] = useState('notice');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('published');
  const [isPinned, setIsPinned] = useState(false);
  const [department, setDepartment] = useState('');

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 자동 슬러그 생성 도우미
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      const generated = `post-${Date.now().toString(36)}`;
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !body.trim() || !slug.trim()) {
      setErrorMsg('제목, 슬러그, 본문 내용은 필수입니다.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          slug: slug.trim().toLowerCase(),
          summary: summary.trim(),
          body,
          status,
          isPinned,
          department: department.trim(),
          tags: [],
          attachments: [],
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || '게시물 등록 실패');
        setLoading(false);
        return;
      }

      router.push('/admin/posts');
      router.refresh();
    } catch {
      setErrorMsg('서버와 통신 중 에러가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>게시물 목록으로 돌아가기</span>
        </Link>
        <h1 className="text-lg font-bold text-white">신규 게시물 작성</h1>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 게시물 작성 폼 */}
      <form onSubmit={handleSubmit} className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              분류 구분
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
            >
              <option value="notice">공지사항</option>
              <option value="press">보도자료</option>
              <option value="event">행사·교육</option>
              <option value="bid">입찰·공모</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              게시 상태
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
            >
              <option value="published">즉시 게시 (Published)</option>
              <option value="draft">임시 저장 (Draft)</option>
              <option value="hidden">비공개 (Hidden)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              담당 부서
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="예: AI융합사업본부"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* 상단 고정 체크박스 */}
        <div className="flex items-center gap-2">
          <input
            id="isPinned"
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-sky-500"
          />
          <label htmlFor="isPinned" className="text-xs font-semibold text-slate-300">
            목록 상단에 고정 표시 (중요 공지)
          </label>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            제목 <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="게시물 제목을 입력하세요"
            className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        {/* 고유 식별 슬러그 */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            URL 슬러그 (영문 소문자, 숫자, 하이픈) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="예: 2026-manufacturing-ai-orientation"
            className="w-full py-2 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        {/* 목록 및 검색용 요약문 */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            간략 요약문
          </label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="목록 및 검색 결과에 노출될 간략한 요약문을 입력하세요"
            className="w-full py-2 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        {/* 마크다운 본문 편집기 및 실시간 미리보기 탭 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-300">
              본문 내용 (마크다운 지원) <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'edit' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>에디터</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'preview' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>미리보기</span>
              </button>
            </div>
          </div>

          {activeTab === 'edit' ? (
            <textarea
              rows={12}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="마크다운 문법(# 제목, **강조**, - 목록 등)으로 작성하세요."
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm font-mono leading-relaxed focus:border-sky-500 focus:outline-hidden"
            />
          ) : (
            <div className="w-full min-h-[250px] p-6 bg-slate-950 border border-slate-700 rounded-xl prose-content text-slate-200">
              {body ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {body}
                </ReactMarkdown>
              ) : (
                <span className="text-slate-500 text-xs">본문 내용을 입력하면 여기에 미리보기가 나타납니다.</span>
              )}
            </div>
          )}
        </div>

        {/* 저장 제출 버튼 */}
        <div className="pt-4 border-t border-slate-700/60 flex items-center justify-end gap-3">
          <Link
            href="/admin/posts"
            className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '저장 중...' : '게시물 등록하기'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
