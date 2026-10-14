import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { AuditLog } from '@/models/AuditLog';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { History, Shield, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).lean();

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">LOGIN</span>;
      case 'LOGIN_FAILED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">LOGIN_FAILED</span>;
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">DELETE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-extrabold text-white">보안 감사로그 (Audit Logs)</h1>
          </div>
          <p className="text-xs text-slate-400">
            관리자 로그인 및 콘텐츠의 등록·수정·삭제 행위가 위변조 불가능한 방식으로 실시간 기록됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>수정·삭제 불가 불변 로그 (Append-Only)</span>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700">
              <th className="py-3.5 px-4 w-36">일시</th>
              <th className="py-3.5 px-4 w-28">행위</th>
              <th className="py-3.5 px-4 w-32">관리자</th>
              <th className="py-3.5 px-4 w-28">대상 컬렉션</th>
              <th className="py-3.5 px-4">상세 내역 (Details)</th>
              <th className="py-3.5 px-4 w-32 text-right">IP 주소</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300 font-mono text-[11px]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  기록된 감사로그가 없습니다.
                </td>
              </tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log._id.toString()} className="hover:bg-slate-700/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="py-3.5 px-4">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white font-sans">
                    @{log.username}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {log.targetCollection || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 truncate max-w-md">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
