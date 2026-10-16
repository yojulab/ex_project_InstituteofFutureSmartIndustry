'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, ChevronLeft, ChevronRight, X } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  isExternal: boolean;
}

interface NoticeBannerProps {
  banners: BannerItem[];
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true); // SSR hydration safe

  useEffect(() => {
    // 로컬 스토리지 "오늘 하루 보지 않기" 확인
    const dismissedUntil = localStorage.getItem('dismiss_notice_banner_until');
    if (dismissedUntil && new Date().getTime() < Number(dismissedUntil)) {
      setIsDismissed(true);
    } else {
      setIsDismissed(false);
    }
  }, []);

  // 자동 롤링 (일시정지 지원)
  useEffect(() => {
    if (!isPlaying || banners.length <= 1 || isDismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, banners.length, isDismissed]);

  const handleDismissToday = () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    localStorage.setItem('dismiss_notice_banner_until', endOfDay.getTime().toString());
    setIsDismissed(true);
  };

  if (isDismissed || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="bg-slate-900 border-b border-slate-800 text-white relative overflow-hidden" aria-label="주요 알림 배너">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 배너 콘텐츠 링크 */}
          <div className="relative flex-1 flex items-center gap-4 min-w-0">
            <UiBadge id="P01-SEC01-BNR01" name="상단 롤링 공지 배너" />
            <span className="shrink-0 px-2.5 py-1 rounded-md bg-sky-500 text-white font-bold text-xs">
              공지 배너 {currentIndex + 1}/{banners.length}
            </span>

            <Link
              href={currentBanner.linkUrl || '#'}
              target={currentBanner.isExternal ? '_blank' : undefined}
              rel={currentBanner.isExternal ? 'noopener noreferrer' : undefined}
              className="text-sm sm:text-base font-semibold hover:text-sky-300 transition-colors truncate focus:outline-hidden"
              title={currentBanner.altText}
            >
              {currentBanner.title}
            </Link>
          </div>

          {/* 배너 제어 컨트롤 (재생/정지, 이전/다음, 오늘 하루 닫기) */}
          <div className="flex items-center gap-3 shrink-0 text-xs text-slate-300">
            {/* 이전/다음 슬라이드 */}
            <div className="relative flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <UiBadge id="P01-SEC01-BTN01" name="공지 배너 롤링 컨트롤" />
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                aria-label="이전 배너 보기"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                aria-label={isPlaying ? '배너 자동 롤링 정지' : '배너 자동 롤링 재생'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="p-1 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                aria-label="다음 배너 보기"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 오늘 하루 보지 않기 */}
            <button
              type="button"
              onClick={handleDismissToday}
              className="px-2.5 py-1 rounded-md hover:bg-slate-800 hover:text-white transition-colors underline underline-offset-2"
            >
              오늘 하루 열지 않음
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              aria-label="알림 배너 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoticeBanner;
