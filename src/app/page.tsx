import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import BusinessSection from '@/components/home/BusinessSection';
import FeaturedPostsSection from '@/components/home/FeaturedPostsSection';
import DirectorSummarySection from '@/components/home/DirectorSummarySection';
import ContactCtaSection from '@/components/home/ContactCtaSection';
import { getFeaturedPosts } from '@/lib/queries/posts';

export const revalidate = 60; // 60초 ISR (관리자 변경 시 revalidatePath로 즉시 갱신)

export default async function HomePage() {
  // 관리자에서 '메인 노출'로 승인된 최신 게시물 최대 3건 조회 (0건일 시 FeaturedPostsSection이 자체적으로 숨김)
  const featuredPosts = await getFeaturedPosts(3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. 대표 히어로 섹션 */}
      <HeroSection />

      {/* 2. 주요사업 섹션 (4개 카드, 민간자격 '준비 중' 표기, 신청버튼 배제) */}
      <BusinessSection />

      {/* 3. 주요 성과 섹션 (최대 3건, 0건 시 섹션 전체 Hide) */}
      <FeaturedPostsSection posts={featuredPosts} />

      {/* 4. 원장 프로필 요약 섹션 (학력-박사과정 명기, 실적 분리 고지) */}
      <DirectorSummarySection />

      {/* 5. 협력 문의 섹션 */}
      <ContactCtaSection />
    </div>
  );
}
