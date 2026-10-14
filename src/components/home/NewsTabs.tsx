'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, ArrowRight, Pin, ChevronRight } from 'lucide-react';

export interface PostItem {
  id: string;
  type: 'notice' | 'press' | 'event' | 'bid';
  title: string;
  slug: string;
  publishedAt: string;
  isPinned: boolean;
  department?: string;
}

interface NewsTabsProps {
  posts: PostItem[];
}

const TABS = [
  { key: 'all', label: '전체 소식' },
  { key: 'notice', label: '공지사항' },
  { key: 'press', label: '보도자료' },
  { key: 'event', label: '행사·교육' },
  { key: 'bid', label: '입찰공고' },
];

export const NewsTabs: React.FC<NewsTabsProps> = ({ posts }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredPosts =
    activeTab === 'all'
      ? posts.slice(0, 5)
      : posts.filter((p) => p.type === activeTab).slice(0, 5);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'notice':
        return '공지';
      case 'press':
        return '보도';
      case 'event':
        return '행사';
      case 'bid':
        return '입찰';
      default:
        return '소식';
    }
  };

  return (
    <section className="bg-slate-50 py-16 border-y border-slate-200/80" aria-labelledby="news-tabs-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-[#0284C7]" />
              <span className="text-sm font-bold text-[#0284C7] tracking-wider uppercase">Notice & Media</span>
            </div>
            <h2 id="news-tabs-heading" className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59]">
              알림마당 새소식
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              진흥원의 최신 공지사항과 보도자료, 행사 일정을 신속하게 전해드립니다.
            </p>
          </div>

          <Link
            href="/news/notice"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-800 text-sm font-bold transition-colors group shadow-xs shrink-0"
          >
            <span>소식 더보기</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 탭 버튼 네비게이션 */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#0F2C59] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              등록된 게시물이 없습니다.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.type}/${post.slug}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* 유형 뱃지 */}
                  <span className="shrink-0 px-2.5 py-1 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {getTypeLabel(post.type)}
                  </span>

                  {/* 상단 고정 핀 */}
                  {post.isPinned && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Pin className="w-3 h-3" />
                      고정
                    </span>
                  )}

                  {/* 제목 */}
                  <span className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-[#0284C7] transition-colors truncate">
                    {post.title}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 self-end sm:self-center pl-10 sm:pl-0">
                  {post.department && <span>{post.department}</span>}
                  <time dateTime={post.publishedAt}>{post.publishedAt.slice(0, 10)}</time>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0284C7] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsTabs;
