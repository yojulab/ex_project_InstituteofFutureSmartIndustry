import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartindustry.or.kr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/about/director', '/business', '/updates', '/contact', '/privacy'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
