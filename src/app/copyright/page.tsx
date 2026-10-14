import React from 'react';
import Link from 'next/link';

export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">저작권보호정책</span>
        </nav>

        <article className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mb-4">
            저작권보호정책
          </h1>
          <p className="text-xs text-slate-400 mb-8">시행일자: 2026년 10월 14일</p>

          <div className="prose-content space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              미래스마트산업진흥원 누리집에서 제공하는 모든 콘텐츠(글, 사진, 그래픽, 영상, 발간 보고서 등)는 저작권법의 보호를 받습니다.
            </p>
            <p>
              진흥원에서 발행한 공공누리 제1유형(출처표시) 부착 발간물은 별도의 이용허락 없이 출처(미래스마트산업진흥원)를 명시하여 자유롭게 이용 및 2차 저작물 작성이 가능합니다. 단, 상업적 왜곡이나 기관의 명예를 훼손하는 용도의 무단 도용은 금지됩니다.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
