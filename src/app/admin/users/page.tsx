import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { AdminUser } from '@/models/AdminUser';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Users, ShieldAlert, CheckCircle, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  // 최고관리자(Admin) 권한 체크 (RBAC)
  if (session.role !== 'admin') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center text-red-300">
        <ShieldAlert className="w-10 h-10 mx-auto text-red-400 mb-3" />
        <h1 className="text-lg font-bold text-white mb-1">접근 권한 제한</h1>
        <p className="text-xs text-slate-400">
          관리자 계정 관리 메뉴는 최고관리자(Admin) 권한을 가진 계정만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  await connectToDatabase();
  const users = await AdminUser.find().sort({ createdAt: 1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-extrabold text-white">관리자 계정 관리 (Admin 전용)</h1>
          </div>
          <p className="text-xs text-slate-400">
            시스템 관리자 및 콘텐츠 편집자 계정 자격증명과 잠금 상태를 관리합니다.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700">
              <th className="py-3.5 px-4 w-28">아이디</th>
              <th className="py-3.5 px-4 w-28">성명</th>
              <th className="py-3.5 px-4 w-24">권한</th>
              <th className="py-3.5 px-4">이메일</th>
              <th className="py-3.5 px-4 w-24 text-center">계정 상태</th>
              <th className="py-3.5 px-4 w-24 text-center">오류 횟수</th>
              <th className="py-3.5 px-4 w-32 text-center">최근 로그인</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300">
            {users.map((u: any) => {
              const isLocked = u.lockUntil && new Date(u.lockUntil) > new Date();

              return (
                <tr key={u._id.toString()} className="hover:bg-slate-700/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">
                    @{u.username}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {u.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                        <Lock className="w-2.5 h-2.5" />
                        잠금됨
                      </span>
                    ) : u.isActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        정상
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400">
                        비활성
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    {u.failedAttempts || 0} / 5
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toISOString().slice(0, 10) : '이력 없음'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
