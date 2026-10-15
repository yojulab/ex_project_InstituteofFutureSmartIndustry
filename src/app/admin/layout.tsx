import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BookOpen,
  HelpCircle,
  Image,
  Users,
  History,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Building2,
  Settings,
} from 'lucide-react';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import DataResetButton from '@/components/admin/DataResetButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // 현재 요청 URL 헤더 확인
  const headersList = await headers();
  const currentPath = headersList.get('x-invoke-path') || '';

  // 로그인 페이지는 사이드바 없이 단독 렌더링
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* 관리자 좌측 사이드바 */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* 관리자 헤더 브랜딩 */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm block">진흥원 CMS</span>
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* 사용자 정보 미니 카드 */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-200">{session.name}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                session.role === 'admin'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
              }`}
            >
              {session.role === 'admin' ? '최고관리자' : '콘텐츠편집자'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">@{session.username}</div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 px-3 py-2 space-y-1 text-xs font-semibold" aria-label="관리자 메뉴">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-sky-400" />
            <span>대시보드</span>
          </Link>

          <Link
            href="/admin/posts"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>게시물 관리 (알림/보도)</span>
          </Link>

          <Link
            href="/admin/programs"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>사업안내 관리</span>
          </Link>

          <Link
            href="/admin/resources"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>자료실 관리</span>
          </Link>

          <Link
            href="/admin/faqs"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <span>FAQ 관리</span>
          </Link>

          <Link
            href="/admin/banners"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Image className="w-4 h-4 text-purple-400" />
            <span>배너/퀵링크 관리</span>
          </Link>

          <div className="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            시스템 관리
          </div>

          {session.role === 'admin' && (
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>관리자 계정 관리</span>
            </Link>
          )}

          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>보안 감사로그</span>
          </Link>

          {session.role === 'admin' && (
            <div className="pt-2 px-1">
              <DataResetButton className="w-full justify-start text-[11px] py-2" />
            </div>
          )}
        </nav>

        {/* 사이드바 하단 (포털 바로가기 및 로그아웃) */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>공개 포털 열기</span>
            </span>
            <span className="text-[10px] text-slate-500">새창</span>
          </Link>

          <AdminLogoutButton username={session.username} />
        </div>
      </aside>

      {/* 관리자 메인 영역 */}
      <main className="flex-1 overflow-y-auto bg-slate-900">
        <div className="p-6 sm:p-10">{children}</div>
      </main>
    </div>
  );
}
