'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  AlertCircle,
  Star,
  FileText,
  BookOpen,
  Calendar,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import UiBadge from '@/components/common/UiBadge';

export interface PostFormData {
  _id?: string;
  category: 'notice' | 'activity' | 'paper' | 'director';
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: 'draft' | 'private' | 'public';
  isFeatured: boolean;
  eventDate?: string;
  sourceUrl?: string;
  sourceName?: string;
  doi?: string;
  authors?: string[];
  journal?: string;
  volumeIssuePages?: string;
  thumbnail?: {
    url: string;
    alt: string;
  };
}

interface PostFormProps {
  initialData?: PostFormData;
  isEdit?: boolean;
}

export default function PostForm({ initialData, isEdit = false }: PostFormProps) {
  const router = useRouter();

  const [category, setCategory] = useState<'notice' | 'activity' | 'paper' | 'director'>(
    initialData?.category || 'notice'
  );
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [status, setStatus] = useState<'draft' | 'private' | 'public'>(
    initialData?.status || 'public'
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [eventDate, setEventDate] = useState<string>(
    initialData?.eventDate ? initialData.eventDate.slice(0, 10) : ''
  );

  // 카테고리별 특화 필드
  const [authorsInput, setAuthorsInput] = useState<string>(
    initialData?.authors ? initialData.authors.join(', ') : ''
  );
  const [journal, setJournal] = useState<string>(initialData?.journal || '');
  const [volumeIssuePages, setVolumeIssuePages] = useState<string>(
    initialData?.volumeIssuePages || ''
  );
  const [doi, setDoi] = useState<string>(initialData?.doi || '');
  const [sourceName, setSourceName] = useState<string>(initialData?.sourceName || '');
  const [sourceUrl, setSourceUrl] = useState<string>(initialData?.sourceUrl || '');

  // 썸네일 & 대체텍스트 (alt 필수)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initialData?.thumbnail?.url || '');
  const [thumbnailAlt, setThumbnailAlt] = useState<string>(initialData?.thumbnail?.alt || '');

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 슬러그 자동 생성 도우미 (신규 작성 시에만)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !slug) {
      const generated = `post-${Date.now().toString(36)}`;
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 유효성 기본 검증
    if (!title.trim()) {
      setErrorMessage('제목을 입력해 주세요.');
      return;
    }
    if (!slug.trim()) {
      setErrorMessage('URL 슬러그를 입력해 주세요.');
      return;
    }
    if (!body.trim()) {
      setErrorMessage('본문 내용을 입력해 주세요.');
      return;
    }

    // 썸네일 등록 시 대체텍스트(alt) 필수 검증 (헌장 및 KWCAG 2.2 강제)
    if (thumbnailUrl.trim() && !thumbnailAlt.trim()) {
      setErrorMessage('썸네일 이미지를 등록할 경우 접근성을 위한 대체 텍스트(alt)는 필수입니다.');
      return;
    }

    // DOI 형식 검증
    if (doi.trim() && !doi.startsWith('https://doi.org/')) {
      setErrorMessage('DOI는 반드시 https://doi.org/... 형식으로 입력해야 합니다.');
      return;
    }

    const payload = {
      category,
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      summary: summary.trim(),
      body,
      status,
      isFeatured,
      eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      sourceName: sourceName.trim() || undefined,
      doi: doi.trim() || undefined,
      authors: authorsInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      journal: journal.trim() || undefined,
      volumeIssuePages: volumeIssuePages.trim() || undefined,
      thumbnail: thumbnailUrl.trim()
        ? {
            url: thumbnailUrl.trim(),
            alt: thumbnailAlt.trim(),
          }
        : undefined,
    };

    setLoading(true);

    try {
      const url = isEdit ? `/api/admin/posts/${initialData?._id}` : '/api/admin/posts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || '게시물 저장에 실패했습니다.');
        setLoading(false);
        return;
      }

      router.push('/admin/posts');
      router.refresh();
    } catch {
      setErrorMessage('서버와 통신 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 상단 네비게이션 및 제출 버튼 */}
      <div className="relative flex items-center justify-between">
        <UiBadge id="A02-PST-FORM-HD01" name="게시물 폼 헤더 및 저장 버튼" />
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>게시물 목록으로 돌아가기</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/posts"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '저장 중...' : isEdit ? '수정 완료' : '게시물 등록'}</span>
          </button>
        </div>
      </div>

      {/* 에러 메시지 알림 (409 Conflict 등) */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* 본문 기본 정보 카드 */}
      <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-6">
        <UiBadge id="A02-PST-FORM-INFO01" name="게시물 기본 메타데이터 설정" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 분류 구분 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              분류 구분 <span className="text-rose-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
            >
              <option value="notice">공지사항 (Notice)</option>
              <option value="activity">기관활동 (Activity)</option>
              <option value="paper">학술논문 (Paper)</option>
              <option value="director">원장활동 (Director)</option>
            </select>
          </div>

          {/* 게시 상태 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              게시 상태 <span className="text-rose-400">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
            >
              <option value="public">공개 (Public)</option>
              <option value="draft">임시저장 (Draft)</option>
              <option value="private">비공개 (Private)</option>
            </select>
          </div>

          {/* 행사 / 발행 일시 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              행사/발행 일시 (선택)
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* 메인 노출 체크박스 (AC-07: 최대 3건 서버 엄격 검증) */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className={`w-5 h-5 ${isFeatured ? 'text-amber-400 fill-current' : 'text-slate-500'}`} />
            <div>
              <label htmlFor="isFeatured" className="text-xs font-bold text-slate-200 cursor-pointer">
                메인 화면 [주요 성과 및 활동] 노출 지정
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                체크 시 메인 화면 3선 카드에 즉시 반영됩니다 (전체 최대 3건 한도).
              </p>
            </div>
          </div>
          <input
            id="isFeatured"
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-amber-500 cursor-pointer"
          />
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            게시물 제목 <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="제목을 입력하세요 (예: 2026 미래스마트제조 AI 전략 콘퍼런스 개최)"
            className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        {/* 고유 식별 슬러그 */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            URL 슬러그 (영문 소문자, 숫자, 하이픈) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="예: 2026-smart-manufacturing-ai-conference"
            className="w-full py-2 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-sky-500 focus:outline-hidden"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            공개 포털 주소: /updates/{slug || '슬러그'}
          </span>
        </div>

        {/* 간략 요약문 */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            목록 요약문 (최대 500자)
          </label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="목록 카드 및 검색 결과에 노출될 간략한 설명을 작성하세요."
            className="w-full py-2 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* 카테고리별 특화 필드 (학술논문 / 기사출처) */}
      {category === 'paper' && (
        <div className="relative bg-slate-800/80 border border-purple-500/30 rounded-2xl p-6 space-y-4">
          <UiBadge id="A02-PST-FORM-PAPR01" name="학술논문 특화 메타데이터" />
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1">
            <BookOpen className="w-4 h-4" />
            <span>학술논문 전용 서지 정보</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                저자 목록 (쉼표 구분)
              </label>
              <input
                type="text"
                value={authorsInput}
                onChange={(e) => setAuthorsInput(e.target.value)}
                placeholder="예: 홍길동, 김철수, 이영희"
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                게재 학술지명
              </label>
              <input
                type="text"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="예: 한국인공지능산업학회논문지"
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                권/호/페이지 정보
              </label>
              <input
                type="text"
                value={volumeIssuePages}
                onChange={(e) => setVolumeIssuePages(e.target.value)}
                placeholder="예: Vol.12, No.3, pp.112-125"
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                공식 DOI 링크 (https://doi.org/... 형식)
              </label>
              <input
                type="url"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="https://doi.org/10.xxxx/xxxxx"
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {(category === 'activity' || category === 'director') && (
        <div className="relative bg-slate-800/80 border border-teal-500/30 rounded-2xl p-6 space-y-4">
          <UiBadge id="A02-PST-FORM-ACTV01" name="기관활동/언론보도 메타데이터" />
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-1">
            <Link2 className="w-4 h-4" />
            <span>원문 기사 및 출처 정보</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                출처 언론사 / 발행 기관
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="예: 전자신문, AI타임스, 과학기술정보통신부"
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                원문 기사 / 발표 자료 URL
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* 썸네일 및 웹 접근성 대체 텍스트 (alt 필수) */}
      <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <UiBadge id="A02-PST-FORM-THMB01" name="썸네일 및 KWCAG 2.2 대체텍스트 입력" />
        <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
          <ImageIcon className="w-4 h-4" />
          <span>썸네일 이미지 및 대체 텍스트 (웹 접근성 준수)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              이미지 경로/URL
            </label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="예: /images/posts/sample.png 또는 https://..."
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              대체 텍스트 (alt) <span className="text-amber-400 font-bold">* 이미지 입력 시 필수</span>
            </label>
            <input
              type="text"
              value={thumbnailAlt}
              onChange={(e) => setThumbnailAlt(e.target.value)}
              placeholder="시각장애인을 위한 이미지 상세 묘사"
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 마크다운 본문 에디터 및 실시간 살균 미리보기 */}
      <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <UiBadge id="A02-PST-FORM-BODY01" name="마크다운 에디터 및 실시간 살균 미리보기" />
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-300">
            본문 내용 (마크다운) <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                activeTab === 'edit'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>편집기</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>미리보기</span>
            </button>
          </div>
        </div>

        {activeTab === 'edit' ? (
          <textarea
            rows={14}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="마크다운 문법(# 소제목, **강조**, - 목록 등)으로 작성하세요."
            className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm font-mono leading-relaxed focus:border-sky-500 focus:outline-hidden"
          />
        ) : (
          <div className="w-full min-h-[300px] p-6 bg-slate-950 border border-slate-700 rounded-xl prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm">
            {body ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {body}
              </ReactMarkdown>
            ) : (
              <span className="text-slate-500 text-xs">본문 내용을 입력하면 여기에 실시간 미리보기가 나타납니다.</span>
            )}
          </div>
        )}
      </div>

      {/* 하단 고정 제출 버튼 바 */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <Link
          href="/admin/posts"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
        >
          목록으로
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? '저장 중...' : isEdit ? '게시물 수정 반영' : '신규 게시물 등록하기'}</span>
        </button>
      </div>
    </form>
  );
}
