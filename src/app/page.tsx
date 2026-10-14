import React from 'react';
import { connectToDatabase } from '@/lib/db';
import {
  Banner,
  SiteSetting,
  QuickLink,
  Program,
  Post,
  Resource,
} from '@/models';
import NoticeBanner from '@/components/home/NoticeBanner';
import HeroSearch from '@/components/home/HeroSearch';
import QuickLinksGrid from '@/components/home/QuickLinksGrid';
import FeaturedPrograms from '@/components/home/FeaturedPrograms';
import NewsTabs from '@/components/home/NewsTabs';
import ResourceHighlights from '@/components/home/ResourceHighlights';

export const revalidate = 60; // ISR 60초 캐싱 (관리자 변경 시 revalidatePath로 즉시 갱신)

async function getHomeData() {
  try {
    await connectToDatabase();

    const [banners, siteSetting, quickLinks, programs, posts, resources] = await Promise.all([
      Banner.find({ isActive: true }).sort({ order: 1 }).lean(),
      SiteSetting.findOne().lean(),
      QuickLink.find({ isActive: true }).sort({ order: 1 }).lean(),
      Program.find({ deletedAt: null, isFeatured: true }).sort({ order: 1 }).limit(6).lean(),
      Post.find({ status: 'published', deletedAt: null })
        .sort({ isPinned: -1, publishedAt: -1 })
        .limit(15)
        .lean(),
      Resource.find({ deletedAt: null }).sort({ publishedAt: -1 }).limit(3).lean(),
    ]);

    return {
      banners: banners.map((b: any) => ({
        id: b._id.toString(),
        title: b.title,
        imageUrl: b.imageUrl,
        altText: b.altText,
        linkUrl: b.linkUrl || '',
        isExternal: b.isExternal || false,
      })),
      siteSetting: siteSetting
        ? {
            visionStatement: siteSetting.visionStatement,
            heroSubText: siteSetting.heroSubText,
            popularKeywords: siteSetting.popularKeywords || [],
          }
        : undefined,
      quickLinks: quickLinks.map((q: any) => ({
        id: q._id.toString(),
        title: q.title,
        description: q.description || '',
        icon: q.icon,
        href: q.href,
      })),
      programs: programs.map((p: any) => ({
        id: p._id.toString(),
        slug: p.slug,
        title: p.title,
        category: p.category,
        summary: p.summary,
        target: p.target,
        status: p.status,
        periodText: p.period?.rawText || '상시 접수',
        department: p.department,
      })),
      posts: posts.map((p: any) => ({
        id: p._id.toString(),
        type: p.type,
        title: p.title,
        slug: p.slug,
        publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : new Date().toISOString(),
        isPinned: p.isPinned || false,
        department: p.department || '',
      })),
      resources: resources.map((r: any) => ({
        id: r._id.toString(),
        kind: r.kind,
        title: r.title,
        summary: r.summary || '',
        authorOrDept: r.authorOrDept,
        publishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : new Date().toISOString(),
        downloadCount: r.downloadCount || 0,
        attachmentName: r.attachments?.[0]?.name,
        attachmentUrl: r.attachments?.[0]?.url,
        attachmentSize: r.attachments?.[0]?.size,
      })),
    };
  } catch (error) {
    console.error('[Home Page] Data fetching error, falling back to static defaults:', error);
    return {
      banners: [],
      siteSetting: undefined,
      quickLinks: [],
      programs: [],
      posts: [],
      resources: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. 공지 배너 */}
      <NoticeBanner banners={data.banners} />

      {/* 2. 히어로 + 중앙 검색 */}
      <HeroSearch
        visionStatement={data.siteSetting?.visionStatement}
        heroSubText={data.siteSetting?.heroSubText}
        popularKeywords={data.siteSetting?.popularKeywords}
      />

      {/* 3. 빠른 메뉴 (퀵링크 6종) */}
      <QuickLinksGrid links={data.quickLinks} />

      {/* 4. 주요 사업 안내 카드 (신청 폼 배제) */}
      <FeaturedPrograms programs={data.programs} />

      {/* 5. 새소식 탭 (공지/보도/행사) */}
      <NewsTabs posts={data.posts} />

      {/* 6. 자료실 하이라이트 */}
      <ResourceHighlights resources={data.resources} />
    </div>
  );
}
