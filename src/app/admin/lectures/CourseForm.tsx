'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Video,
  FileText,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileUp,
  ExternalLink,
  Info,
  Layers,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '@/lib/lectures/youtube';
import UiBadge from '@/components/common/UiBadge';

interface EpisodeFormItem {
  _id?: string;
  episodeNo: number;
  title: string;
  youtubeVideoId: string;
  duration: string;
  summary: string;
  sortOrder: number;
}

interface AttachmentFormItem {
  id?: string;
  fileName: string;
  fileType: string;
  storageKey?: string;
  fileUrl?: string;
  fileSize: number;
  embedUrl?: string;
}

interface CourseFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function CourseForm({ initialData, isEdit = false }: CourseFormProps) {
  const router = useRouter();

  // 기본 정보 상태
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [courseType, setCourseType] = useState<'video' | 'markdown'>(
    initialData?.courseType || 'video'
  );
  const [category, setCategory] = useState<'ai' | 'beauty' | 'vocational' | 'etc'>(
    initialData?.category || 'ai'
  );
  const [instructor, setInstructor] = useState(initialData?.instructor || '김범준 원장');
  const [term, setTerm] = useState(initialData?.term || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail?.url || '');
  const [thumbnailAlt, setThumbnailAlt] = useState(initialData?.thumbnail?.alt || '');
  const [thumbnailSource, setThumbnailSource] = useState<'upload' | 'youtube'>(
    initialData?.thumbnail?.source || 'youtube'
  );
  const [autoThumbnailFromFirstVideo, setAutoThumbnailFromFirstVideo] = useState(
    initialData?.thumbnail?.source === 'youtube' || !initialData
  );
  const [status, setStatus] = useState<'draft' | 'private' | 'public'>(
    initialData?.status || 'public'
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);

  // 차시 목록 상태 (동영상 강좌용)
  const [episodes, setEpisodes] = useState<EpisodeFormItem[]>(
    initialData?.episodes && initialData.episodes.length > 0
      ? initialData.episodes
      : [
          {
            episodeNo: 1,
            title: '01강. 강의 오리엔테이션 및 개요',
            youtubeVideoId: '',
            duration: '',
            summary: '',
            sortOrder: 0,
          },
        ]
  );

  // 마크다운 상태 (텍스트 강좌용)
  const [markdownBody, setMarkdownBody] = useState(initialData?.markdownBody || '');
  const [mdPreviewTab, setMdPreviewTab] = useState<'edit' | 'preview'>('edit');
  const [missingImages, setMissingImages] = useState<string[]>([]);

  // 첨부파일 상태
  const [attachments, setAttachments] = useState<AttachmentFormItem[]>(
    initialData?.attachments || []
  );
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');

