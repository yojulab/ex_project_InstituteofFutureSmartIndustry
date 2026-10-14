import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Banner } from '@/models/Banner';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Image as ImageIcon, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const banners = await Banner.find().sort({ order: 1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold text-white">공지 배너 및 퀵링크 관리</h1>
          </div>
          <p className="text-xs text-slate-400">
            포털 상단 롤링 배너를 관리합니다. KWCAG 2.2 표준에 따라 대체 텍스트(alt)는 필수 입력 항목입니다.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>KWCAG 2.2 대체텍스트 필수 검증 활성</span>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700">
              <th className="py-3.5 px-4 w-16 text-center">순서</th>
              <th className="py-3.5 px-4 w-20 text-center">상태</th>
              <th className="py-3.5 px-4 w-32">배너 제목</th>
              <th className="py-3.5 px-4">대체 텍스트 (Alt Text - 필수)</th>
              <th className="py-3.5 px-4 w-36">링크 URL</th>
              <th className="py-3.5 px-4 w-24 text-center">포털열람</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300">
            {banners.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  등록된 배너가 없습니다.
                </td>
              </tr>
            ) : (
              banners.map((banner: any) => (
                <tr key={banner._id.toString()} className="hover:bg-slate-700/40 transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                    {banner.order}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {banner.isActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        활성
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400">
                        비활성
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {banner.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed">{banner.altText}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] truncate">
                    {banner.linkUrl || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {banner.linkUrl ? (
                      <Link
                        href={banner.linkUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>열기</span>
                      </Link>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
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
