'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Save,
  Building2,
  User,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Loader2,
  GraduationCap,
  Briefcase,
  BookOpen,
  Image as ImageIcon,
  Plus,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import WebEditor from '@/components/admin/WebEditor';
import UiBadge from '@/components/common/UiBadge';
import { SiteContentData } from '@/lib/queries/contents';

interface ContentEditFormProps {
  initialAbout: SiteContentData;
  initialDirector: SiteContentData;
}

export default function ContentEditForm({
  initialAbout,
  initialDirector,
}: ContentEditFormProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'director'>('about');

  // About 상태
  const [aboutTitle, setAboutTitle] = useState(initialAbout.title);
  const [aboutSubtitle, setAboutSubtitle] = useState(initialAbout.subtitle);
  const [aboutContent, setAboutContent] = useState(initialAbout.content);
  const [aboutRoles, setAboutRoles] = useState<Array<{ title: string; desc: string }>>(
    initialAbout.metadata?.roles || []
  );
  const [aboutCharterUrl, setAboutCharterUrl] = useState(
    initialAbout.metadata?.charterUrl || '/files/fsipi-charter.pdf'
  );

  // Director 상태
  const [directorTitle, setDirectorTitle] = useState(initialDirector.title);
  const [directorSubtitle, setDirectorSubtitle] = useState(initialDirector.subtitle);
  const [directorContent, setDirectorContent] = useState(initialDirector.content);
  const [directorName, setDirectorName] = useState(
    initialDirector.metadata?.directorName || '김범준'
  );
  const [directorEnName, setDirectorEnName] = useState(
    initialDirector.metadata?.directorEnName || 'Kim Beom-Jun'
  );
  const [directorJobTitle, setDirectorJobTitle] = useState(
    initialDirector.metadata?.directorTitle ||
      '미래스마트산업진흥원 초대 원장 / IT 직업교육·인공지능 연구자'
  );
  const [profileImageUrl, setProfileImageUrl] = useState(
    initialDirector.metadata?.profileImageUrl || ''
  );
  const [educationList, setEducationList] = useState<string[]>(
    initialDirector.metadata?.education || []
  );
  const [timelineList, setTimelineList] = useState<
    Array<{ period: string; title: string; desc: string }>
  >(initialDirector.metadata?.timeline || []);
  const [papersList, setPapersList] = useState<
    Array<{ title: string; journal: string; doi: string }>
  >(initialDirector.metadata?.papers || []);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 프로필 사진 업로드 처리
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '사진 업로드 실패');
      }

      setProfileImageUrl(data.url);
      setSuccessMessage('프로필 사진이 업로드되었습니다.');
    } catch (err: any) {
      setErrorMessage(err.message || '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  // 저장 요청 핸들러
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const isAbout = activeTab === 'about';
    const slug = isAbout ? 'about' : 'director';

    const payload = isAbout
      ? {
          title: aboutTitle,
          subtitle: aboutSubtitle,
          content: aboutContent,
          metadata: {
            roles: aboutRoles,
            charterUrl: aboutCharterUrl,
          },
        }
      : {
          title: directorTitle,
          subtitle: directorSubtitle,
          content: directorContent,
          metadata: {
            directorName,
            directorEnName,
            directorTitle: directorJobTitle,
            profileImageUrl,
            education: educationList,
            timeline: timelineList,
            papers: papersList,
          },
        };

    try {
      const res = await fetch(`/api/admin/contents/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      setSuccessMessage(
        isAbout
          ? '진흥원 소개 페이지 내용이 성공적으로 저장되었습니다.'
          : '원장 소개 페이지 내용이 성공적으로 저장되었습니다.'
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 탭 전환 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('about');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'about'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>🏛️ 진흥원 소개 관리 (/about)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('director');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'director'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>👤 원장 소개 관리 (/about/director)</span>
          </button>
        </div>

        {/* 공개 페이지 미리보기 링크 */}
        <Link
          href={activeTab === 'about' ? '/about' : '/about/director'}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors w-fit"
        >
          <span>실제 공개 페이지 새창 확인</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 알림 메시지 */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* 폼 본문 */}
      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'about' ? (
          /* ============================================================ */
          /* 1. 진흥원 소개 (About) 편집 영역 */
          /* ============================================================ */
          <>
            {/* 기본 제목 및 부제목 */}
            <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <UiBadge id="A04-CNT-ABT-INFO01" name="진흥원 소개 기본 정보" />
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Building2 className="w-4 h-4" />
                <span>진흥원 소개 상단 헤더 문구 설정</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  페이지 메인 타이틀 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  기관 핵심 소개 요약문 (부제목)
                </label>
                <textarea
                  rows={2}
                  value={aboutSubtitle}
                  onChange={(e) => setAboutSubtitle(e.target.value)}
                  className="w-full py-2 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  공개용 정관 파일 경로 / 다운로드 URL
                </label>
                <input
                  type="text"
                  value={aboutCharterUrl}
                  onChange={(e) => setAboutCharterUrl(e.target.value)}
                  className="w-full py-2 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* 웹 에디터 본문 (설립 취지 및 기관 성격, 운영 원칙) */}
            <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <UiBadge id="A04-CNT-ABT-BODY01" name="진흥원 소개 웹 에디터 본문" />
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    설립 취지 및 운영 원칙 상세 본문 <span className="text-rose-400">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    웹 에디터의 서식 도구 및 <strong>이미지 업로드 버튼</strong>을 활용하여 설립 취지와 공익 운영 원칙을 자유롭게 작성할 수 있습니다.
                  </p>
                </div>
              </div>

              <WebEditor
                value={aboutContent}
                onChange={setAboutContent}
                placeholder="설립 취지와 기관 운영 원칙을 마크다운 또는 서식 도구로 작성하세요."
                minHeight="350px"
                required
              />
            </div>

            {/* 진흥원 4대 핵심 역할 관리 */}
            <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <UiBadge id="A04-CNT-ABT-ROLE01" name="진흥원 4대 핵심 역할 설정" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>진흥원 4대 핵심 역할 카드</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAboutRoles([
                      ...aboutRoles,
                      { title: `${aboutRoles.length + 1}. 신규 역할`, desc: '세부 설명' },
                    ])
                  }
                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>역할 항목 추가</span>
                </button>
              </div>

              <div className="space-y-3">
                {aboutRoles.map((role, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={role.title}
                        onChange={(e) => {
                          const updated = [...aboutRoles];
                          updated[idx].title = e.target.value;
                          setAboutRoles(updated);
                        }}
                        placeholder="역할 제목 (예: 1. AI 기술개발 및 산업 실증 지원)"
                        className="flex-1 py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-bold focus:border-sky-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = aboutRoles.filter((_, i) => i !== idx);
                          setAboutRoles(updated);
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="항목 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={role.desc}
                      onChange={(e) => {
                        const updated = [...aboutRoles];
                        updated[idx].desc = e.target.value;
                        setAboutRoles(updated);
                      }}
                      placeholder="역할에 대한 세부 설명을 입력하세요."
                      className="w-full py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 text-xs focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ============================================================ */
          /* 2. 원장 소개 (Director) 편집 영역 */
          /* ============================================================ */
          <>
            {/* 기본 신상 및 프로필 사진 */}
            <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <UiBadge id="A04-CNT-DIR-INFO01" name="원장 기본 프로필 정보" />
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <User className="w-4 h-4" />
                <span>원장 프로필 및 직함 설정</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    원장 성명 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    영문 표기
                  </label>
                  <input
                    type="text"
                    value={directorEnName}
                    onChange={(e) => setDirectorEnName(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    공식 직함 / 전문 분야
                  </label>
                  <input
                    type="text"
                    value={directorJobTitle}
                    onChange={(e) => setDirectorJobTitle(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 프로필 사진 업로드 영역 */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImageUrl}
                      alt="원장 프로필 사진"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-slate-200 block">원장 공식 프로필 사진</span>
                  <p className="text-[11px] text-slate-400">
                    JPG, PNG, WebP 포맷의 깔끔한 인물 사진을 업로드하세요.
                  </p>
                  <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>업로드 중...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>사진 변경 / 업로드</span>
                        </>
                      )}
                    </button>
                    {profileImageUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileImageUrl('')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs transition-colors"
                      >
                        기본 아바타로 초기화
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 웹 에디터 본문 (인사말 및 철학) */}
            <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <UiBadge id="A04-CNT-DIR-BODY01" name="원장 인사말 웹 에디터 본문" />
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    원장 인사말 및 소개 본문 <span className="text-rose-400">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    웹 에디터로 원장 인사말과 포부를 작성하세요. (이미지 첨부 및 서식 지원)
                  </p>
                </div>
              </div>

              <WebEditor
                value={directorContent}
                onChange={setDirectorContent}
                placeholder="원장 인사말을 마크다운 또는 서식 도구로 작성하세요."
                minHeight="350px"
                required
              />
            </div>

            {/* 학력 사항 관리 (박사과정 명기 준수) */}
            <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <UiBadge id="A04-CNT-DIR-EDU01" name="원장 학력 사항 설정" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                  <span>학력 사항 (정규 학위 및 수료 과정)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEducationList([...educationList, ''])}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>학력 추가</span>
                </button>
              </div>

              <div className="space-y-2">
                {educationList.map((edu, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={edu}
                      onChange={(e) => {
                        const updated = [...educationList];
                        updated[idx] = e.target.value;
                        setEducationList(updated);
                      }}
                      placeholder="예: 컴퓨터공학 박사과정 수료 (인공지능 보안, IT 윤리 전공)"
                      className="flex-1 py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:border-sky-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 25년 주요 경력 타임라인 관리 */}
            <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <UiBadge id="A04-CNT-DIR-TIME01" name="원장 주요 경력 타임라인 설정" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Briefcase className="w-4 h-4" />
                  <span>주요 경력 및 활동 타임라인</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTimelineList([
                      ...timelineList,
                      { period: '2026 ~ 현재', title: '직책 / 역할', desc: '주요 활동 내용' },
                    ])
                  }
                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>경력 항목 추가</span>
                </button>
              </div>

              <div className="space-y-3">
                {timelineList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={item.period}
                        onChange={(e) => {
                          const updated = [...timelineList];
                          updated[idx].period = e.target.value;
                          setTimelineList(updated);
                        }}
                        placeholder="기간 (예: 2015 ~ 2025)"
                        className="py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sky-300 font-bold text-xs focus:border-sky-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...timelineList];
                          updated[idx].title = e.target.value;
                          setTimelineList(updated);
                        }}
                        placeholder="직책 / 소속"
                        className="sm:col-span-2 py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-xs focus:border-sky-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={item.desc}
                        onChange={(e) => {
                          const updated = [...timelineList];
                          updated[idx].desc = e.target.value;
                          setTimelineList(updated);
                        }}
                        placeholder="주요 수행 업무 및 성과 설명"
                        className="flex-1 py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 text-xs focus:border-sky-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setTimelineList(timelineList.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg transition-colors mt-1"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 학술 논문 및 연구 실적 관리 */}
            <div className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <UiBadge id="A04-CNT-DIR-PAPR01" name="원장 학술논문 및 연구실적 설정" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <BookOpen className="w-4 h-4" />
                  <span>학술 논문 및 DOI 연구 실적</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPapersList([
                      ...papersList,
                      { title: '논문 제목', journal: '학술지명, 권호, 연도', doi: 'https://doi.org/...' },
                    ])
                  }
                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>논문 추가</span>
                </button>
              </div>

              <div className="space-y-3">
                {papersList.map((paper, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={paper.title}
                        onChange={(e) => {
                          const updated = [...papersList];
                          updated[idx].title = e.target.value;
                          setPapersList(updated);
                        }}
                        placeholder="논문 제목"
                        className="flex-1 py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-xs focus:border-sky-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setPapersList(papersList.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={paper.journal}
                        onChange={(e) => {
                          const updated = [...papersList];
                          updated[idx].journal = e.target.value;
                          setPapersList(updated);
                        }}
                        placeholder="학술지 및 게재 정보 (예: 한국인공지능산업학회논문지, Vol.14...)"
                        className="py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 text-xs focus:border-sky-500 focus:outline-hidden"
                      />
                      <input
                        type="url"
                        value={paper.doi}
                        onChange={(e) => {
                          const updated = [...papersList];
                          updated[idx].doi = e.target.value;
                          setPapersList(updated);
                        }}
                        placeholder="공식 DOI URL (예: https://doi.org/...)"
                        className="py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sky-400 font-mono text-xs focus:border-sky-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 하단 고정 저장 바 */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <Link
            href="/admin/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            대시보드로
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>
                  {activeTab === 'about'
                    ? '진흥원 소개 변경사항 저장'
                    : '원장 소개 변경사항 저장'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

