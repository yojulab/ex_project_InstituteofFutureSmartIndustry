'use client';

import React from 'react';
import Link from 'next/link';
import { Building, Phone, Mail, Printer, Shield } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

const FAMILY_SITES = [
  { name: '과학기술정보통신부', url: 'https://www.msit.go.kr' },
  { name: '중소벤처기업부', url: 'https://www.mss.go.kr' },
  { name: '한국지능정보사회진흥원(NIA)', url: 'https://www.nia.or.kr' },
  { name: '한국소프트웨어산업협회(KOSA)', url: 'https://www.sw.or.kr' },
  { name: '중소기업기술정보진흥원(TIPA)', url: 'https://www.tipa.or.kr' },
];

export const Footer: React.FC = () => {
  const handleFamilySiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = e.target.value;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      e.target.value = '';
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      {/* 1. 정책 바로가기 링크 */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <nav className="relative flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium" aria-label="하단 정책 메뉴">
            <UiBadge id="P00-FTR-NAV01" name="하단 정책 메뉴 네비게이션" />
            <Link
              href="/privacy"
              className="text-white font-bold hover:text-sky-400 transition-colors underline underline-offset-4"
            >
              개인정보처리방침
            </Link>
            <Link href="/copyright" className="hover:text-slate-200 transition-colors">
              저작권보호정책
            </Link>
            <Link href="/accessibility" className="hover:text-slate-200 transition-colors">
              웹접근성정책
            </Link>
            <Link href="/about/location" className="hover:text-slate-200 transition-colors">
              찾아오시는 길
            </Link>
            <Link href="/guide/sitemap" className="hover:text-slate-200 transition-colors">
              사이트맵
            </Link>
          </nav>

          {/* 패밀리 사이트 셀렉트 */}
          <div className="relative flex items-center gap-2">
            <UiBadge id="P00-FTR-SEL01" name="관련기관 및 패밀리사이트 바로가기 셀렉터" />
            <label htmlFor="family-site-select" className="sr-only">
              관련기관 및 패밀리사이트 바로가기
            </label>
            <div className="relative">
              <select
                id="family-site-select"
                onChange={handleFamilySiteChange}
                defaultValue=""
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 text-xs pr-8 focus:outline-hidden focus:border-sky-500 cursor-pointer"
              >
                <option value="" disabled>
                  관련기관 바로가기 ↗
                </option>
                {FAMILY_SITES.map((site) => (
                  <option key={site.name} value={site.url}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 기관 상세 정보 및 카피라이트 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <UiBadge id="P00-FTR-INFO01" name="진흥원 기관 정보 및 연락망" />
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <Building className="w-5 h-5 text-sky-400" />
              <span>미래스마트산업진흥원 (Institute of Future Smart Industry)</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              (06578) 서울특별시 서초구 반포대로 123 미래스마트산업진흥원 본원 | 사업자등록번호: 101-82-00000
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                대표전화: <strong>02-1234-5678</strong> (평일 09:00~18:00)
              </span>
              <span className="flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                팩스: 02-1234-5679
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                이메일: contact@smartindustry.or.kr
              </span>
            </div>

            <p className="text-xs text-slate-500 pt-3">
              Copyright © 2026 Institute of Future Smart Industry. All rights reserved.
            </p>
          </div>

          {/* 인증 및 접근성 마크 안내 */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between h-full gap-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">KWCAG 2.2 웹 접근성 인증</div>
                <div className="text-[11px] text-slate-400">과학기술정보통신부 국가표준 준수</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
