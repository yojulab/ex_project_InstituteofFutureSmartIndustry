import React from 'react';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Course } from '@/models/Course';
import { LectureAttachment } from '@/models/LectureAttachment';
import CourseForm from '../../CourseForm';
import UiBadge from '@/components/common/UiBadge';

interface EditCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEditLecturePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  await connectToDatabase();

  const course = await Course.findOne({ _id: id, deletedAt: null }).lean();
  if (!course) {
    notFound();
  }

  const attachments = await LectureAttachment.find({ courseId: id }).lean();

  const initialData = {
    ...course,
    _id: (course as any)._id.toString(),
    attachments: attachments.map((att: any) => ({
      id: att._id.toString(),
      fileName: att.fileName,
      fileType: att.fileType,
      fileUrl: att.storageKey ? `/api/files/lectures/${att.storageKey}` : '',
      fileSize: att.fileSize || 0,
      embedUrl: att.embedUrl,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            강좌 정보 수정 (ADM-04)
          </h1>
          <UiBadge id="ADM04-HDR-EDIT01" name="강좌 수정 헤더" />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          강좌 메타데이터, 차시별 유튜브 링크, 마크다운 본문 및 교재 첨부파일을 수정합니다.
        </p>
      </div>

      <CourseForm initialData={initialData} isEdit={true} />
    </div>
  );
}
