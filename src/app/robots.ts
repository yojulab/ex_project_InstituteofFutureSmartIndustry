import { MetadataRoute } from 'next';
import { getAppUrl } from '@/lib/config/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/about/director', '/business', '/lectures', '/updates', '/contact', '/privacy'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
