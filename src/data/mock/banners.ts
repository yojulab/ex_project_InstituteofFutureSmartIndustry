import { MockBanner } from './types';

export const mockBanners: MockBanner[] = [
  {
    title: '2026 미래스마트제조 AI 혁신 컨퍼런스 개최 안내',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    altText: '2026 미래스마트제조 AI 혁신 컨퍼런스 홍보 배너: 제조 AI 기술 실증 사례 및 네트워킹 세미나 안내',
    linkUrl: '/news/events',
    isExternal: false,
    order: 1,
    isActive: true,
  },
  {
    title: '중소·중견기업 스마트제조 역량진단 및 컨설팅 지원사업',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    altText: '스마트제조 혁신 진단 및 맞춤형 DX 로드맵 수립 지원 프로그램 홍보 배너',
    linkUrl: '/programs',
    isExternal: false,
    order: 2,
    isActive: true,
  },
];
