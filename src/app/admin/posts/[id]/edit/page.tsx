import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';
import { getCurrentSession } from '@/lib/auth/session';
import PostForm from '../../PostForm';
import UiBadge from '@/components/common/UiBadge';
import mongoose from 'mongoose';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPostPage({ params }: EditPostPageProps) {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  await connectToDatabase();

  const post = mongoose.Types.ObjectId.isValid(id)
    ? await Post.findOne({ _id: id, deletedAt: null }).lean()
    : await Post.findOne({ slug: id, deletedAt: null }).lean();

  if (!post) {
    notFound();
  }

  const initialData = {
    _id: post._id.toString(),
    category: post.category,
    title: post.title,
    slug: post.slug,
    summary: post.summary || '',
    body: post.body,
    status: post.status,
    isFeatured: Boolean(post.isFeatured),
    eventDate: post.eventDate ? post.eventDate.toISOString() : undefined,
    sourceUrl: post.sourceUrl || '',
    sourceName: post.sourceName || '',
    doi: post.doi || '',
    authors: post.authors || [],
    journal: post.journal || '',
    volumeIssuePages: post.volumeIssuePages || '',
    thumbnail: post.thumbnail
      ? {
          url: post.thumbnail.url,
          alt: post.thumbnail.alt,
        }
      : undefined,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative">
        <UiBadge id="A02-PST-EDIT01" name="게시물 수정 페이지" />
        <h1 className="text-xl font-extrabold text-white">게시물 수정</h1>
        <p className="text-xs text-slate-400 mt-1">
          게시물 내용을 수정하고 메인 화면 노출 여부를 조정합니다.
        </p>
      </div>

      <PostForm initialData={initialData} isEdit />
    </div>
  );
}
