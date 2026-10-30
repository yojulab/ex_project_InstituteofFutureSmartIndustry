'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  FileText,
  Share2,
  Copy,
  Check,
  Download,
  Eye,
  User,
  Calendar,
  Layers,
  ExternalLink,
  X,
  List,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { CourseDetailItem } from '@/lib/queries/courses';
import UiBadge from '@/components/common/UiBadge';

interface NoteViewerProps {
  course: CourseDetailItem;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function NoteViewer({ course }: NoteViewerProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);
  const [activeTocId, setActiveTocId] = useState<string>('');

  const markdownContent = course.markdownBody || '';

  // 본문에서 H2, H3 헤더 추출하여 TOC 구성 (파생 상태로 메모이제이션)
  const toc = useMemo<TocItem[]>(() => {
    if (!markdownContent) return [];

    const lines = markdownContent.split('\n');
    const items: TocItem[] = [];

    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        const text = h2Match[1].trim();
        const id = encodeURIComponent(text.toLowerCase().replace(/\s+/g, '-'));
        items.push({ id, text, level: 2 });
      } else if (h3Match) {
        const text = h3Match[1].trim();
        const id = encodeURIComponent(text.toLowerCase().replace(/\s+/g, '-'));
        items.push({ id, text, level: 3 });
      }
    });

    return items;
  }, [markdownContent]);

  // 스크롤 감지 (Scrollspy)
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = toc
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      const scrollPos = window.scrollY + 120;
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPos) {
          setActiveTocId(el.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  // 링크 복사
  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      alert('링크 복사에 실패했습니다.');
    }
  };

  // 모바일 공유
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: `${course.title} - 노션 강의노트`,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  // 목차 클릭 스크롤
  const handleTocClick = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 네비게이션 */}
      <div className="space-y-3">
        <Link
          href="/lectures"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>온라인 강좌 목록으로 돌아가기</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>강의노트 / 노션MD</span>
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
            {course.category === 'ai'
              ? '인공지능·IT'
              : course.category === 'beauty'
              ? '스마트뷰티·미용'
              : course.category === 'vocational'
              ? '직업교육·자격'
              : '기타'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {course.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              <span>강사진: {course.instructor}</span>
            </span>
            {course.term && (
              <span className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>교육기간: {course.term}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold shadow-xs transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>강의노트 링크 복사</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-xs"
              title="공유하기"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 강의 첨부 교재 다운로드 배너 */}
      {course.attachments.length > 0 && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>강의 교재 및 실습자료 다운로드</span>
            </span>
            <p className="text-[11px] text-blue-700/80 mt-0.5">
              본 강의와 관련된 PDF 교재 또는 실습자료를 열람·다운로드할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {course.attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs text-xs">
                <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                  {att.fileName}
                </span>
                {att.fileType === 'pdf' && att.fileUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewPdfUrl(att.fileUrl)}
                    className="p-1 text-slate-400 hover:text-blue-600"
                    title="미리보기"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                {att.fileUrl && (
                  <a
                    href={att.fileUrl}
                    download={att.fileName}
                    className="p-1 text-slate-400 hover:text-blue-600"
                    title="다운로드"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 본문 레이아웃 (좌측 마크다운 본문 + 우측 Sticky TOC) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 좌측: 마크다운 렌더러 영역 */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs">
          <UiBadge id="P11-NOT-MD01" name="노션 마크다운 뷰어" />
          <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h2:mt-8 prose-h3:mt-6 prose-a:text-blue-600 prose-code:font-mono prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-blue-700 prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:rounded-xl prose-table:overflow-x-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                h2: ({ node, children, ...props }) => {
                  const text = String(children);
                  const id = encodeURIComponent(text.toLowerCase().replace(/\s+/g, '-'));
                  return (
                    <h2 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ node, children, ...props }) => {
                  const text = String(children);
                  const id = encodeURIComponent(text.toLowerCase().replace(/\s+/g, '-'));
                  return (
                    <h3 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h3>
                  );
                },
                img: ({ node, src, alt, ...props }) => {
                  if (!src) return null;
                  const imgSrc = typeof src === 'string' ? src : '';
                  return (
                    <span className="block my-4">
                      <img
                        src={imgSrc}
                        alt={alt || ''}
                        onClick={() => setLightboxImg({ src: imgSrc, alt: alt || '' })}
                        className="rounded-xl border border-slate-200 cursor-zoom-in max-w-full h-auto mx-auto hover:opacity-95 transition-opacity"
                        {...props}
                      />
                    </span>
                  );
                },
                table: ({ node, children, ...props }) => (
                  <div className="overflow-x-auto my-4 border border-slate-200 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200 m-0" {...props}>
                      {children}
                    </table>
                  </div>
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* 우측: Sticky Table of Contents (TOC) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              <List className="w-4 h-4 text-blue-600" />
              <span>강의 목차 (TOC)</span>
            </div>

            {toc.length === 0 ? (
              <p className="text-xs text-slate-400">목차 항목이 없습니다.</p>
            ) : (
              <nav className="space-y-1 text-xs max-h-[70vh] overflow-y-auto pr-1">
                {toc.map((item, idx) => {
                  const isActive = activeTocId === item.id;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTocClick(item.id)}
                      className={`text-left block w-full py-1.5 px-2 rounded-lg transition-colors truncate ${
                        item.level === 3 ? 'pl-4 text-[11px]' : 'font-semibold'
                      } ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {item.text}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
        </aside>
      </div>

      {/* 이미지 라이트박스 모달 */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img
              src={lightboxImg.src}
              alt={lightboxImg.alt}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* PDF 미리보기 모달 */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold">강의 교재 미리보기</span>
              <button
                type="button"
                onClick={() => setPreviewPdfUrl(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={previewPdfUrl}
                title="교재 PDF 미리보기"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
