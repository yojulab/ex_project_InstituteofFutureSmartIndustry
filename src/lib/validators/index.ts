import { z } from 'zod';

// 관리자 로그인 검증 (아이디 또는 이메일 허용)
export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, '아이디 또는 이메일을 3자 이상 입력해주세요.')
    .max(100, '아이디는 최대 100자 이하이어야 합니다.')
    .regex(/^[a-zA-Z0-9_.@-]+$/, '아이디는 영문, 숫자, 밑줄, 마침표, 하이픈, @ 기호만 허용됩니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

// 게시물(공지/보도/행사/입찰) 검증
export const PostSchema = z.object({
  type: z.enum(['notice', 'press', 'event', 'bid']),
  title: z.string().min(2, '제목을 2자 이상 입력해주세요.').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, '슬러그는 영문 소문자, 숫자, 하이픈(-)만 가능합니다.'),
  summary: z.string().max(500).default(''),
  body: z.string().min(1, '본문 내용을 입력해주세요.'),
  status: z.enum(['draft', 'scheduled', 'published', 'hidden']).default('published'),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().or(z.date()).optional(),
  department: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url('유효한 첨부파일 URL이어야 합니다.'),
        size: z.number().nonnegative(),
        mimeType: z.string(),
      })
    )
    .default([]),
});

// 주요 사업 안내 검증 (신청 기능 절대 배제, 외부 안내 링크만 선택 허용)
export const ProgramSchema = z.object({
  title: z.string().min(2, '사업명을 입력해주세요.').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, '슬러그는 영문 소문자, 숫자, 하이픈(-)만 가능합니다.'),
  category: z.string().min(1, '사업 분류를 선택해주세요.'),
  summary: z.string().min(5, '사업 요약을 5자 이상 입력해주세요.'),
  target: z.string().min(2, '지원 대상을 입력해주세요.'),
  content: z.string().min(10, '사업 상세 안내 내용을 입력해주세요.'),
  period: z.object({
    start: z.string().or(z.date()).optional(),
    end: z.string().or(z.date()).optional(),
    rawText: z.string().min(1, '접수 기간 텍스트(예: 상시 접수, 2026.03~05)를 입력해주세요.'),
  }),
  status: z.enum(['open', 'upcoming', 'closed']),
  department: z.string().min(1, '담당 부서를 입력해주세요.'),
  contact: z.string().min(1, '문의처를 입력해주세요.'),
  externalUrl: z.string().url('유효한 URL이어야 합니다.').optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  order: z.number().default(0),
});

// 자료실 검증
export const ResourceSchema = z.object({
  kind: z.enum(['publication', 'statistics', 'regulation']),
  title: z.string().min(2, '자료명을 입력해주세요.').max(200),
  summary: z.string().default(''),
  authorOrDept: z.string().min(1, '작성자 또는 담당부서를 입력해주세요.'),
  publishedAt: z.string().or(z.date()).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        size: z.number().nonnegative(),
      })
    )
    .default([]),
});

// 배너 검증 (KWCAG 2.2 대체텍스트 altText 필수!)
export const BannerSchema = z.object({
  title: z.string().min(1, '배너 제목을 입력해주세요.'),
  imageUrl: z.string().url('유효한 이미지 URL이어야 합니다.'),
  altText: z.string().min(2, '웹 접근성을 위한 구체적인 대체텍스트(alt)는 필수입니다.'),
  linkUrl: z.string().default(''),
  isExternal: z.boolean().default(false),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});

// FAQ 검증
export const FaqSchema = z.object({
  category: z.string().min(1, '카테고리를 입력해주세요.'),
  question: z.string().min(2, '질문을 입력해주세요.'),
  answer: z.string().min(2, '답변을 입력해주세요.'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});
