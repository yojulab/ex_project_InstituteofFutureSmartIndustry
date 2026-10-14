import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {
  Calendar,
  Building,
  ArrowLeft,
  Download,
  Paperclip,
  Share2,
} from 'lucide-react';

interface PostDetailProps {
  params: Promise<{ type: string; slug: string }>;
}

export const revalidate = 60;

export default async function PostDetailPage({ params }: PostDetailProps) {
  const { type, slug } = await params;

  await connectToDatabase();
  const post: any = await Post.findOne({ type: type as any, slug, deletedAt: null }).lean();

  if (!post) {
    notFound();
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        {/* 상단 브레드크럼 */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <Link href={`/news/${type}`} className="hover:underline">알림마당</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{post.title}</span>
        </nav>

        {/* 게시글 본체 카드 */}
        <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-8">
          {/* 머리글 */}
          <header className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                등록일: <time dateTime={new Date(post.publishedAt).toISOString().slice(0, 10)}>{new Date(post.publishedAt).toISOString().slice(0, 10)}</time>
              </span>

              {post.department && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  담당부서: <strong>{post.department}</strong>
                </span>
              )}
            </div>
          </header>

          {/* 첨부파일 다운로드 영역 (§4.3) */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="p-4 sm:p-6 bg-sky-50/40 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 mb-3">
                <Paperclip className="w-4 h-4 text-sky-600" />
                <span>첨부파일 ({post.attachments.length}건)</span>
              </div>
              <ul className="space-y-2">
                {post.attachments.map((att: any, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                  >
                    <span className="font-medium truncate mr-2">{att.name}</span>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-slate-100 hover:bg-[#0F2C59] text-slate-800 hover:text-white rounded-md font-semibold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>다운로드 {att.size ? `(${formatFileSize(att.size)})` : ''}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 본문 (마크다운 살균 렌더링) */}
          <div className="p-6 sm:p-10">
            <div className="prose-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {post.body}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* 하단 액션 */}
        <div className="flex items-center justify-between">
          <Link
            href={`/news/${type}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-sm font-bold shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로 돌아가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
