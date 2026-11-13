import { connectToDatabase } from '@/lib/db';
import { Post, IPost } from '@/models/Post';
import mongoose from 'mongoose';

export interface PostListItem {
  id: string;
  category: 'notice' | 'activity' | 'paper' | 'director';
  title: string;
  slug: string;
  summary: string;
  isFeatured: boolean;
  eventDate?: string;
  createdAt: string;
  sourceUrl?: string;
  sourceName?: string;
  doi?: string;
  authors?: string[];
  journal?: string;
  volumeIssuePages?: string;
  thumbnail?: {
    url: string;
    alt: string;
  };
}

export interface PostDetailItem extends PostListItem {
  body: string;
  attachments: {
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }[];
  tags: string[];
}

export interface GetPublishedPostsOptions {
  category?: string;
  page?: number;
  limit?: number;
  q?: string;
}

export interface GetPublishedPostsResult {
  posts: PostListItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

function serializePostListItem(doc: any): PostListItem {
  return {
    id: doc._id.toString(),
    category: doc.category,
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary || '',
    isFeatured: Boolean(doc.isFeatured),
    eventDate: doc.eventDate ? new Date(doc.eventDate).toISOString() : undefined,
    createdAt: new Date(doc.createdAt).toISOString(),
    sourceUrl: doc.sourceUrl,
    sourceName: doc.sourceName,
    doi: doc.doi,
    authors: doc.authors || [],
    journal: doc.journal,
    volumeIssuePages: doc.volumeIssuePages,
    thumbnail: doc.thumbnail ? { url: doc.thumbnail.url, alt: doc.thumbnail.alt } : undefined,
  };
}

function serializePostDetailItem(doc: any): PostDetailItem {
  return {
    ...serializePostListItem(doc),
    body: doc.body,
    attachments: (doc.attachments || []).map((att: any) => ({
      name: att.name,
      url: att.url,
      size: att.size,
      mimeType: att.mimeType,
    })),
    tags: doc.tags || [],
  };
}

/**
 * 메인 노출 게시물 조회 (최대 3건)
 * 1. isFeatured: true 승인 게시물 우선 노출
 * 2. 3건 미만일 시 최신 공개(public) 게시물로 보완하여 메인 화면에 소식이 항상 안정적으로 노출되도록 보장
 */
export async function getFeaturedPosts(limit = 3): Promise<PostListItem[]> {
  try {
    await connectToDatabase();
    const maxLimit = Math.min(limit, 3);

    // 1차: 메인 노출 지정(isFeatured: true) 게시물 우선 조회
    const featuredDocs = await Post.find({
      status: 'public',
      isFeatured: true,
      deletedAt: null,
    })
      .sort({ eventDate: -1, createdAt: -1 })
      .limit(maxLimit)
      .lean();

    const result = [...featuredDocs];

    // 2차: 지정된 게시물이 maxLimit보다 적은 경우 최신 공개 게시물로 채움
    if (result.length < maxLimit) {
      const existingIds = result.map((d: any) => d._id);
      const remainingLimit = maxLimit - result.length;

      const fallbackDocs = await Post.find({
        status: 'public',
        deletedAt: null,
        _id: { $nin: existingIds },
      })
        .sort({ eventDate: -1, createdAt: -1 })
        .limit(remainingLimit)
        .lean();

      result.push(...fallbackDocs);
    }

    return result.map(serializePostListItem);
  } catch (error) {
    console.error('[Queries] getFeaturedPosts error:', error);
    return [];
  }
}

/**
 * 통합 게시판 목록 조회 (소식·성과 P-05)
 * 카테고리 필터링, 검색, 페이지네이션
 */
export async function getPublishedPosts(
  options: GetPublishedPostsOptions = {}
): Promise<GetPublishedPostsResult> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(50, options.limit || 10));

  try {
    await connectToDatabase();

    const query: any = {
      status: 'public',
      deletedAt: null,
    };

    if (options.category && options.category !== 'all') {
      query.category = options.category;
    }

    if (options.q && options.q.trim()) {
      query.$text = { $search: options.q.trim() };
    }

    const [docs, total] = await Promise.all([
      Post.find(query)
        .sort({ isFeatured: -1, eventDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    return {
      posts: docs.map(serializePostListItem),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      limit,
    };
  } catch (error) {
    console.error('[Queries] getPublishedPosts error:', error);
    return {
      posts: [],
      total: 0,
      page: 1,
      totalPages: 1,
      limit,
    };
  }
}

/**
 * 공개 게시물 단건 상세 조회 (소식·성과 상세 P-06)
 * [AC-08] 비공개(status !== 'public') 또는 삭제(deletedAt !== null) 글은 무조건 null 반환
 */
export async function getPostBySlugOrId(identifier: string): Promise<PostDetailItem | null> {
  try {
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query: any = {
      status: 'public',
      deletedAt: null,
      ...(isObjectId ? { $or: [{ _id: identifier }, { slug: identifier }] } : { slug: identifier }),
    };

    const doc = await Post.findOne(query).lean();
    if (!doc) {
      return null;
    }

    return serializePostDetailItem(doc);
  } catch (error) {
    console.error('[Queries] getPostBySlugOrId error:', error);
    return null;
  }
}
