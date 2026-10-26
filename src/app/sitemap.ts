import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartindustry.or.kr';

  // 1. 7대 고정 페이지 정의
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/director`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/business`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/updates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // 2. 데이터베이스 내 공개 게시물 동적 URL 생성
  try {
    await connectToDatabase();
    const publicPosts = await Post.find({
      status: 'public',
      deletedAt: null,
    })
      .select('slug updatedAt createdAt')
      .lean();

    const postRoutes: MetadataRoute.Sitemap = publicPosts.map((post: any) => ({
      url: `${baseUrl}/updates/${post.slug}`,
      lastModified: post.updatedAt || post.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...postRoutes];
  } catch (error) {
    console.error('[Sitemap] Failed to fetch dynamic post routes:', error);
    return staticRoutes;
  }
}
