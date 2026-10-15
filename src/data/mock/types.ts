/**
 * 미래스마트산업진흥원 목업 데이터 타입 정의
 */

export interface MockSiteSetting {
  institutionName: string;
  visionStatement: string;
  heroSubText: string;
  phone: string;
  fax: string;
  email: string;
  address: string;
  popularKeywords: string[];
  familySites: Array<{ name: string; url: string }>;
}

export interface MockQuickLink {
  title: string;
  description: string;
  icon: string;
  href: string;
  order: number;
  isActive: boolean;
}

export interface MockBanner {
  title: string;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  isExternal: boolean;
  order: number;
  isActive: boolean;
}

export interface MockProgram {
  title: string;
  slug: string;
  category: string;
  summary: string;
  target: string;
  content: string;
  period: { rawText: string };
  status: 'open' | 'upcoming' | 'closed';
  department: string;
  contact: string;
  externalUrl?: string;
  isFeatured: boolean;
  order: number;
}

export interface MockPostAttachment {
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface MockPost {
  type: 'notice' | 'press' | 'event' | 'bid';
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: 'published' | 'draft';
  isPinned: boolean;
  daysAgo: number; // 상대적 날짜 계산용
  department: string;
  attachments: MockPostAttachment[];
  tags: string[];
}

export interface MockResourceAttachment {
  name: string;
  url: string;
  size: number;
}

export interface MockResource {
  kind: 'publication' | 'statistics' | 'regulation';
  title: string;
  summary: string;
  daysAgo: number;
  authorOrDept: string;
  downloadCount: number;
  attachments: MockResourceAttachment[];
}

export interface MockFaq {
  category: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}
