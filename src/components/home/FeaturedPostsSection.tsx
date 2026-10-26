import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, ExternalLink } from 'lucide-react';
import { PostListItem } from '@/lib/queries/posts';
import UiBadge from '@/components/common/UiBadge';

interface FeaturedPostsSectionProps {
  posts: PostListItem[];
}

const CATEGORY_NAMES: Record<string, { label: string; color: string }> = {
  notice: { label: '공지사항', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  activity: { label: '기관 활동·보도', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paper: { label: '학술논문', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  director: { label: '원장 대외활동', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export const FeaturedPostsSection: React.FC<FeaturedPostsSectionProps> = ({ posts }) => {
  // [필수 예외처리] 0건인 경우 가상 더미를 띄우지 않고 섹션 전체를 완전히 숨김(Hide) (지시서 4.1.4항)
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div className="relative">
            <UiBadge id="P01-SEC03-POST01" name="메인 주요 성과 섹션" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
              진흥원 주요 소식 및 성과
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              미래스마트산업진흥원의 최근 주요 활동, 공지사항 및 학술 성과를 전해드립니다.
            </p>
          </div>

          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0284C7] hover:text-[#0F2C59] transition-colors"
          >
            <span>전체 소식 보기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 메인 노출 승인 게시물 카드 (최대 3건) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post, idx) => {
            const catInfo = CATEGORY_NAMES[post.category] || {
              label: post.category,
              color: 'bg-slate-50 text-slate-700 border-slate-200',
            };
            const serialId = `P01-SEC03-CRD0${idx + 1}`;
            const displayDate = post.eventDate
              ? new Date(post.eventDate).toLocaleDateString('ko-KR')
              : new Date(post.createdAt).toLocaleDateString('ko-KR');

            return (
              <article
                key={post.id}
                className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <UiBadge id={serialId} name={`주요성과: ${post.title}`} />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {displayDate}
                    </span>
                  </div>

                  <Link href={`/updates/${post.slug || post.id}`} className="block group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  {post.summary && (
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  )}

                  {post.journal && (
                    <div className="mt-3 text-xs text-slate-500 font-medium line-clamp-1">
                      학술지: {post.journal} {post.volumeIssuePages && `(${post.volumeIssuePages})`}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-[#0284C7]">
                  <Link href={`/updates/${post.slug || post.id}`} className="hover:underline">
                    자세히 보기
                  </Link>
                  {post.doi && (
                    <a
                      href={post.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
                    >
                      <span>DOI 원문</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPostsSection;
