import React from 'react';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import PostForm from '../PostForm';
import UiBadge from '@/components/common/UiBadge';

export default async function AdminNewPostPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative">
        <UiBadge id="A02-PST-NEW01" name="신규 게시물 작성 페이지" />
        <h1 className="text-xl font-extrabold text-white">신규 게시물 작성</h1>
        <p className="text-xs text-slate-400 mt-1">
          새로운 공지사항, 기관활동, 학술논문 또는 원장활동 콘텐츠를 등록합니다.
        </p>
      </div>

      <PostForm />
    </div>
  );
}
