import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Faq } from '@/models/Faq';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { HelpCircle, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminFaqsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const faqs = await Faq.find().sort({ order: 1, createdAt: 1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl font-extrabold text-white">자주 묻는 질문(FAQ) 관리</h1>
          </div>
          <p className="text-xs text-slate-400">
            방문자에게 안내할 자주 묻는 질문과 답변을 등록하고 순서를 관리합니다.
          </p>
        </div>

        <Link
          href="/guide/faq"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span>FAQ 페이지 열람</span>
        </Link>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700">
              <th className="py-3.5 px-4 w-16 text-center">순서</th>
              <th className="py-3.5 px-4 w-28">분류</th>
              <th className="py-3.5 px-4">질문</th>
              <th className="py-3.5 px-4">답변 요약</th>
              <th className="py-3.5 px-4 w-20 text-center">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300">
            {faqs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  등록된 FAQ 항목이 없습니다.
                </td>
              </tr>
            ) : (
              faqs.map((faq: any) => (
                <tr key={faq._id.toString()} className="hover:bg-slate-700/40 transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                    {faq.order}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-400">
                    {faq.category}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {faq.question}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 line-clamp-1 max-w-md">
                    {faq.answer}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {faq.isActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        노출중
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400">
                        숨김
                      </span>
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
