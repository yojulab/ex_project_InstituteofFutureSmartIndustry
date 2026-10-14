import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { Faq } from '@/models/Faq';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FaqPageProps {
  searchParams: Promise<{ category?: string }>;
}

export const revalidate = 60;

export default async function FaqPage({ searchParams }: FaqPageProps) {
  const { category } = await searchParams;

  await connectToDatabase();

  const query: any = { isActive: true };
  if (category && category !== 'all') {
    query.category = category;
  }

  const faqs = await Faq.find(query).sort({ order: 1, createdAt: 1 }).lean();

  const categories = ['전체', '사업안내', '교육안내', '자료이용', '누리집이용', '기타'];

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <Link href="/guide/faq" className="hover:underline">이용안내</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">자주 묻는 질문 (FAQ)</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            자주 묻는 질문 (FAQ)
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            방문자 및 기업 고객께서 자주 문의하시는 주요 질문과 답변입니다.
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 pb-3">
          {categories.map((cat) => {
            const isSelected = (!category && cat === '전체') || category === cat;
            return (
              <Link
                key={cat}
                href={`/guide/faq${cat !== '전체' ? `?category=${encodeURIComponent(cat)}` : ''}`}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-[#0F2C59] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* FAQ 아코디언 목록 */}
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              등록된 질문이 없습니다.
            </div>
          ) : (
            faqs.map((faq: any) => (
              <details
                key={faq._id.toString()}
                className="group bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
              >
                <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer list-none select-none hover:bg-slate-50">
                  <div className="flex items-center gap-3 pr-4">
                    <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 font-black flex items-center justify-center text-sm shrink-0">
                      Q
                    </span>
                    <span className="font-bold text-slate-900 text-sm sm:text-base group-open:text-[#0284C7]">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
                </summary>

                <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-slate-100 bg-slate-50/50 text-xs sm:text-sm text-slate-700 leading-relaxed pl-14">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-xs shrink-0">
                      A
                    </span>
                    <div>{faq.answer}</div>
                  </div>
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
