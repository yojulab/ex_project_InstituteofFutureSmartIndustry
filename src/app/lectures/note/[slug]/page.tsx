import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCourseBySlug } from '@/lib/queries/courses';
import NoteViewer from '@/components/lectures/NoteViewer';
import { getAppUrl } from '@/lib/config/env';

interface NotePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { course } = await getCourseBySlug(slug);

  if (!course) {
    return {
      title: '강의노트를 찾을 수 없습니다 | 미래스마트산업진흥원',
    };
  }

  const baseUrl = getAppUrl();
  const canonicalUrl = `${baseUrl}/lectures/note/${course.slug}`;

  return {
    title: `${course.title} (강의노트) | 미래스마트산업진흥원 온라인 강좌`,
    description: course.description || `${course.instructor} 강사의 ${course.title} 노션 마크다운 강의노트입니다.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${course.title} — 강의노트`,
      description: course.description || `${course.instructor} 강사의 노션 마크다운 실무 강의자료를 열람할 수 있습니다.`,
      url: canonicalUrl,
      type: 'article',
      images: course.thumbnail?.url
        ? [
            {
              url: course.thumbnail.url,
              alt: course.thumbnail.alt || course.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} — 강의노트`,
      description: course.description,
      images: course.thumbnail?.url ? [course.thumbnail.url] : undefined,
    },
  };
}

export default async function LectureNoteDetailPage({ params }: NotePageProps) {
  const { slug } = await params;
  const { course, redirectSlug } = await getCourseBySlug(slug);

  // 1. 과거 슬러그인 경우 최신 슬러그로 301 영구 리디렉션 (Q5 충족)
  if (redirectSlug) {
    redirect(`/lectures/note/${redirectSlug}`);
  }

  // 2. 강좌가 없거나 비공개/삭제 상태인 경우 404 차단 (LAC-14)
  if (!course) {
    notFound();
  }

  // 3. 동영상 강좌인 경우 동영상 상세 페이지로 리디렉션
  if (course.courseType === 'video') {
    redirect(`/lectures/${course.slug}`);
  }

  const baseUrl = getAppUrl();

  // 4. Schema.org JSON-LD 구조화 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: course.title,
    description: course.description,
    author: {
      '@type': 'Person',
      name: course.instructor,
    },
    publisher: {
      '@type': 'Organization',
      name: '미래스마트산업진흥원',
      url: baseUrl,
    },
    datePublished: course.createdAt,
    mainEntityOfPage: `${baseUrl}/lectures/note/${course.slug}`,
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <NoteViewer course={course} />
      </div>
    </div>
  );
}
