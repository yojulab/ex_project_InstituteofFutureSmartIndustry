'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Building2, ShieldCheck } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

interface NavItem {
  title: string;
  href: string;
}

// v4.1 확정 상위 5대 GNB (온라인 강좌 신설 반영)
const NAV_ITEMS: NavItem[] = [
  { title: '진흥원 소개', href: '/about' },
  { title: '주요사업', href: '/business' },
  { title: '온라인 강좌', href: '/lectures' },
  { title: '소식·성과', href: '/updates' },
  { title: '문의하기', href: '/contact' },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
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
  }, [pathname]);

  // Esc 키로 모바일 메뉴 닫기 (접근성)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // 글자 크기 조절 (접근성)
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
            <div className="relative hidden sm:flex items-center gap-1 text-slate-400">
              <UiBadge id="P00-HDR-BTN01" name="글자 크기 조절" />
              <span>글자크기</span>
              <button
                type="button"
                onClick={() => adjustFontSize(-1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold cursor-pointer"
                aria-label="글자 크기 축소"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => adjustFontSize(1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold cursor-pointer"
                aria-label="글자 크기 확대"
              >
                +
              </button>
            </div>

            <Link
              href="/admin/login"
              className="relative flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
              aria-label="관리자 로그인"
            >
              <UiBadge id="P00-HDR-BTN02" name="상단 관리자 로그인 바로가기" />
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span>관리자</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 주 네비게이션 바 (4대 GNB) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20" id="main-navigation">
          {/* 로고 */}
          <Link
            href="/"
            className="relative flex items-center gap-3.5 group focus:outline-hidden"
            aria-label="미래스마트산업진흥원 메인으로 이동"
          >
            <UiBadge id="P00-HDR-LOGO01" name="진흥원 로고 & 홈 바로가기" />
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

          {/* 데스크톱 GNB 메뉴 (4개 메뉴) */}
          <nav className="hidden md:flex items-center gap-2" aria-label="메인 메뉴">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = pathname.startsWith(item.href);
              const serialId = `P00-HDR-NAV0${idx + 1}`;

              return (
                <div key={item.title} className="relative">
                  <UiBadge id={serialId} name={`GNB ${item.title} 메뉴`} />
                  <Link
                    href={item.href}
                    className={`px-4 py-2.5 rounded-lg text-base font-bold transition-all ${
                      isActive
                        ? 'text-[#0284C7] bg-sky-50'
                        : 'text-slate-800 hover:text-[#0F2C59] hover:bg-slate-100'
                    }`}
                  >
                    {item.title}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* 모바일 햄버거 토글 */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden cursor-pointer"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? '전체 메뉴 닫기' : '전체 메뉴 열기'}
            >
              <UiBadge id="P00-HDR-BTN03" name="모바일 메뉴 토글 버튼" />
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. 모바일 전체 드로어 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[110px] bottom-0 bg-white z-50 overflow-y-auto border-t border-slate-200 p-6 shadow-2xl">
          <nav className="space-y-4" aria-label="모바일 메인 메뉴">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`block px-4 py-3 rounded-xl text-lg font-bold transition-colors ${
                    isActive ? 'text-[#0284C7] bg-sky-50' : 'text-[#0F2C59] hover:bg-slate-50'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
