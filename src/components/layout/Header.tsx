'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  Building2,
  ExternalLink,
  ShieldCheck,
  Globe,
} from 'lucide-react';

interface SubMenuItem {
  title: string;
  href: string;
  description?: string;
}

interface MenuItem {
  title: string;
  href: string;
  subItems: SubMenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    title: '진흥원 소개',
    href: '/about/vision',
    subItems: [
      { title: '인사말·비전', href: '/about/vision', description: '원장 인사말 및 미래 산업 발전 비전' },
      { title: '연혁', href: '/about/history', description: '진흥원의 발자취와 주요 성과' },
      { title: '조직·담당자 안내', href: '/about/organization', description: '부서별 업무 및 담당 연락망' },
      { title: '찾아오시는 길', href: '/about/location', description: '본원 및 교육장 위치, 대중교통' },
    ],
  },
  {
    title: '사업안내',
    href: '/programs',
    subItems: [
      { title: '사업 전체보기', href: '/programs', description: '진흥원 핵심 지원사업 종합 안내' },
      { title: '제조 AI 융합', href: '/programs?category=AI융합', description: '공정 최적화 및 품질검사 AI 지원' },
      { title: '스마트제조 보급·DX', href: '/programs?category=스마트제조', description: '스마트공장 고도화 및 데이터 표준화' },
      { title: '디지털 인재양성', href: '/programs?category=디지털인재', description: '현장 실무 중심 재직자 교육' },
      { title: '글로벌 진출 지원', href: '/programs?category=글로벌진출', description: '해외 로드쇼 및 수출 상담' },
    ],
  },
  {
    title: '알림마당',
    href: '/news/notice',
    subItems: [
      { title: '공지사항', href: '/news/notice', description: '진흥원 주요 소식 및 사업 공고' },
      { title: '보도자료', href: '/news/press', description: '언론 배포 자료 및 주요 보도' },
      { title: '행사·교육 일정', href: '/news/events', description: '세미나, 컨퍼런스, 포럼 일정' },
      { title: '입찰·공모', href: '/news/bids', description: '용역 및 물품 구매 입찰 정보' },
    ],
  },
  {
    title: '자료실',
    href: '/resources',
    subItems: [
      { title: '간행물·보고서', href: '/resources/publications', description: '산업 동향 분석 및 연구 보고서' },
      { title: '통계·동향', href: '/resources/statistics', description: '스마트제조 실태조사 및 통계' },
      { title: '법령·규정', href: '/resources/regulations', description: '진흥원 정관 및 관련 법령' },
    ],
  },
  {
    title: '이용안내',
    href: '/guide/faq',
    subItems: [
      { title: '자주 묻는 질문(FAQ)', href: '/guide/faq', description: '자주 접수되는 문의사항 답변' },
      { title: '문의 안내', href: '/guide/contact', description: '본원 부서별 유선 연락처 안내' },
      { title: '사이트맵', href: '/guide/sitemap', description: '누리집 전체 메뉴 구조' },
    ],
  },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);

  // 모바일 메뉴 열렸을 때 스크롤 잠금
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMenu(null);
  }, [pathname]);

  // 글자 크기 조절 (접근성 기능)
  const adjustFontSize = (delta: number) => {
    const newLevel = Math.max(-1, Math.min(2, fontSizeLevel + delta));
    setFontSizeLevel(newLevel);
    const scale = 1 + newLevel * 0.1;
    document.documentElement.style.fontSize = `${16 * scale}px`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* 1. 상단 유틸리티 바 */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              미래스마트산업진흥원 공식 누리집
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* 글자 크기 조절 */}
            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <span>글자크기</span>
              <button
                type="button"
                onClick={() => adjustFontSize(-1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                aria-label="글자 크기 축소"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => adjustFontSize(1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                aria-label="글자 크기 확대"
              >
                +
              </button>
            </div>

            <Link
              href="/admin/login"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>관리자 로그인</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 주 네비게이션 바 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20" id="main-navigation">
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-hidden"
            aria-label="미래스마트산업진흥원 메인으로 이동"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0F2C59] to-[#0284C7] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xl font-extrabold tracking-tight text-[#0F2C59]">
                미래스마트산업진흥원
              </span>
              <span className="block text-[10px] tracking-wider font-semibold text-slate-500 uppercase">
                Institute of Future Smart Industry
              </span>
            </div>
          </Link>

          {/* 데스크톱 GNB 메뉴 */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="메인 메뉴">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const isMenuOpen = activeMenu === item.title;

              return (
                <div
                  key={item.title}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.title)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-base font-bold transition-all ${
                      isActive
                        ? 'text-[#0284C7] bg-sky-50'
                        : 'text-slate-800 hover:text-[#0F2C59] hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isMenuOpen ? 'rotate-180 text-[#0284C7]' : 'text-slate-400'
                      }`}
                    />
                  </Link>

                  {/* 메가 드롭다운 메뉴 */}
                  {isMenuOpen && (
                    <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-3 px-2 transition-all animate-in fade-in slide-in-from-top-2 duration-150">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.title}
                          href={sub.href}
                          className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-[#0284C7]">
                            {sub.title}
                          </div>
                          {sub.description && (
                            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {sub.description}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* 우측 검색 버튼 & 모바일 햄버거 토글 */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
              aria-label="통합검색 페이지로 이동"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">통합검색</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? '전체 메뉴 닫기' : '전체 메뉴 열기'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. 모바일 전체 드로어 메뉴 */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[110px] bottom-0 bg-white z-50 overflow-y-auto border-t border-slate-200 p-6 shadow-2xl">
          <div className="space-y-6">
            {MENU_ITEMS.map((item) => (
              <div key={item.title} className="border-b border-slate-100 pb-4">
                <Link
                  href={item.href}
                  className="block text-lg font-bold text-[#0F2C59] mb-2"
                >
                  {item.title}
                </Link>
                <div className="grid grid-cols-1 gap-1.5 pl-2">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.title}
                      href={sub.href}
                      className="py-1.5 text-sm text-slate-600 hover:text-[#0284C7] font-medium"
                    >
                      • {sub.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/admin/login"
                className="w-full text-center py-2.5 rounded-lg bg-slate-800 text-white font-semibold text-sm"
              >
                관리자 시스템 바로가기
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
