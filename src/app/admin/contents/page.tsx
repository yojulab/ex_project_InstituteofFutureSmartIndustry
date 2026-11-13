import React from 'react';
import { Metadata } from 'next';
import { getSiteContent } from '@/lib/queries/contents';
import ContentEditForm from './ContentEditForm';
import UiBadge from '@/components/common/UiBadge';

export const metadata: Metadata = {
  title: '소개·고정 콘텐츠 관리 | 진흥원 관리자',
};

export default async function AdminContentsPage() {
  const [aboutData, directorData] = await Promise.all([
    getSiteContent('about'),
    getSiteContent('director'),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 상단 브레드크럼 & 헤더 */}
      <div className="relative">
        <UiBadge id="A04-CNT-HDR01" name="고정 콘텐츠 관리 헤더" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              소개 및 고정 콘텐츠 관리
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              진흥원 소개(/about) 및 원장 소개(/about/director) 페이지의 내용, 인사말, 연혁, 사진을 웹 에디터로 편집합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 편집 폼 */}
      <ContentEditForm
        initialAbout={aboutData}
        initialDirector={directorData}
      />
    </div>
  );
}

