import type { Metadata } from 'next';
import './globals.css';
import SkipNav from '@/components/layout/SkipNav';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UiInspector from '@/components/common/UiInspector';

export const metadata: Metadata = {
  title: {
    template: '%s | 미래스마트산업진흥원',
    default: '미래스마트산업진흥원 — 대한민국 제조 AI 및 스마트산업 혁신 선도',
  },
  description:
    '미래스마트산업진흥원 공식 누리집입니다. 중소·중견기업 제조 AI 융합 실증, 스마트공장 보급 및 DX, 디지털 인재양성 지원사업과 최신 산업 동향 정보를 안내합니다.',
  keywords: [
    '미래스마트산업진흥원',
    '스마트공장',
    '제조 AI',
    'DX 지원',
    '인재양성',
    '디지털전환',
    '스마트제조',
  ],
  authors: [{ name: '미래스마트산업진흥원' }],
  openGraph: {
    title: '미래스마트산업진흥원',
    description: '대한민국 미래 스마트 제조 및 AI 혁신 생태계를 선도합니다.',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
        <SkipNav />
        <Header />
        <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-hidden">
          {children}
        </div>
        <Footer />
        <UiInspector />
      </body>
    </html>
  );
}
