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

// 게시물(공지/기관활동/학술논문/원장활동) 기본 검증
export const PostSchema = z.object({
  category: z.enum(['notice', 'activity', 'paper', 'director']).default('notice'),
  title: z.string().min(2, '제목을 2자 이상 입력해주세요.').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, '슬러그는 영문 소문자, 숫자, 하이픈(-)만 가능합니다.'),
  summary: z.string().max(500).default(''),
  body: z.string().min(1, '본문 내용을 입력해주세요.'),
  status: z.enum(['draft', 'private', 'public']).default('public'),
  isFeatured: z.boolean().default(false),
  eventDate: z.string().or(z.date()).optional(),
  sourceUrl: z.string().url('유효한 URL이어야 합니다.').optional().or(z.literal('')),
  sourceName: z.string().max(100).optional(),
  doi: z
    .string()
    .regex(/^https:\/\/doi\.org\/.+$/, 'DOI는 https://doi.org/... 형식이어야 합니다.')
    .optional()
    .or(z.literal('')),
  authors: z.array(z.string()).default([]),
  journal: z.string().max(200).optional(),
  volumeIssuePages: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  thumbnail: z
    .object({
      url: z.string(),
      alt: z.string().min(1, '대체 텍스트는 필수입니다.'),
    })
    .optional(),
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

// 문의하기 검증 스키마 (M-08용)
export const InquirySchema = z.object({
  name: z.string().min(2, '성명을 2자 이상 입력해주세요.').max(50),
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  type: z.enum(['coop', 'edu', 'general'], {
    error: '문의 유형을 선택해주세요.',
  }),
  organization: z.string().max(100).optional(),
  content: z.string().min(10, '문의 내용은 10자 이상 입력해주세요.').max(3000),
  agreedPrivacy: z.literal(true, {
    error: '개인정보 수집 및 이용에 동의하셔야 문의 접수가 가능합니다.',
  }),
});

// 온라인 강좌 차시(Episode) 검증 스키마
export const EpisodeInputSchema = z.object({
  _id: z.string().optional(),
  episodeNo: z.number().int().positive().default(1),
  title: z.string().min(1, '차시 제목을 입력해주세요.').max(200),
  youtubeVideoId: z.string().min(11, '유효한 YouTube URL 또는 Video ID를 입력해주세요.'),
  duration: z.string().max(50).optional().default(''),
  summary: z.string().max(2000).optional().default(''),
  sortOrder: z.number().int().default(0),
});

// 온라인 강좌(Course) 검증 스키마
export const CourseInputSchema = z.object({
  title: z.string().min(2, '강좌명을 2자 이상 입력해주세요.').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-zA-Z0-9_-]+$/, '슬러그는 영문, 숫자, 하이픈(-), 밑줄(_)만 가능합니다.'),
  courseType: z.enum(['video', 'markdown']).default('video'),
  category: z.enum(['ai', 'beauty', 'vocational', 'etc']).default('ai'),
  instructor: z.string().min(1, '강사명을 입력해주세요.').default('김범준 원장'),
  description: z.string().max(2000).default(''),
  term: z.string().max(100).optional().default(''),
  thumbnail: z.object({
    url: z.string().min(1, '썸네일 URL을 입력해주세요.'),
    alt: z.string().min(1, '썸네일 대체 텍스트(alt)는 웹 접근성을 위해 필수입니다.'),
    source: z.enum(['upload', 'youtube']).default('youtube'),
  }),
  status: z.enum(['draft', 'private', 'public']).default('public'),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().default(0),
  sortOrder: z.number().int().default(0),
  markdownBody: z.string().optional().default(''),
  plainText: z.string().optional().default(''),
  episodes: z.array(EpisodeInputSchema).default([]),
  tags: z.array(z.string()).default([]),
});

export type CourseInput = z.infer<typeof CourseInputSchema>;
export type EpisodeInput = z.infer<typeof EpisodeInputSchema>;

