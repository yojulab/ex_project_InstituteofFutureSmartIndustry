import React from 'react';
import Link from 'next/link';
import { BookOpen, Download, FileText, ArrowRight } from 'lucide-react';

export interface ResourceItem {
  id: string;
  kind: 'publication' | 'statistics' | 'regulation';
  title: string;
  summary: string;
  authorOrDept: string;
  publishedAt: string;
  downloadCount: number;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentSize?: number;
}

interface ResourceHighlightsProps {
  resources: ResourceItem[];
}

export const ResourceHighlights: React.FC<ResourceHighlightsProps> = ({ resources }) => {
  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'publication':
        return '간행물·보고서';
      case 'statistics':
        return '통계·동향';
      case 'regulation':
        return '법령·규정';
      default:
        return '자료';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16" aria-labelledby="resources-heading">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-[#0284C7]" />
            <span className="text-sm font-bold text-[#0284C7] tracking-wider uppercase">Publications</span>
          </div>
          <h2 id="resources-heading" className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59]">
            자료실 최신 발간물
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            진흥원에서 발간한 스마트제조 산업 동향 분석 보고서 및 통계 자료집입니다.
          </p>
        </div>

        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors group shrink-0"
        >
          <span>자료실 전체보기</span>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((item) => (
          <div
            key={item.id}
            className="flex flex-col bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-sky-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700">
                {getKindLabel(item.kind)}
              </span>
              <time className="text-xs text-slate-400" dateTime={item.publishedAt}>
                {item.publishedAt.slice(0, 10)}
              </time>
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 mb-2">
              <Link href="/resources">{item.title}</Link>
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-6 flex-1">
              {item.summary}
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">{item.authorOrDept}</span>

              {item.attachmentUrl ? (
                <a
                  href={item.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-[#0284C7] font-semibold text-slate-700 transition-colors shrink-0"
                  aria-label={`${item.title} 첨부파일 다운로드`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>다운로드 {item.attachmentSize ? `(${formatFileSize(item.attachmentSize)})` : ''}</span>
                </a>
              ) : (
                <span className="flex items-center gap-1 text-slate-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>원문 열람</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResourceHighlights;
