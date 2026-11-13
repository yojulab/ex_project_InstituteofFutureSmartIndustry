'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Eye,
  Edit3,
  Columns,
  UploadCloud,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

export interface WebEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  required?: boolean;
}

export default function WebEditor({
  value,
  onChange,
  placeholder = '마크다운 문법 또는 서식 도구를 사용하여 내용을 작성하세요.',
  minHeight = '350px',
  label = '본문 내용 (웹 에디터)',
  required = false,
}: WebEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

  // 텍스트 선택 영역에 서식 적용 헬퍼
  const applyFormat = useCallback(
    (prefix: string, suffix: string = '', defaultText: string = '텍스트') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const textToWrap = selected || defaultText;

      const replacement = `${prefix}${textToWrap}${suffix}`;
      const newValue = value.substring(0, start) + replacement + value.substring(end);

      onChange(newValue);

      // 커서 위치 재조정
      setTimeout(() => {
        textarea.focus();
        if (selected) {
          textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        } else {
          textarea.setSelectionRange(
            start + prefix.length,
            start + prefix.length + defaultText.length
          );
        }
      }, 0);
    },
    [value, onChange]
  );

  // 줄 단위 서식 적용 (제목, 목록, 인용 등)
  const applyLineFormat = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // 현재 줄의 시작 위치 찾기
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const beforeLine = value.substring(0, lineStart);
      const afterLine = value.substring(lineStart);

      const newValue = `${beforeLine}${prefix} ${afterLine}`;
      onChange(newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length + 1, end + prefix.length + 1);
      }, 0);
    },
    [value, onChange]
  );

  // 표(Table) 삽입
  const insertTable = useCallback(() => {
    const tableTemplate = `\n| 구분 | 세부 내용 | 비고 |\n| :--- | :--- | :--- |\n| 항목 1 | 내용 1 | - |\n| 항목 2 | 내용 2 | - |\n\n`;
    applyFormat('', tableTemplate, '');
  }, [applyFormat]);

  // 구분선 삽입
  const insertHorizontalRule = useCallback(() => {
    applyFormat('\n\n---\n\n', '', '');
  }, [applyFormat]);

  // 이미지 서버 업로드 처리 함수
  const handleUploadImageFile = async (file: File, customAlt?: string) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/uploads/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '이미지 업로드에 실패했습니다.');
      }

      // 마크다운 이미지 문법 삽입: ![대체텍스트](URL)
      const alt = customAlt || file.name.replace(/\.[^/.]+$/, '') || '이미지 설명';
      const markdownImage = `\n\n![${alt}](${data.url})\n\n`;

      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + markdownImage + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + markdownImage.length, start + markdownImage.length);
        }, 0);
      } else {
        onChange(value + markdownImage);
      }
    } catch (err: any) {
      console.error('[WebEditor] 이미지 업로드 에러:', err);
      setUploadError(err.message || '이미지 업로드 실패');
    } finally {
      setIsUploading(false);
      setShowImageModal(false);
      setImageAlt('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 파일 인풋 변경 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadImageFile(file, imageAlt || undefined);
    }
  };

  // 드래그 앤 드롭 업로드 핸들러
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        handleUploadImageFile(file);
      }
    }
  };

  // 클립보드 붙여넣기(Paste) 이미지 업로드 핸들러
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleUploadImageFile(file, '붙여넣은 이미지');
            break;
          }
        }
      }
    }
  };

  // 링크 삽입 완료 처리
  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    const txt = linkText.trim() || '링크';
    const markdownLink = `[${txt}](${linkUrl.trim()})`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + markdownLink + value.substring(end);
      onChange(newValue);
    } else {
      onChange(value + markdownLink);
    }

    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  return (
    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-inner flex flex-col">
      {/* 숨겨진 파일 인풋 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* 에디터 상단 헤더 & 툴바 */}
      <div className="bg-slate-950/80 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* 서식 툴바 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-1">
          {/* 헤딩 버튼 */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => applyLineFormat('#')}
              title="대제목 (H1)"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyLineFormat('##')}
              title="중제목 (H2)"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyLineFormat('###')}
              title="소제목 (H3)"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* 폰트 스타일 버튼 */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => applyFormat('**', '**', '굵은 텍스트')}
              title="굵게 (Ctrl+B)"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*', '기울임 텍스트')}
              title="기울임 (Ctrl+I)"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('~~', '~~', '취소선 텍스트')}
              title="취소선"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('`', '`', '코드')}
              title="인라인 코드"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* 목록 & 인용구 */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => applyLineFormat('-')}
              title="글머리 기호 목록"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyLineFormat('1.')}
              title="번호 매기기 목록"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyLineFormat('- [ ]')}
              title="체크리스트"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => applyLineFormat('>')}
              title="인용구"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* 표, 구분선, 링크 */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={insertTable}
              title="표(Table) 삽입"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={insertHorizontalRule}
              title="구분선 삽입"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const textarea = textareaRef.current;
                const sel = textarea ? value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
                setLinkText(sel);
                setShowLinkModal(true);
              }}
              title="링크 삽입"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* 이미지 직접 업로드 버튼 (핵심 기능) */}
          <div className="flex items-center bg-sky-950/40 rounded-lg p-0.5 border border-sky-800/60">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                fileInputRef.current?.click();
              }}
              title="이미지 파일 직접 업로드 (PNG, JPG, WebP, GIF)"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-900/50 rounded transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>업로드 중...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>이미지 업로드</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 뷰 모드 전환 탭 */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              viewMode === 'edit'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>편집</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>분할</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              viewMode === 'preview'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>미리보기</span>
          </button>
        </div>
      </div>

      {/* 업로드 에러 배너 */}
      {uploadError && (
        <div className="px-4 py-2 bg-rose-500/20 border-b border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold"
          >
            닫기
          </button>
        </div>
      )}

      {/* 링크 입력 미니 팝업/모달 */}
      {showLinkModal && (
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-bold text-sky-400">링크 삽입:</span>
          <input
            type="text"
            placeholder="링크 텍스트 (예: 홈페이지)"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="py-1 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs w-44"
          />
          <input
            type="url"
            placeholder="URL (예: https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="py-1 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs w-64"
          />
          <button
            type="button"
            onClick={handleInsertLink}
            className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-colors"
          >
            삽입
          </button>
          <button
            type="button"
            onClick={() => setShowLinkModal(false)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* 본문 영역 (단독 편집 / 단독 미리보기 / 좌우 분할 뷰) */}
      <div className="flex-1 flex flex-col sm:flex-row">
        {/* 편집기 영역 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`relative flex-1 ${viewMode === 'split' ? 'border-r border-slate-800' : ''}`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onDrop={handleDrop}
              onPaste={handlePaste}
              placeholder={placeholder}
              required={required}
              style={{ minHeight }}
              className="w-full h-full p-4 bg-transparent text-white text-xs sm:text-sm font-mono leading-relaxed resize-y focus:outline-hidden"
            />
            {/* 드래그앤드롭 힌트 워터마크 */}
            <div className="absolute right-3 bottom-3 pointer-events-none text-[10px] text-slate-600 flex items-center gap-1">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>이미지 드래그 앤 드롭 또는 붙여넣기 지원</span>
            </div>
          </div>
        )}

        {/* 실시간 미리보기 영역 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            style={{ minHeight }}
            className="flex-1 p-6 bg-slate-950 overflow-y-auto prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed"
          >
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                  img: ({ node, ...props }) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...props}
                      alt={props.alt || '첨부 이미지'}
                      className="rounded-xl max-h-96 object-contain border border-slate-700 my-4 shadow-md bg-slate-900"
                    />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 border border-slate-700 rounded-xl">
                      <table {...props} className="min-w-full text-xs text-left" />
                    </div>
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs py-12">
                <Edit3 className="w-8 h-8 mb-2 opacity-50" />
                <span>본문 내용을 입력하면 여기에 실시간 미리보기가 렌더링됩니다.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 에디터 하단 팁 바 */}
      <div className="bg-slate-950/60 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span>글자 수: <strong className="text-slate-300 font-mono">{value.length}</strong>자</span>
          <span>줄 수: <strong className="text-slate-300 font-mono">{value.split('\n').length}</strong>줄</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>마크다운 문법 및 HTML 태그 살균(Sanitized) 지원</span>
        </div>
      </div>
    </div>
  );
}

