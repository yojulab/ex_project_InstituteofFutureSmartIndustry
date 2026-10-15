import { MockQuickLink } from './types';

export const mockQuickLinks: MockQuickLink[] = [
  {
    title: '사업안내',
    description: '진흥원 핵심 지원사업 한눈에 보기',
    icon: 'Briefcase',
    href: '/programs',
    order: 1,
    isActive: true,
  },
  {
    title: '행사·교육',
    description: '스마트산업 전문 세미나 및 교육',
    icon: 'Calendar',
    href: '/news/events',
    order: 2,
    isActive: true,
  },
  {
    title: '자료실',
    description: '산업 동향 보고서 및 통계 자료',
    icon: 'FileText',
    href: '/resources',
    order: 3,
    isActive: true,
  },
  {
    title: '자주 묻는 질문',
    description: '궁금한 점을 빠르게 확인하세요',
    icon: 'HelpCircle',
    href: '/guide/faq',
    order: 4,
    isActive: true,
  },
  {
    title: '오시는 길',
    description: '진흥원 본원 및 교육장 안내',
    icon: 'MapPin',
    href: '/about/location',
    order: 5,
    isActive: true,
  },
  {
    title: '문의 안내',
    description: '부서별 업무 담당자 및 연락처',
    icon: 'PhoneCall',
    href: '/guide/contact',
    order: 6,
    isActive: true,
  },
];
