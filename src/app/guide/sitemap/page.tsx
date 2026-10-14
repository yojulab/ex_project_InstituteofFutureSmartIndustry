import React from 'react';
import Link from 'next/link';
import { Compass, ExternalLink } from 'lucide-react';

export default function SitemapPage() {
  const sections = [
    {
      title: '진흥원 소개',
      links: [
        { label: '인사말·비전', href: '/about/vision' },
        { label: '연혁', href: '/about/history' },
        { label: '조직·담당자 안내', href: '/about/organization' },
        { label: '찾아오시는 길', href: '/about/location' },
      ],
    },
    {
      title: '사업안내',
      links: [
        { label: '사업 전체보기', href: '/programs' },
        { label: '제조 AI 융합 실증', href: '/programs?category=AI융합' },
        { label: '스마트제조 보급·DX', href: '/programs?category=스마트제조' },
        { label: '디지털 인재양성', href: '/programs?category=디지털인재' },
        { label: '글로벌 진출 지원', href: '/programs?category=글로벌진출' },
      ],
    },
    {
      title: '알림마당',
      links: [
        { label: '공지사항', href: '/news/notice' },
        { label: '보도자료', href: '/news/press' },
        { label: '행사·교육 일정', href: '/news/events' },
        { label: '입찰·공모', href: '/news/bids' },
      ],
    },
    {
      title: '자료실',
      links: [
        { label: '전체 자료', href: '/resources' },
        { label: '간행물·보고서', href: '/resources/publications' },
        { label: '통계·동향', href: '/resources/statistics' },
        { label: '법령·규정', href: '/resources/regulations' },
      ],
    },
    {
      title: '이용안내 & 정책',
      links: [
        { label: '자주 묻는 질문(FAQ)', href: '/guide/faq' },
        { label: '문의 안내', href: '/guide/contact' },
        { label: '개인정보처리방침', href: '/privacy' },
        { label: '저작권보호정책', href: '/copyright' },
        { label: '웹접근성정책', href: '/accessibility' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">사이트맵</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-sky-600" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
              누리집 사이트맵
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            미래스마트산업진흥원 누리집의 전체 메뉴 구조를 한눈에 확인하실 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs"
            >
              <h2 className="text-base font-bold text-[#0F2C59] pb-3 mb-3 border-b border-slate-100">
                {section.title}
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-[#0284C7] hover:underline flex items-center justify-between py-1 group"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-sky-500 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
