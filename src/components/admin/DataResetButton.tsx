'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';

interface DataResetButtonProps {
  className?: string;
}

export default function DataResetButton({ className = '' }: DataResetButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleOpen = () => {
    setStatus('idle');
    setMessage('');
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsOpen(false);
  };

  const handleReset = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const res = await fetch('/api/admin/system/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || '데이터 초기화에 실패했습니다.');
      }

      setStatus('success');
      setMessage(data.message || '목업 데이터가 성공적으로 초기화되었습니다.');

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || '네트워크 통신 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition-colors shadow-xs ${className}`}
        title="목업 데이터 초기화"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>목업 데이터 초기화</span>
      </button>

      {/* 모달 팝업 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative text-slate-200">
            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              aria-label="창 닫기"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 헤더 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="reset-modal-title" className="text-lg font-black text-white">
                  목업 데이터 전체 초기화
                </h3>
                <p className="text-xs text-slate-400">시스템 데이터베이스 리셋 및 재주입</p>
              </div>
            </div>

            {/* 본문 안내 */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-200/90 space-y-2 leading-relaxed">
              <p className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>주의: 이 작업은 되돌릴 수 없습니다.</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li>현재 등록된 모든 공지사항, 사업안내, 자료실, FAQ, 배너가 삭제됩니다.</li>
                <li>표준 목업 데이터(사업 6건, 게시물 5건, 자료 4건 등)로 전면 재설정됩니다.</li>
                <li>관리자 계정 잠금 해제 및 온디바이스 검색 인덱스가 자동 갱신됩니다.</li>
              </ul>
            </div>

            {/* 상태 메시지 */}
            {status === 'success' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading || status === 'success'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black transition-all shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>초기화 진행 중...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>초기화 실행</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
