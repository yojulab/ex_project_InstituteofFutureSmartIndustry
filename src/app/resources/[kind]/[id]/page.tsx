import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Resource } from '@/models/Resource';
import {
  Calendar,
  Building,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileCheck2,
  ArrowLeft,
} from 'lucide-react';
import mongoose from 'mongoose';

interface ResourceDetailPageProps {
  params: Promise<{
    kind: string;
    id: string;
  }>;
}

export const revalidate = 60;

const KIND_MAP: Record<string, { dbKey: string; label: string }> = {
  publications: { dbKey: 'publication', label: '간행물·보고서' },
  publication: { dbKey: 'publication', label: '간행물·보고서' },
  statistics: { dbKey: 'statistics', label: '통계·동향' },
  regulations: { dbKey: 'regulation', label: '법령·규정' },
  regulation: { dbKey: 'regulation', label: '법령·규정' },
};

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { kind: slugKind, id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  const kindInfo = KIND_MAP[slugKind.toLowerCase()] || { dbKey: 'publication', label: '자료실' };
  const canonicalSlug =
    slugKind.toLowerCase() === 'publication'
      ? 'publications'
      : slugKind.toLowerCase() === 'regulation'
      ? 'regulations'
      : slugKind.toLowerCase();

  await connectToDatabase();

  const currentResource = await Resource.findOne({
    _id: id,
    deletedAt: null,
  }).lean();

  if (!currentResource) {
    notFound();
  }

  // 이전글 / 다음글 조회
  const [prevResource, nextResource] = await Promise.all([
    Resource.findOne({
      deletedAt: null,
      kind: currentResource.kind,
      publishedAt: { $lt: currentResource.publishedAt },
    })
      .sort({ publishedAt: -1 })
      .select('_id title')
      .lean(),
    Resource.findOne({
      deletedAt: null,
      kind: currentResource.kind,
      publishedAt: { $gt: currentResource.publishedAt },
    })
      .sort({ publishedAt: 1 })
      .select('_id title')
      .lean(),
  ]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const publishedDateStr = currentResource.publishedAt
    ? new Date(currentResource.publishedAt).toISOString().slice(0, 10)
    : '';

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* 브레드크럼 */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <Link href="/resources" className="hover:underline">자료실</Link>
          <span>&gt;</span>
          <Link href={`/resources/${canonicalSlug}`} className="hover:underline">
            {kindInfo.label}
          </Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">
            {currentResource.title}
          </span>
        </nav>

        {/* 메인 상세 카드 */}
        <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-8">
          {/* 헤더 영역 */}
          <header className="p-6 sm:p-10 border-b border-slate-200 bg-slate-50/50">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 mb-4">
              {kindInfo.label}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mb-4 leading-snug">
              {currentResource.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
              {publishedDateStr && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  등록일: <time dateTime={publishedDateStr}>{publishedDateStr}</time>
                </span>
              )}

              {currentResource.authorOrDept && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  발행/담당부서: <strong>{currentResource.authorOrDept}</strong>
                </span>
              )}
            </div>
          </header>

          {/* 첨부파일 다운로드 박스 (§4.3) */}
          {currentResource.attachments && currentResource.attachments.length > 0 && (
            <div className="p-4 sm:p-6 bg-sky-50/40 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900 mb-3">
                <Download className="w-4 h-4 text-sky-600" />
                <span>첨부파일 다운로드 ({currentResource.attachments.length}개)</span>
              </div>

              <div className="space-y-2">
                {currentResource.attachments.map((att: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white border border-sky-100 shadow-2xs hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {att.name}
                      </span>
                      {att.size && (
                        <span className="text-xs text-slate-400 shrink-0">
                          ({formatFileSize(att.size)})
                        </span>
                      )}
                    </div>

                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F2C59] text-white text-xs font-bold hover:bg-sky-700 transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>파일 받기</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 자료 요약 및 본문 */}
          <div className="p-6 sm:p-10 space-y-6">
            {currentResource.summary && (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  자료 개요 (Summary)
                </h2>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line">
                  {currentResource.summary}
                </p>
              </div>
            )}

            <div className="pt-4 text-xs text-slate-400">
              ※ 본 자료의 저작권은 미래스마트산업진흥원에 있으며, 비영리 목적으로 인용 시 출처를 반드시 명시해 주시기 바랍니다.
            </div>
          </div>
        </article>

        {/* 이전글 / 다음글 네비게이션 */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden mb-8 text-xs sm:text-sm shadow-2xs">
          <div className="p-4 flex items-center gap-4">
            <span className="font-bold text-slate-400 shrink-0 w-16 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> 이전자료
            </span>
            {prevResource ? (
              <Link
                href={`/resources/${canonicalSlug}/${prevResource._id.toString()}`}
                className="text-slate-700 hover:text-[#0284C7] font-semibold truncate flex-1"
              >
                {prevResource.title}
              </Link>
            ) : (
              <span className="text-slate-400">이전 자료가 없습니다.</span>
            )}
          </div>

          <div className="p-4 flex items-center gap-4">
            <span className="font-bold text-slate-400 shrink-0 w-16 flex items-center gap-1">
              <ChevronRight className="w-4 h-4" /> 다음자료
            </span>
            {nextResource ? (
              <Link
                href={`/resources/${canonicalSlug}/${nextResource._id.toString()}`}
                className="text-slate-700 hover:text-[#0284C7] font-semibold truncate flex-1"
              >
                {nextResource.title}
              </Link>
            ) : (
              <span className="text-slate-400">다음 자료가 없습니다.</span>
            )}
          </div>
        </div>

        {/* 하단 버튼 바 */}
        <div className="flex items-center justify-between">
          <Link
            href={`/resources/${canonicalSlug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로 돌아가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
