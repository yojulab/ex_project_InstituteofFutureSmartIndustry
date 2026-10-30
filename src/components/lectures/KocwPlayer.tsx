'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
  FileText,
  Download,
  Eye,
  X,
  Calendar,
  User,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CourseDetailItem } from '@/lib/queries/courses';
import { getYouTubeEmbedUrl } from '@/lib/lectures/youtube';
import UiBadge from '@/components/common/UiBadge';

interface KocwPlayerProps {
  course: CourseDetailItem;
}

export default function KocwPlayer({ course }: KocwPlayerProps) {
  const searchParams = useSearchParams();
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 차시 목록 정렬 보장
  const episodes = course.episodes;
  const initialEpParam = searchParams.get('ep');
  const initialEpIndex = initialEpParam
    ? Math.max(
        0,
        Math.min(
          episodes.length - 1,
          episodes.findIndex((e) => e.episodeNo.toString() === initialEpParam)
        )
      )
    : 0;

  const [currentIndex, setCurrentIndex] = useState<number>(
    initialEpIndex !== -1 ? initialEpIndex : 0
  );
  const [activeTab, setActiveTab] = useState<'episodes' | 'intro' | 'materials'>('episodes');
  const [copiedLinkType, setCopiedLinkType] = useState<'course' | 'episode' | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  const currentEpisode = episodes[currentIndex] || episodes[0];

  // 차시 전환 핸들러 (새로고침 없이 iframe src만 교체 & URL 갱신)
  const handleSelectEpisode = (index: number, scrollIntoView = false) => {
    if (index < 0 || index >= episodes.length) return;
    setCurrentIndex(index);

    const targetEp = episodes[index];
    if (targetEp && iframeRef.current) {
      // autoplay=1 파라미터를 추가하여 즉각 재생 시작
      const embedUrl = getYouTubeEmbedUrl(targetEp.youtubeVideoId, { autoplay: true });
      iframeRef.current.src = embedUrl;
    }

    // URL 쿼리 파라미터 무새로고침 갱신 (?ep=N)
    if (typeof window !== 'undefined' && targetEp) {
      const url = new URL(window.location.href);
      url.searchParams.set('ep', targetEp.episodeNo.toString());
      window.history.replaceState({}, '', url.toString());
    }

    // 모바일 환경 등에서 상단 플레이어로 부드럽게 스크롤
    if (scrollIntoView && playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleSelectEpisode(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < episodes.length - 1) {
      handleSelectEpisode(currentIndex + 1);
    }
  };

  // 링크 복사 (Q5: 타인 공유 목적)
  const handleCopyLink = async (type: 'course' | 'episode') => {
    if (typeof window === 'undefined') return;

    let shareUrl = window.location.origin + `/lectures/${course.slug}`;
    if (type === 'episode' && currentEpisode) {
      shareUrl += `?ep=${currentEpisode.episodeNo}`;
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLinkType(type);
      setTimeout(() => setCopiedLinkType(null), 2000);
    } catch {
      alert('링크 복사에 실패했습니다.');
    }
  };

  // 모바일 Web Share API
  const handleNativeShare = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: `${course.title} - ${currentEpisode ? currentEpisode.title : ''}`,
          url: shareUrl,
        });
      } catch {
        // 취소 등
      }
    } else {
      handleCopyLink('episode');
    }
  };

  return (
    <div className="space-y-6">
      {/* 강좌 헤더 정보 영역 */}
      <div className="space-y-3">
        <Link
          href="/lectures"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>온라인 강좌 목록으로 돌아가기</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
            동영상 {episodes.length}차시
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
            {course.category === 'ai'
              ? '인공지능·IT'
              : course.category === 'beauty'
              ? '스마트뷰티·미용'
              : course.category === 'vocational'
              ? '직업교육·자격'
              : '기타'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {course.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <User className="w-4 h-4 text-slate-400" />
            <span>강사진: {course.instructor}</span>
          </span>
          {course.term && (
            <span className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>교육기간: {course.term}</span>
            </span>
          )}
        </div>
      </div>

      {/* 1. 상단 16:9 반응형 유튜브 플레이어 영역 (KOCW형 표준 레이아웃) */}
      <div ref={playerContainerRef} className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
        <div className="relative w-full aspect-video max-w-[1000px] mx-auto bg-black">
          <UiBadge id="P10-PLY-VID01" name="16:9 유튜브 플레이어" />
          {currentEpisode?.youtubeVideoId ? (
            <iframe
              ref={iframeRef}
              src={getYouTubeEmbedUrl(currentEpisode.youtubeVideoId, { autoplay: false })}
              title={currentEpisode.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              재생할 영상 정보가 없습니다.
            </div>
          )}
        </div>

        {/* 플레이어 직하단 차시 내비게이션 바 */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-600 text-white shrink-0">
                현재 재생 중
              </span>
              <span className="text-xs text-slate-400 shrink-0">
                제 {currentEpisode?.episodeNo}강 / 총 {episodes.length}강
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate mt-1">
              {currentEpisode?.title}
            </h2>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* 이전 차시 버튼 */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전 차시</span>
            </button>

            {/* 다음 차시 버튼 */}
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === episodes.length - 1}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              <span>다음 차시</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 공유 버튼 바 (Q5 충족) */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold">강의 공유:</span>
          <span className="text-slate-400 hidden sm:inline">
            동료 및 수강생에게 이 강의 링크를 바로 전달할 수 있습니다.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 차시 링크 복사 */}
          <button
            type="button"
            onClick={() => handleCopyLink('episode')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors"
          >
            {copiedLinkType === 'episode' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>이 차시 링크 복사</span>
              </>
            )}
          </button>

          {/* 전체 강좌 링크 복사 */}
          <button
            type="button"
            onClick={() => handleCopyLink('course')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
          >
            {copiedLinkType === 'course' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>강좌 링크</span>
              </>
            )}
          </button>

          {/* 모바일 네이티브 공유 */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="sm:hidden p-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold"
            title="공유하기"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 하단 탭 메뉴 */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('episodes')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'episodes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>차시별 강의 목록 ({episodes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('intro')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'intro'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>강의 계획 및 소개</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'materials'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>강의 자료 ({course.attachments.length})</span>
        </button>
      </div>

      {/* 3. 탭별 콘텐츠 */}
      {/* 3-1. KOCW형 차시별 강의 목록 테이블 */}
      {activeTab === 'episodes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <UiBadge id="P10-TAB-TBL01" name="KOCW형 차시 목록 테이블" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 w-16 text-center">차시</th>
                  <th className="py-3 px-4">강 의 명</th>
                  <th className="py-3 px-4 w-24 text-center">시간</th>
                  <th className="py-3 px-4 w-28 text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {episodes.map((ep, idx) => {
                  const isActive = idx === currentIndex;

                  return (
                    <tr
                      key={ep.id || idx}
                      onClick={() => handleSelectEpisode(idx, true)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-50/80 font-bold text-blue-900 border-l-4 border-l-blue-600'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-500">
                        {ep.episodeNo}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-blue-600 text-white text-[10px] font-bold">
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>재생중</span>
                            </span>
                          )}
                          <span className="text-xs sm:text-sm">{ep.title}</span>
                        </div>
                        {ep.summary && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {ep.summary}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center text-slate-500 font-mono">
                        {ep.duration || '-'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? '재생 중' : '수강하기'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3-2. 강의 계획 및 소개 */}
      {activeTab === 'intro' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">강의 개요 및 목표</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {course.description || '등록된 강좌 소개 내용이 없습니다.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-1">안내 사항</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              본 강좌는 미래스마트산업진흥원의 연구·실무 표준에 따라 제작된 온라인 공개 강좌입니다. 관련 문의 및 협력 제안은 공식 홈페이지 [문의하기]를 이용해주시기 바랍니다.
            </p>
          </div>
        </div>
      )}

      {/* 3-3. 강의 자료 탭 (교재 인라인 미리보기 및 다운로드) */}
      {activeTab === 'materials' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              강의 첨부 교재 ({course.attachments.length}건)
            </h3>
            <span className="text-[11px] text-slate-400">
              클릭하여 인라인 미리보거나 원본 파일을 다운로드할 수 있습니다.
            </span>
          </div>

          {course.attachments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              등록된 강의 교재 또는 첨부파일이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{att.fileName}</p>
                      <p className="text-[10px] text-slate-400">
                        {att.fileType.toUpperCase()} · {(att.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* PDF의 경우 인라인 미리보기 지원 (Q4 반영) */}
                    {att.fileType === 'pdf' && att.fileUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewPdfUrl(att.fileUrl)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>미리보기</span>
                      </button>
                    )}

                    {att.fileUrl && (
                      <a
                        href={att.fileUrl}
                        download={att.fileName}
                        className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                        title="다운로드"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PDF 인라인 미리보기 모달 (Q4 반영: 브라우저 부담 0) */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold">강의 교재 미리보기</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-white"
                  title="새 창으로 열기"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPdfUrl(null)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100">
              <iframe
                src={previewPdfUrl}
                title="교재 PDF 미리보기"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
