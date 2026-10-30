import { connectToDatabase } from '@/lib/db';
import { Course, ICourse, IEpisode } from '@/models/Course';
import { LectureAttachment, ILectureAttachment } from '@/models/LectureAttachment';

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  courseType: 'video' | 'markdown';
  category: 'ai' | 'beauty' | 'vocational' | 'etc';
  instructor: string;
  description: string;
  term?: string;
  thumbnail: {
    url: string;
    alt: string;
    source: 'upload' | 'youtube';
  };
  episodeCount: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface CourseDetailItem extends CourseListItem {
  markdownBody?: string;
  episodes: Array<{
    id: string;
    episodeNo: number;
    title: string;
    youtubeVideoId: string;
    duration?: string;
    summary?: string;
    sortOrder: number;
  }>;
  attachments: Array<{
    id: string;
    episodeId?: string;
    fileType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    embedUrl?: string;
  }>;
  tags: string[];
}

export interface GetPublishedCoursesOptions {
  category?: string;
  courseType?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface GetPublishedCoursesResult {
  courses: CourseListItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

function mapToCourseListItem(doc: any): CourseListItem {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    courseType: doc.courseType,
    category: doc.category,
    instructor: doc.instructor,
    description: doc.description || '',
    term: doc.term || '',
    thumbnail: {
      url: doc.thumbnail?.url || '',
      alt: doc.thumbnail?.alt || doc.title,
      source: doc.thumbnail?.source || 'youtube',
    },
    episodeCount: Array.isArray(doc.episodes) ? doc.episodes.length : 0,
    isFeatured: Boolean(doc.isFeatured),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
  };
}

/**
 * 공개 강좌 목록을 페이징 및 필터링하여 조회합니다. (P-09용)
 */
export async function getPublishedCourses(
  options: GetPublishedCoursesOptions = {}
): Promise<GetPublishedCoursesResult> {
  await connectToDatabase();

  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(50, options.limit || 9));
  const skip = (page - 1) * limit;

  const query: any = {
    status: 'public',
    deletedAt: null,
  };

  // 카테고리 필터
  if (options.category && ['ai', 'beauty', 'vocational', 'etc'].includes(options.category)) {
    query.category = options.category;
  }

  // 강좌 유형 필터
  if (options.courseType && ['video', 'markdown'].includes(options.courseType)) {
    query.courseType = options.courseType;
  }

  // 강좌 내 키워드 검색 ($text 인덱스 활용)
  if (options.q && options.q.trim()) {
    query.$text = { $search: options.q.trim() };
  }

  const [docs, total] = await Promise.all([
    Course.find(query)
      .sort(options.q ? { score: { $meta: 'textScore' } } : { sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(query),
  ]);

  const courses = docs.map(mapToCourseListItem);

  return {
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
}

/**
 * 슬러그로 공개 강좌 상세를 조회합니다. (P-10, P-11용)
 * 과거 슬러그인 경우 redirectSlug를 함께 반환하여 301 리디렉션을 지원합니다 (Q5).
 */
export async function getCourseBySlug(
  slug: string
): Promise<{ course: CourseDetailItem | null; redirectSlug?: string }> {
  await connectToDatabase();

  const cleanSlug = slug.trim();
  let doc = await Course.findOne({
    slug: cleanSlug,
    status: 'public',
    deletedAt: null,
  }).lean();

  let redirectSlug: string | undefined = undefined;

  // 과거 슬러그 검색 (301 리디렉션 목적)
  if (!doc) {
    const historicalDoc = await Course.findOne({
      slugHistory: cleanSlug,
      status: 'public',
      deletedAt: null,
    }).lean();

    if (historicalDoc) {
      doc = historicalDoc;
      redirectSlug = (historicalDoc as any).slug;
    }
  }

  if (!doc) {
    return { course: null };
  }

  const courseDoc = doc as any;
  const courseId = courseDoc._id;

  // 첨부파일 조회
  const attachments = await LectureAttachment.find({ courseId }).sort({ createdAt: 1 }).lean();

  const episodes = (courseDoc.episodes || [])
    .slice()
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.episodeNo - b.episodeNo)
    .map((ep: any) => ({
      id: ep._id ? ep._id.toString() : ep.episodeNo.toString(),
      episodeNo: ep.episodeNo,
      title: ep.title,
      youtubeVideoId: ep.youtubeVideoId,
      duration: ep.duration || '',
      summary: ep.summary || '',
      sortOrder: ep.sortOrder || 0,
    }));

  const courseDetail: CourseDetailItem = {
    ...mapToCourseListItem(courseDoc),
    markdownBody: courseDoc.markdownBody || '',
    episodes,
    attachments: attachments.map((att: any) => ({
      id: att._id.toString(),
      episodeId: att.episodeId ? att.episodeId.toString() : undefined,
      fileType: att.fileType,
      fileName: att.fileName,
      fileUrl: att.storageKey ? `/api/files/lectures/${att.storageKey}` : '',
      fileSize: att.fileSize || 0,
      mimeType: att.mimeType || 'application/octet-stream',
      embedUrl: att.embedUrl || '',
    })),
    tags: courseDoc.tags || [],
  };

  return { course: courseDetail, redirectSlug };
}

/**
 * 메인 화면 추천 강좌를 조회합니다. (최대 3건, Q6 반영)
 */
export async function getFeaturedCourses(): Promise<CourseListItem[]> {
  await connectToDatabase();

  const docs = await Course.find({
    status: 'public',
    isFeatured: true,
    deletedAt: null,
  })
    .sort({ featuredOrder: 1, createdAt: -1 })
    .limit(3)
    .lean();

  return docs.map(mapToCourseListItem);
}

