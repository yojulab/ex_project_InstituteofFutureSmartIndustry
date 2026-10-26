import React from 'react';
import ContactForm from './ContactForm';
import { Mail, Phone, Clock, Building, ShieldCheck, MapPin } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

interface ContactPageProps {
  searchParams: Promise<{
    type?: string;
  }>;
}

export const metadata = {
  title: '문의하기 | 미래스마트산업진흥원',
  description: '미래스마트산업진흥원과의 기관 및 사업 협력, 전문 교육 위탁, 일반 문의를 접수하실 수 있는 공식 창구입니다.',
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const initialType = params.type || 'coop';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 타이틀 헤더 */}
      <section className="bg-gradient-to-b from-[#0F2C59] to-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-3xl">
            <UiBadge id="P07-SEC01-TIT01" name="문의하기 헤더 섹션" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Contact Us</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
              문의하기
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              기관 및 사업 협력, 전문 직업교육, 일반 안내 등 진흥원과의 협업을 원하시는 사항을 남겨주시면 담당자가 신속히 검토하여 회신드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* 2. 문의 폼 및 안내 그리드 */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 좌측: 폼 영역 */}
            <div className="lg:col-span-8">
              <ContactForm initialType={initialType} />
            </div>

            {/* 우측: 안내 사이드바 */}
            <div className="lg:col-span-4 space-y-6">
              {/* 공식 연락 채널 안내 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#0F2C59] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-sky-600" />
                  <span>공식 수신 창구</span>
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-xs">대표 이메일</span>
                    <strong className="text-slate-900 font-semibold text-sm">
                      contact@smartindustry.or.kr
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">접수 확인 및 회신</span>
                    <span className="text-slate-700">영업일 기준 2~3일 이내 담당자 회신</span>
                  </div>
                </div>
              </div>

              {/* 문의 처리 절차 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#0F2C59]">문의 처리 절차</h3>
                <ol className="text-xs sm:text-sm text-slate-600 space-y-3 pl-4 list-decimal">
                  <li>
                    <strong>문의 접수:</strong> 온라인 폼 작성 및 개인정보 동의 후 전송
                  </li>
                  <li>
                    <strong>담당 부서 배정:</strong> 협력/교육/일반 내용에 따른 담당자 지정
                  </li>
                  <li>
                    <strong>검토 및 회신:</strong> 기재해 주신 공식 이메일로 유선 또는 서면 답변
                  </li>
                </ol>
              </div>

              {/* 개인정보 안전 보증 */}
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3 text-xs text-sky-900">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  남겨주신 문의 정보는 암호화 전송되며, 문의 처리 및 통계 목적 외에 다른 용도로 활용되지 않고 1년 후 안전하게 영구 파기됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
