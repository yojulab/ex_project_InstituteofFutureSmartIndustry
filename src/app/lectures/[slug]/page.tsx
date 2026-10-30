import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCourseBySlug } from '@/lib/queries/courses';
import KocwPlayer from '@/components/lectures/KocwPlayer';
import { getAppUrl } from '@/lib/config/env';

interface LecturePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: LecturePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { course } = await getCourseBySlug(slug);

  if (!course) {
    return {
      title: '강좌를 찾을 수 없습니다 | 미래스마트산업진흥원',
    };
  }

  const baseUrl = getAppUrl();
  const canonicalUrl = `${baseUrl}/lectures/${course.slug}`;

  return {
    title: `${course.title} | 미래스마트산업진흥원 온라인 강좌`,
    description: course.description || `${course.instructor} 강사의 ${course.title} 온라인 강좌입니다.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${course.title} — 온라인 강좌`,
      description: course.description || `${course.instructor} 강사의 KOCW형 차시별 강의를 무료로 수강할 수 있습니다.`,
      url: canonicalUrl,
      type: 'video.other',
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
      title: course.title,
      description: course.description,
      images: course.thumbnail?.url ? [course.thumbnail.url] : undefined,
    },
  };
}

export default async function LectureDetailPage({ params }: LecturePageProps) {
  const { slug } = await params;
  const { course, redirectSlug } = await getCourseBySlug(slug);

  // 1. 과거 슬러그인 경우 최신 슬러그로 301 영구 리디렉션 (Q5 충족)
  if (redirectSlug) {
    redirect(`/lectures/${redirectSlug}`);
  }

  // 2. 강좌가 없거나 비공개/삭제 상태인 경우 404 차단 (LAC-14)
  if (!course) {
    notFound();
  }

  // 3. 텍스트(MD) 강좌인 경우 올바른 노트 경로로 리디렉션
  if (course.courseType === 'markdown') {
    redirect(`/lectures/note/${course.slug}`);
  }

  const baseUrl = getAppUrl();

  // 4. Schema.org JSON-LD 구조화 데이터 (검색엔진 최적화 & Q5 충족)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: '미래스마트산업진흥원',
      sameAs: baseUrl,
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: `${course.episodes.length}차시`,
    },
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      {/* JSON-LD 스크립트 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <KocwPlayer course={course} />
      </div>
    </div>
  );
}
