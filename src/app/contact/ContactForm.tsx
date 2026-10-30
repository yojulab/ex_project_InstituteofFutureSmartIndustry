'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { submitInquiry, SubmitInquiryState } from './actions';
import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

interface ContactFormProps {
  initialType?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ initialType = 'coop' }) => {
  const [isPending, startTransition] = useTransition();
  const [renderTimestamp, setRenderTimestamp] = useState<number>(() => Date.now());
  const [formState, setFormState] = useState<SubmitInquiryState | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    startTransition(async () => {
      const result = await submitInquiry(null, formData);
      setFormState(result);
      if (result.success) {
        formElement.reset();
        setRenderTimestamp(Date.now());
      }
    });
  };

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
      <UiBadge id="P07-SEC02-FORM01" name="온라인 문의 접수 폼" />

      {/* 성공 피드백 알림 박스 */}
      {formState?.success && (
        <div
          role="status"
          className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 text-emerald-900"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-emerald-900">문의가 정상 접수되었습니다.</h3>
            <p className="mt-1 text-xs sm:text-sm text-emerald-800 leading-relaxed">
              {formState.message}
            </p>
          </div>
        </div>
      )}

      {/* 실패 피드백 에러 박스 (지시서 4.7항, AC-09 준수: 가짜 성공 메시지 원천 차단) */}
      {formState && !formState.success && (
        <div
          role="alert"
          className="mb-8 p-6 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 text-rose-900"
        >
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-rose-900">문의 발송 실패</h3>
            <p className="mt-1 text-xs sm:text-sm text-rose-800 leading-relaxed">
              {formState.error}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 숨김 필드 (스팸 봇 방지 Honeypot 및 타임스탬프) */}
        <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />
        <input type="hidden" name="_ts" value={renderTimestamp} />

        {/* 1. 문의 유형 선택 (Radio) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
            문의 유형 <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'coop', label: '기관 및 사업 협력', desc: 'AI 실증, 산학 협력, 제휴' },
              { id: 'edu', label: '전문 교육 문의', desc: '기업 위탁 교육, 재직자 연수' },
              { id: 'general', label: '일반 문의', desc: '기타 일반 안내 및 제안' },
            ].map((t) => (
              <label
                key={t.id}
                className="relative flex flex-col p-4 rounded-xl border border-slate-200 hover:border-sky-300 cursor-pointer transition-all has-checked:border-sky-600 has-checked:bg-sky-50/50"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value={t.id}
                    defaultChecked={initialType === t.id}
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                    required
                  />
                  <span className="text-sm font-bold text-slate-900">{t.label}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 pl-6">{t.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. 성명 및 이메일 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              성명 / 담당자명 <span className="text-rose-500">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              required
              placeholder="예: 홍길동"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              이메일 주소 <span className="text-rose-500">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              required
              placeholder="예: contact@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* 3. 소속 기관/기업명 (선택) */}
        <div>
          <label htmlFor="contact-org" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            소속 기관 / 기업명 <span className="text-slate-400 font-normal text-xs">(선택)</span>
          </label>
          <input
            id="contact-org"
            type="text"
            name="organization"
            placeholder="예: (주)미래스마트 / ○○대학교 산학협력단"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
          />
        </div>

        {/* 4. 문의 내용 */}
        <div>
          <label htmlFor="contact-content" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            문의 내용 <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="contact-content"
            name="content"
            required
            rows={6}
            minLength={10}
            maxLength={3000}
            placeholder="문의하실 구체적인 내용(사업 협력 제안, 교육 대상 및 일정 등)을 최소 10자 이상 작성해 주십시오."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors leading-relaxed"
          />
        </div>

        {/* 5. 개인정보 수집 및 이용 동의 (지시서 4.7항, AC-10 준수) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-start gap-3">
            <input
              id="agreed-privacy"
              type="checkbox"
              name="agreedPrivacy"
              value="true"
              required
              className="w-4 h-4 mt-0.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="agreed-privacy" className="text-xs sm:text-sm text-slate-700 leading-relaxed cursor-pointer">
              <strong>[필수] 개인정보 수집 및 이용에 동의합니다.</strong>
              <span className="block text-xs text-slate-500 mt-1">
                수집 항목: 성명, 이메일, 문의유형, 소속, 문의내용 | 수집 목적: 온라인 문의 처리 및 결과 회신 | 보유 기간: <strong>문의 처리 완료 후 1년</strong> (1년 후 자동 파기)
              </span>
            </label>
          </div>
          <div className="pl-7">
            <Link
              href="/privacy"
              target="_blank"
              className="text-xs text-[#0284C7] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              개인정보처리방침 전문 확인하기 ↗
            </Link>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0F2C59] hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>문의 전송 처리 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>온라인 문의 보내기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
