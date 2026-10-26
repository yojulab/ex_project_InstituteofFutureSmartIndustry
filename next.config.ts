import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentUpgrade: "security",
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '0.0.0.0'],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // 1. 소개 하위 레거시 경로 -> /about
      { source: '/about/vision', destination: '/about', permanent: true },
      { source: '/about/history', destination: '/about', permanent: true },
      { source: '/about/organization', destination: '/about', permanent: true },
      { source: '/about/location', destination: '/about', permanent: true },

      // 2. 사업안내 레거시 경로 -> /business
      { source: '/programs', destination: '/business', permanent: true },
      { source: '/programs/:slug*', destination: '/business', permanent: true },

      // 3. 알림/자료실/검색 레거시 경로 -> /updates
      { source: '/news', destination: '/updates', permanent: true },
      { source: '/news/:path*', destination: '/updates', permanent: true },
      { source: '/resources', destination: '/updates', permanent: true },
      { source: '/resources/:path*', destination: '/updates', permanent: true },
      { source: '/search', destination: '/updates', permanent: true },

      // 4. 이용안내/문의 레거시 경로
      { source: '/guide/contact', destination: '/contact', permanent: true },
      { source: '/guide/faq', destination: '/', permanent: true },
      { source: '/guide/sitemap', destination: '/', permanent: true },
      { source: '/guide', destination: '/', permanent: true },
      { source: '/guide/:path*', destination: '/', permanent: true },

      // 5. 비표준 정책 경로 -> /privacy
      { source: '/copyright', destination: '/privacy', permanent: true },
      { source: '/accessibility', destination: '/privacy', permanent: true },

      // 6. 관리자 기본 경로 -> /admin/posts
      { source: '/admin', destination: '/admin/posts', permanent: true },
      { source: '/admin/dashboard', destination: '/admin/posts', permanent: true },
    ];
  },
};

export default nextConfig;
