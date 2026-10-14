import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Resource } from '@/models/Resource';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { BookOpen, Download, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminResourcesPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const resources = await Resource.find({ deletedAt: null })
    .sort({ publishedAt: -1 })
    .lean();

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'publication':
        return '간행물·보고서';
      case 'statistics':
        return '통계·동향';
      case 'regulation':
        return '법령·규정';
      default:
        return kind;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-extrabold text-white">자료실 관리</h1>
          </div>
          <p className="text-xs text-slate-400">
            보고서, 통계 자료집, 규정집 콘텐츠 및 첨부파일을 관리합니다.
          </p>
        </div>

        <Link
          href="/resources"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span>자료실 페이지 열람</span>
        </Link>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700">
              <th className="py-3.5 px-4 w-28">분류</th>
              <th className="py-3.5 px-4">자료명</th>
              <th className="py-3.5 px-4 w-32">담당/작성</th>
              <th className="py-3.5 px-4 w-28 text-center">등록일자</th>
              <th className="py-3.5 px-4 w-24 text-center">다운로드수</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300">
            {resources.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  등록된 자료가 없습니다.
                </td>
              </tr>
            ) : (
              resources.map((item: any) => (
                <tr key={item._id.toString()} className="hover:bg-slate-700/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-400">
                    {getKindLabel(item.kind)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {item.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {item.authorOrDept}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {new Date(item.publishedAt).toISOString().slice(0, 10)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-sky-400 font-bold">
                    {item.downloadCount || 0}
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