  // 폼 제출 상태
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 마크다운 내 상대경로 이미지 누락 검사
  useEffect(() => {
    if (courseType === 'markdown' && markdownBody) {
      const imgRegex = /!\[.*?\]\((.*?)\)/g;
      const detectedMissing: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = imgRegex.exec(markdownBody)) !== null) {
        const url = match[1];
        if (
          !url.startsWith('http://') &&
          !url.startsWith('https://') &&
          !url.startsWith('/api/files/')
        ) {
          detectedMissing.push(url);
        }
      }
      setMissingImages(detectedMissing);
    } else {
      setMissingImages([]);
    }
  }, [courseType, markdownBody]);

  // 첫 영상 유튜브 ID 변경 시 썸네일 자동 생성 연동
  useEffect(() => {
    if (autoThumbnailFromFirstVideo && courseType === 'video' && episodes.length > 0) {
      const firstId = extractYouTubeVideoId(episodes[0].youtubeVideoId);
      if (firstId) {
        setThumbnailUrl(getYouTubeThumbnailUrl(firstId));
        if (!thumbnailAlt && title) {
          setThumbnailAlt(`${title} 대표 썸네일`);
        }
      }
    }
  }, [autoThumbnailFromFirstVideo, courseType, episodes, title, thumbnailAlt]);

  // 차시 행 추가
  const handleAddEpisode = () => {
    const nextNo = episodes.length + 1;
    setEpisodes((prev) => [
      ...prev,
      {
        episodeNo: nextNo,
        title: `${String(nextNo).padStart(2, '0')}강. `,
        youtubeVideoId: '',
        duration: '',
        summary: '',
        sortOrder: prev.length,
      },
    ]);
  };

  // 차시 행 삭제
  const handleRemoveEpisode = (index: number) => {
    if (episodes.length <= 1) {
      alert('최소 1개 이상의 차시가 필요합니다.');
      return;
    }
    const updated = episodes.filter((_, i) => i !== index).map((ep, i) => ({
      ...ep,
      episodeNo: i + 1,
      sortOrder: i,
    }));
    setEpisodes(updated);
  };

  // 차시 순서 위로 이동
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newEpisodes = [...episodes];
    const temp = newEpisodes[index - 1];
    newEpisodes[index - 1] = newEpisodes[index];
    newEpisodes[index] = temp;
    setEpisodes(newEpisodes.map((ep, i) => ({ ...ep, episodeNo: i + 1, sortOrder: i })));
  };

  // 차시 순서 아래로 이동
  const handleMoveDown = (index: number) => {
    if (index === episodes.length - 1) return;
    const newEpisodes = [...episodes];
    const temp = newEpisodes[index + 1];
    newEpisodes[index + 1] = newEpisodes[index];
    newEpisodes[index] = temp;
    setEpisodes(newEpisodes.map((ep, i) => ({ ...ep, episodeNo: i + 1, sortOrder: i })));
  };

  // 차시 필드 변경
  const handleEpisodeChange = (index: number, field: keyof EpisodeFormItem, value: any) => {
    setEpisodes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // 마크다운 .md 파일 업로드 시 로드
  const handleMdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      alert('마크다운(.md) 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      const text = await file.text();
      setMarkdownBody(text);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  // 마크다운 이미지 개별 업로드
  const handleMdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/uploads/direct', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '이미지 업로드 실패');

      const imgTag = `\n\n![${file.name}](${data.fileUrl})\n\n`;
      setMarkdownBody((prev: string) => prev + imgTag);
      alert(`이미지가 업로드되었습니다: ${file.name}`);
    } catch (err: any) {
      alert(err.message || '이미지 업로드 실패');
    }
  };

  // 5MB 청크 분할 업로드 (교재 첨부용, 최대 50MB)
  const handleChunkedFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('파일 크기는 50MB를 초과할 수 없습니다.');
      return;
    }

    setUploadProgress(0);
    setUploadStatusText('업로드 세션 초기화 중...');

    try {
      // 1. 세션 초기화
      const initRes = await fetch('/api/admin/uploads/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || '세션 초기화 실패');

      const { sessionId, totalChunks, chunkSize } = initData;

      // 2. 청크 순차 전송
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunkBlob = file.slice(start, end);

        setUploadStatusText(`청크 전송 중... (${i + 1}/${totalChunks})`);

        const chunkFormData = new FormData();
        chunkFormData.append('sessionId', sessionId);
        chunkFormData.append('chunkIndex', i.toString());
        chunkFormData.append('chunk', chunkBlob, `chunk_${i}`);

        const chunkRes = await fetch('/api/admin/uploads/chunk', {
          method: 'POST',
          body: chunkFormData,
        });
        if (!chunkRes.ok) {
          const errData = await chunkRes.json();
          throw new Error(errData.error || `청크 ${i + 1} 업로드 실패`);
        }

        const pct = Math.round(((i + 1) / totalChunks) * 90);
        setUploadProgress(pct);
      }

      // 3. 병합 요청 (finalize)
      setUploadStatusText('파일 병합 및 보안 검증 중...');
      const finalizeRes = await fetch('/api/admin/uploads/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const finalData = await finalizeRes.json();
      if (!finalizeRes.ok) throw new Error(finalData.error || '병합 처리 실패');

      setUploadProgress(100);
      setUploadStatusText('업로드 완료!');

      setAttachments((prev) => [
        ...prev,
        {
          fileName: finalData.fileName,
          fileType: finalData.fileType,
          storageKey: finalData.storageKey,
          fileUrl: finalData.fileUrl,
          fileSize: finalData.fileSize,
        },
      ]);

      setTimeout(() => {
        setUploadProgress(null);
        setUploadStatusText('');
      }, 1500);
    } catch (err: any) {
      alert(`업로드 실패: ${err.message}`);
      setUploadProgress(null);
      setUploadStatusText('');
    }
  };

  // 첨부파일 삭제
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    // 필수 유효성 검사
    if (!title.trim()) {
      setErrorMessage('강좌 제목을 입력해주세요.');
      setSubmitting(false);
      return;
    }
    if (!slug.trim()) {
      setErrorMessage('슬러그를 입력해주세요.');
      setSubmitting(false);
      return;
    }
    if (!thumbnailAlt.trim()) {
      setErrorMessage('웹 접근성 준수를 위해 대표 썸네일 대체 텍스트(alt)는 필수입니다.');
      setSubmitting(false);
      return;
    }

    if (courseType === 'video') {
      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        if (!ep.title.trim()) {
          setErrorMessage(`제 ${i + 1}차시의 제목을 입력해주세요.`);
          setSubmitting(false);
          return;
        }
        if (!extractYouTubeVideoId(ep.youtubeVideoId)) {
          setErrorMessage(`제 ${i + 1}차시의 YouTube URL 또는 Video ID가 유효하지 않습니다.`);
          setSubmitting(false);
          return;
        }
      }
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      courseType,
      category,
      instructor: instructor.trim(),
      term: term.trim(),
      description: description.trim(),
      thumbnail: {
        url: thumbnailUrl.trim() || '/images/default-course.png',
        alt: thumbnailAlt.trim(),
        source: thumbnailSource,
      },
      status,
      isFeatured,
      markdownBody: courseType === 'markdown' ? markdownBody : '',
      episodes: courseType === 'video' ? episodes : [],
      attachments,
    };

    try {
      const url = isEdit
        ? `/api/admin/lectures/${initialData._id}`
        : '/api/admin/lectures';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '저장 중 오류가 발생했습니다.');
      }

      router.push('/admin/lectures');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || '저장 실패');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* 에러 메시지 알림 */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">입력 오류</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 font-bold text-xs"
          >
            닫기
          </button>
        </div>
      )}

      {/* 1. 기본 정보 섹션 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>1. 강좌 기본 정보</span>
            <UiBadge id="ADM04-SEC-BASE01" name="기본정보 섹션" />
          </h2>
          <span className="text-xs text-slate-400">* 표시는 필수 입력 항목입니다.</span>
        </div>

        {/* 강좌 유형 선택 라디오 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            강좌 유형 선택 *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                courseType === 'video'
                  ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="courseType"
                value="video"
                checked={courseType === 'video'}
                onChange={() => setCourseType('video')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>동영상 강좌 (KOCW형 차시별 유튜브)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  16:9 유튜브 플레이어와 차시별 목록을 제공하여 클릭 즉시 해당 영상으로 전환되는 검증된 교육 뷰어입니다.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                courseType === 'markdown'
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="courseType"
                value="markdown"
                checked={courseType === 'markdown'}
                onChange={() => setCourseType('markdown')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>텍스트 강좌 (노션 마크다운 MD형)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  강사가 노션에서 작성한 마크다운을 업로드하여 코드 구문 강조, 목차(TOC)와 함께 미려하게 렌더링합니다.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 제목 & 슬러그 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              강좌명 (제목) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 생성형 AI의 실무 이해와 프롬프트 엔지니어링"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              슬러그 (URL 식별자) *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
              placeholder="예: generative-ai-prompt-engineering"
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {isEdit && (
              <p className="text-[11px] text-blue-600 mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>슬러그를 변경해도 이전 주소로 들어온 사용자는 301로 자동 연결됩니다.</span>
              </p>
            )}
          </div>
        </div>

        {/* 카테고리, 강사명, 교육기간 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              분야 카테고리 *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            >
              <option value="ai">인공지능·IT</option>
              <option value="beauty">스마트뷰티·미용</option>
              <option value="vocational">직업교육·자격</option>
              <option value="etc">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              담당 강사진 *
            </label>
            <input
              type="text"
              required
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="예: 김범준 원장 외"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              교육 기간 / 학기
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="예: 2026년 2학기"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* 개요 소개글 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            강좌 개요 / 소개글
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="강좌의 학습 목표와 대상, 주요 내용을 요약 입력해주세요."
            className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* 대표 썸네일 */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-900">대표 썸네일 설정</span>
            {courseType === 'video' && (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-blue-700 font-semibold">
                <input
                  type="checkbox"
                  checked={autoThumbnailFromFirstVideo}
                  onChange={(e) => {
                    setAutoThumbnailFromFirstVideo(e.target.checked);
                    if (e.target.checked) setThumbnailSource('youtube');
                  }}
                  className="rounded-sm text-blue-600 focus:ring-blue-500"
                />
                <span>YouTube 첫 번째 영상 썸네일 자동 추출</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                썸네일 이미지 URL
              </label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => {
                  setThumbnailUrl(e.target.value);
                  setAutoThumbnailFromFirstVideo(false);
                  setThumbnailSource('upload');
                }}
                placeholder="https://..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                대체 텍스트 (alt) * [접근성 필수]
              </label>
              <input
                type="text"
                required
                value={thumbnailAlt}
                onChange={(e) => setThumbnailAlt(e.target.value)}
                placeholder="시각장애인을 위한 썸네일 설명 (예: AI 실무 강의 배너)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* 공개 상태 및 메인 노출 지정 (Q6: 관리자 권한 전용) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              공개 여부
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
            >
              <option value="public">공개 (일반 수강생 열람 가능)</option>
              <option value="private">비공개 (관리자 전용)</option>
              <option value="draft">임시저장</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 w-full">
              <input
                type="checkbox"
                checked={isFeatured}
                disabled={status !== 'public'}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="text-amber-500 focus:ring-amber-400 rounded-sm w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  메인 화면 추천 강좌로 노출 (최대 3건)
                </span>
                <span className="text-[10px] text-slate-500">
                  메인 포털 첫 화면의 추천 강좌 섹션에 하이라이트 노출됩니다.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 2. 동영상 강좌 차시 등록기 (동영상 강좌 선택 시 노출) */}
      {courseType === 'video' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>2. KOCW형 차시별 유튜브 강의 등록</span>
                <UiBadge id="ADM04-SEC-EP01" name="차시 등록기" />
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                차시 순서대로 자동 재생되며, 행을 위아래로 이동하여 순서를 변경할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddEpisode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>차시 추가</span>
            </button>
          </div>

          {/* 차시 목록 */}
          <div className="space-y-3">
            {episodes.map((ep, idx) => {
              const parsedId = extractYouTubeVideoId(ep.youtubeVideoId);
              const isValid = Boolean(parsedId);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                      제 {ep.episodeNo}차시
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="위로 이동"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === episodes.length - 1}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="아래로 이동"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveEpisode(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600"
                        title="차시 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        차시 강의명 *
                      </label>
                      <input
                        type="text"
                        required
                        value={ep.title}
                        onChange={(e) => handleEpisodeChange(idx, 'title', e.target.value)}
                        placeholder="예: 01-1차시. 강의 오리엔테이션"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        유튜브 URL 또는 Video ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={ep.youtubeVideoId}
                        onChange={(e) =>
                          handleEpisodeChange(idx, 'youtubeVideoId', e.target.value)
                        }
                        placeholder="https://youtu.be/... 또는 watch?v=..."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                      {ep.youtubeVideoId && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                          {isValid ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>추출된 ID: {parsedId}</span>
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>유효하지 않은 유튜브 URL입니다.</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        강의 시간 (러닝타임)
                      </label>
                      <input
                        type="text"
                        value={ep.duration}
                        onChange={(e) => handleEpisodeChange(idx, 'duration', e.target.value)}
                        placeholder="예: 25분"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      차시별 핵심 요약 (RAG 및 AI 상담 검색용)
                    </label>
                    <input
                      type="text"
                      value={ep.summary}
                      onChange={(e) => handleEpisodeChange(idx, 'summary', e.target.value)}
                      placeholder="이 차시에서 다루는 주요 개념과 핵심 키워드를 간략히 적어주세요."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 노션 마크다운(MD) 업로더 & 에디터 (텍스트 강좌 선택 시 노출) */}
      {courseType === 'markdown' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>2. 노션 마크다운(MD) 강의 본문</span>
                <UiBadge id="ADM04-SEC-MD01" name="마크다운 에디터" />
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                노션에서 내보낸 .md 파일을 업로드하거나 직접 마크다운 본문을 작성합니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* MD 파일 업로드 버튼 */}
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 cursor-pointer transition-colors">
                <FileUp className="w-4 h-4" />
                <span>.md 파일 불러오기</span>
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleMdFileUpload}
                  className="hidden"
                />
              </label>

              {/* 이미지 개별 업로드 */}
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>이미지 첨부</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleMdImageUpload}
                  className="hidden"
                />
              </label>

              {/* 편집 / 미리보기 탭 */}
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setMdPreviewTab('edit')}
                  className={`px-3 py-1 text-xs font-bold rounded-md ${
                    mdPreviewTab === 'edit'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  편집
                </button>
                <button
                  type="button"
                  onClick={() => setMdPreviewTab('preview')}
                  className={`px-3 py-1 text-xs font-bold rounded-md ${
                    mdPreviewTab === 'preview'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  미리보기
                </button>
              </div>
            </div>
          </div>

          {/* 상대경로 이미지 누락 경고 배너 */}
          {missingImages.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>상대경로 이미지 링크가 감지되었습니다 ({missingImages.length}건)</span>
              </div>
              <p className="text-[11px] text-amber-700">
                노션 내보내기 시 생성된 상대경로 이미지는 웹에서 보이지 않을 수 있습니다. 상단의 [이미지 첨부] 버튼을 통해 이미지를 업로드하여 교체해주세요:
              </p>
              <div className="flex flex-wrap gap-1 pt-1 font-mono text-[10px]">
                {missingImages.slice(0, 5).map((img, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-100/70 rounded-md">
                    {img}
                  </span>
                ))}
                {missingImages.length > 5 && <span>...외 {missingImages.length - 5}건</span>}
              </div>
            </div>
          )}

          {mdPreviewTab === 'edit' ? (
            <textarea
              rows={16}
              value={markdownBody}
              onChange={(e) => setMarkdownBody(e.target.value)}
              placeholder="마크다운 문법으로 강의 본문을 작성하거나 상단의 [.md 파일 불러오기]를 사용하세요."
              className="w-full font-mono text-xs p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
            />
          ) : (
            <div className="p-6 rounded-xl border border-slate-200 bg-white min-h-[300px] prose prose-slate prose-xs max-w-none">
              {markdownBody ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {markdownBody}
                </ReactMarkdown>
              ) : (
                <p className="text-slate-400 italic">미리 볼 마크다운 내용이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. 강의 교재 및 첨부파일 등록 (최대 50MB, 청크 분할 전송) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>3. 강의 교재 및 실습자료 첨부 (최대 50MB)</span>
            <UiBadge id="ADM04-SEC-ATT01" name="교재 첨부 섹션" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            수강생이 다운로드하거나 열람할 수 있는 PDF, PPTX, ZIP 교재를 등록합니다. 5MB 단위 분할 업로드로 안정적으로 전송됩니다.
          </p>
        </div>

        {/* 파일 업로드 드롭존 */}
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center hover:bg-slate-50 transition-colors">
          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-700">
            교재 파일(PDF, PPTX, ZIP)을 선택해주세요
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            파일 1개당 최대 50MB까지 지원됩니다.
          </p>

          <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
            <span>내 컴퓨터에서 파일 선택</span>
            <input
              type="file"
              accept=".pdf,.pptx,.zip"
              onChange={handleChunkedFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* 업로드 프로그레스 바 */}
        {uploadProgress !== null && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-blue-900">
              <span>{uploadStatusText}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 등록된 첨부파일 목록 */}
        {attachments.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 block">
              등록된 첨부파일 ({attachments.length}건)
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-mono text-[10px] uppercase font-bold">
                      {att.fileType}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">{att.fileName}</span>
                    <span className="text-slate-400 text-[11px]">
                      ({(att.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {att.fileUrl && (
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>확인</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-md"
                      title="첨부 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 저장 버튼 */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/admin/lectures"
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
        >
          목록으로 돌아가기
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
        >
          {submitting ? '저장 중...' : isEdit ? '강좌 수정 완료' : '신규 강좌 등록'}
        </button>
      </div>
    </form>
  );
}
