import React from 'react';
import Link from 'next/link';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">웹접근성정책</span>
        </nav>

        <article className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mb-4">
            웹접근성정책 (KWCAG 2.2 준수)
          </h1>
          <p className="text-xs text-slate-400 mb-8">한국형 웹 콘텐츠 접근성 지침 2.2 표준 준수</p>

          <div className="prose-content space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              미래스마트산업진흥원은 장애인과 고령자를 포함한 모든 국민이 신체적·환경적 제약 없이 편리하게 누리집을 이용할 수 있도록 과학기술정보통신부 국가표준인 「한국형 웹 콘텐츠 접근성 지침 2.2 (KWCAG 2.2)」를 철저히 준수하여 구축·운영하고 있습니다.
            </p>

            <h2 className="text-base font-bold text-[#0F2C59] mt-6 mb-2">주요 접근성 편의 기능</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>본문 건너뛰기 링크 (Skip Navigation):</strong> 키보드 사용자가 Tab 키를 눌러 상단 헤더를 건너뛰고 본문으로 즉시 이동할 수 있습니다.</li>
              <li><strong>대체 텍스트 제공:</strong> 모든 이미지 및 배너에 시각장애인용 구체적인 대체 텍스트(alt)를 제공합니다.</li>
              <li><strong>자동 롤링 제어:</strong> 메인 배너에 재생/정지 제어 버튼을 제공하여 움직이는 콘텐츠를 직접 제어할 수 있습니다.</li>
              <li><strong>고대비 색상 설계:</strong> 텍스트와 배경 간 명도 대비 4.5:1 이상을 엄격히 준수합니다.</li>
              <li><strong>글자 크기 조절:</strong> 상단 유틸리티 바의 글자 확대/축소 기능을 통해 가독성을 조절할 수 있습니다.</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  );
}
