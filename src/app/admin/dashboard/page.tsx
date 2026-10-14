import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import {
  Post,
  Program,
  Resource,
  Faq,
  Banner,
  AuditLog,
} from '@/models';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  FileText,
  Briefcase,
  BookOpen,
  HelpCircle,
  Image,
  History,
  ShieldCheck,
  Server,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();

  const [
    postCount,
    programCount,
    resourceCount,
    faqCount,
    bannerCount,
    recentLogs,
  ] = await Promise.all([
    Post.countDocuments({ deletedAt: null }),
    Program.countDocuments({ deletedAt: null }),
    Resource.countDocuments({ deletedAt: null }),
    Faq.countDocuments({ isActive: true }),
    Banner.countDocuments({ isActive: true }),
    AuditLog.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  return (
    <div className="space-y-8">
      {/* 환영 및 상태 바 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/80 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-400">시스템 정상 가동 중</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            환영합니다, {session.name} 관리자님!
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            미래스마트산업진흥원 포털 콘텐츠를 등록·수정·배포하실 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>새 게시물 작성</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>포털 확인</span>
          </Link>
        </div>
      </div>

      {/* 핵심 콘텐츠 현황 통계 카드 그리드 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href="/admin/posts"
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">알림마당 게시물</span>
            <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{postCount}</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">공지/보도/행사/입찰</span>
        </Link>

        <Link
          href="/admin/programs"
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/50 transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">주요 지원사업</span>
            <Briefcase className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{programCount}</div>
          <span className="text-[11px] text-amber-400 mt-1 block">안내 전용 정보</span>
        </Link>

        <Link
          href="/admin/resources"
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">자료실 발간물</span>
            <BookOpen className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{resourceCount}</div>
          <span className="text-[11px] text-indigo-400 mt-1 block">보고서/통계/법령</span>
        </Link>

        <Link
          href="/admin/faqs"
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-rose-500/50 transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">자주 묻는 질문</span>
            <HelpCircle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{faqCount}</div>
          <span className="text-[11px] text-rose-400 mt-1 block">카테고리별 답변</span>
        </Link>

        <Link
          href="/admin/banners"
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/50 transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">활성 공지 배너</span>
            <Image className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{bannerCount}</div>
          <span className="text-[11px] text-purple-400 mt-1 block">KWCAG alt 검증</span>
        </Link>
      </div>

      {/* 하단 2단 그리드: 최근 보안 감사로그 및 인프라 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 감사로그 */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">최근 보안 감사로그</h2>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              전체 로그 보기 &gt;
            </Link>
          </div>

          <div className="divide-y divide-slate-700/40 text-xs">
            {recentLogs.length === 0 ? (
              <div className="py-6 text-center text-slate-500">기록된 로그가 없습니다.</div>
            ) : (
              recentLogs.map((log: any) => (
                <div key={log._id.toString()} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'LOGIN'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : log.action === 'LOGIN_FAILED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-200 truncate">
                      @{log.username}
                    </span>
                    {log.details && (
                      <span className="text-slate-400 truncate hidden sm:inline">
                        {JSON.stringify(log.details)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString('ko-KR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 시스템 및 인프라 보안 상태 */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700/60">
            <Server className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-white text-base">시스템 보안 현황</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">데이터베이스 인프라</span>
              <span className="font-bold text-white text-sm">MongoDB 자체 운영 (GCE VM)</span>
              <span className="text-emerald-400 text-[11px] block mt-0.5">
                ● 사설 VPC 격리 (No Public IP)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">관리자 인증 체계</span>
              <span className="font-bold text-white text-sm">Argon2id/bcrypt 직접 인증</span>
              <span className="text-sky-400 text-[11px] block mt-0.5">
                ● 5회 실패 잠금 (15분) 및 세션 격리
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">검색 프라이버시 엔진</span>
              <span className="font-bold text-white text-sm">On-Device 의미 검색</span>
              <span className="text-indigo-400 text-[11px] block mt-0.5">
                ● 외부 LLM 유출 0건 보장
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
