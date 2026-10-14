import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Program } from '@/models/Program';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {
  Calendar,
  Users,
  Building,
  Phone,
  ArrowLeft,
  ExternalLink,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface ProgramDetailProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export default async function ProgramDetailPage({ params }: ProgramDetailProps) {
  const { slug } = await params;

  await connectToDatabase();
  const program = await Program.findOne({ slug, deletedAt: null }).lean();

  if (!program) {
    notFound();
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'open':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            접수중 (정보 안내)
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            접수예정
          </span>
        );
      case 'closed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            마감
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        {/* 상단 브레드크럼 */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <Link href="/programs" className="hover:underline">사업안내</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{program.title}</span>
        </nav>

        {/* 상단 헤더: 분류, 상태, 타이틀 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
              {program.category}
            </span>
            {getStatusBadge(program.status)}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F2C59] tracking-tight mb-4">
            {program.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {program.summary}
          </p>

          {/* 상단 핵심 요약 카드 (§4.4) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-500 block text-xs">지원 대상</span>
                <span className="text-slate-900 font-semibold">{program.target}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-500 block text-xs">접수/진행 기간</span>
                <span className="text-slate-900 font-semibold">{program.period?.rawText || '상시'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-500 block text-xs">담당 부서</span>
                <span className="text-slate-900 font-semibold">{program.department}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-500 block text-xs">문의처</span>
                <span className="text-slate-900 font-semibold">{program.contact}</span>
              </div>
            </div>
          </div>

          {/* 외부 공식 안내 링크 (신청 폼 아님, 정보 제공 링크) */}
          {program.externalUrl && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-sky-50/50 p-4 rounded-xl border border-sky-100">
              <div className="text-xs text-sky-900">
                <span className="font-bold block">공식 공고 원문 안내</span>
                <span>세부 사업 규정 및 정부 주관 공고 원문은 주관 기관 누리집에서 열람하실 수 있습니다.</span>
              </div>
              <a
                href={program.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#0F2C59] hover:bg-[#163B75] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>관련 공식 사이트 안내 (새창)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* 사업 상세 본문 (마크다운 살균 렌더링) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-[#0F2C59]">사업 상세 안내 내용</h2>
          </div>

          <div className="prose-content text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {program.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* 하단 네비게이션 액션 */}
        <div className="flex items-center justify-between">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-sm font-bold shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>사업 목록으로</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
