import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlugOrId } from '@/lib/queries/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {
  Calendar,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Download,
  Share2,
  Tag,
  AlertCircle,
  FileText,
} from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';
import type { Metadata } from 'next';

interface PostDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  notice: { label: '공지사항', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  activity: { label: '기관 활동·보도', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paper: { label: '학술논문', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  director: { label: '원장 대외활동', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugOrId(slug);

  if (!post) {
    return {
      title: '게시물을 찾을 수 없습니다 | 미래스마트산업진흥원',
    };
  }

  return {
    title: `${post.title} | 미래스마트산업진흥원`,
    description: post.summary || `${post.title} - 미래스마트산업진흥원 공식 게시물입니다.`,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.createdAt,
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;

  // [AC-08] 비공개 또는 삭제된 글 접근 시 완벽히 404 차단
  const post = await getPostBySlugOrId(slug);
  if (!post) {
    notFound();
  }

  const catStyle = CATEGORY_STYLES[post.category] || {
    label: post.category,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const createdDate = new Date(post.createdAt).toLocaleDateString('ko-KR');
  const eventDate = post.eventDate ? new Date(post.eventDate).toLocaleDateString('ko-KR') : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 브레드크럼 및 카테고리 헤더 */}
      <section className="bg-white border-b border-slate-200 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-800">홈</Link>
            <span>/</span>
            <Link href="/updates" className="hover:text-slate-800">소식·성과</Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">{catStyle.label}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catStyle.color}`}>
              {catStyle.label}
            </span>
            {post.isFeatured && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                메인 노출
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {post.title}
          </h1>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                등록일: {createdDate}
              </span>
              {eventDate && (
                <span className="flex items-center gap-1 text-slate-600">
                  발표/행사일: <strong>{eventDate}</strong>
                </span>
              )}
            </div>
            {post.sourceName && (
              <span className="text-slate-500">출처/언론사: <strong>{post.sourceName}</strong></span>
            )}
          </div>
        </div>
      </section>

      {/* 2. 학술논문 전용 메타데이터 블록 (DOI/저자/학술지명, AC-13) */}
      {post.category === 'paper' && (
        <section className="bg-purple-50/60 border-b border-purple-100 py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <div className="p-5 rounded-2xl bg-white border border-purple-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                <BookOpen className="w-4 h-4 text-purple-700" />
                <span>공식 학술 논문 메타데이터</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                {post.authors && post.authors.length > 0 && (
                  <div>
                    <span className="text-slate-400">저자: </span>
                    <strong className="text-slate-800">{post.authors.join(', ')}</strong>
                  </div>
                )}
                {post.journal && (
                  <div>
                    <span className="text-slate-400">게재 학술지: </span>
                    <strong className="text-slate-800">{post.journal}</strong> {post.volumeIssuePages && `(${post.volumeIssuePages})`}
                  </div>
                )}
              </div>

              {post.doi && (
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-slate-500">디지털 객체 식별자(DOI):</span>
                  <a
                    href={post.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:text-purple-900 underline"
                  >
                    <span>{post.doi}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. 보도/기사 전용 원문 링크 블록 (저작권 보호: 전문 무단복제 금지 안내) */}
      {post.category === 'activity' && post.sourceUrl && (
        <section className="bg-emerald-50/60 border-b border-emerald-100 py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm text-emerald-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>언론 보도 원문은 저작권 보호를 위해 원본 언론사 페이지에서 확인하실 수 있습니다.</span>
              </div>
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 underline ml-auto"
              >
                <span>원본 기사 바로가기 ↗</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 4. 본문 내용 (Markdown + XSS 살균) */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <article className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
            {post.summary && (
              <div className="mb-8 p-5 rounded-2xl bg-slate-50 border-l-4 border-[#0F2C59] text-sm text-slate-700 leading-relaxed font-medium">
                {post.summary}
              </div>
            )}

            <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {post.body}
              </ReactMarkdown>
            </div>

            {/* 태그 목록 */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 첨부파일 다운로드 */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  첨부파일 ({post.attachments.length}건)
                </h3>
                <div className="space-y-2">
                  {post.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs sm:text-sm text-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#0284C7]" />
                        <span className="font-semibold">{att.name}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <span>{(att.size / 1024).toFixed(1)} KB</span>
                        <Download className="w-3.5 h-3.5" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* 5. 하단 목록으로 돌아가기 버튼 */}
          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>소식·성과 목록으로 돌아가기</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
