import React from 'react';
import CourseForm from '../CourseForm';
import UiBadge from '@/components/common/UiBadge';

export default function AdminNewLecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            신규 강좌 등록 (ADM-04)
          </h1>
          <UiBadge id="ADM04-HDR-NEW01" name="강좌 등록 헤더" />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          KOCW형 차시별 유튜브 강좌 또는 노션 마크다운(MD) 강의를 신규 등록합니다.
        </p>
      </div>

      <CourseForm />
    </div>
  );
}
