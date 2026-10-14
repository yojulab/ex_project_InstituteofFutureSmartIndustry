import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Program } from '@/models/Program';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Briefcase, PlusCircle, ExternalLink, Calendar, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProgramsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const programs = await Program.find({ deletedAt: null })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'open':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300">접수중</span>;
      case 'upcoming':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">접수예정</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300">마감</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-extrabold text-white">주요 사업안내 관리</h1>
          </div>
          <p className="text-xs text-slate-400">
            진흥원 지원사업 정보를 안내하며, 온라인 신청·접수 폼은 배치되지 않습니다.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700">
              <th className="py-3.5 px-4 w-16 text-center">순서</th>
              <th className="py-3.5 px-4 w-20 text-center">상태</th>
              <th className="py-3.5 px-4 w-24">분류</th>
              <th className="py-3.5 px-4">사업명</th>
              <th className="py-3.5 px-4 w-32">담당부서</th>
              <th className="py-3.5 px-4 w-24 text-center">메인노출</th>
              <th className="py-3.5 px-4 w-24 text-center">포털열람</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300">
            {programs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  등록된 사업이 없습니다.
                </td>
              </tr>
            ) : (
              programs.map((prog: any) => (
                <tr key={prog._id.toString()} className="hover:bg-slate-700/40 transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                    {prog.order}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(prog.status)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-400">
                    {prog.category}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    <span className="line-clamp-1">{prog.title}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 truncate">
                    {prog.department}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {prog.isFeatured ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">노출</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/programs/${prog.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>보기</span>
                    </Link>
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
