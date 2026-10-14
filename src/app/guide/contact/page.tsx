import React from 'react';
import Link from 'next/link';
import { Phone, Mail, Printer, Building, Clock, MapPin } from 'lucide-react';

export default function ContactPage() {
  const departments = [
    { name: '기획조정본부', phone: '02-1234-5678', email: 'planning@smartindustry.or.kr', desc: '경영 기획, 대외 홍보 및 예산 총괄' },
    { name: 'AI융합사업본부', phone: '02-1234-5680', email: 'ai-biz@smartindustry.or.kr', desc: '제조 AI 실증, 알고리즘 바우처' },
    { name: '스마트제조지원센터', phone: '02-1234-5681', email: 'factory@smartindustry.or.kr', desc: '스마트공장 컨설팅, 데이터 표준화' },
    { name: '인재양성본부', phone: '02-1234-5682', email: 'academy@smartindustry.or.kr', desc: '재직자 교육, 청년 DX 아카데미' },
    { name: '글로벌협력실', phone: '02-1234-5683', email: 'global@smartindustry.or.kr', desc: '해외 로드쇼 및 수출 판로 개척' },
    { name: '경영지원본부', phone: '02-1234-5685', email: 'support@smartindustry.or.kr', desc: '계약, 총무 및 정보보안 인프라' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">문의 안내</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            문의 안내
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            업무별 담당 부서 유선 연락처 및 이메일 문의 창구입니다.
          </p>
        </div>

        {/* 대표 연락처 배너 */}
        <div className="bg-[#0F2C59] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-sky-400">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-300 block">진흥원 대표전화</span>
                <span className="text-xl font-bold">02-1234-5678</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-sky-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-300 block">상담 운영 시간</span>
                <span className="text-sm font-semibold">평일 09:00 ~ 18:00</span>
                <span className="text-[11px] text-slate-400 block">(점심시간 12:00 ~ 13:00)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-sky-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-300 block">공식 대표 이메일</span>
                <span className="text-sm font-semibold">contact@smartindustry.or.kr</span>
              </div>
            </div>
          </div>
        </div>

        {/* 부서별 상세 연락처 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-[#0F2C59] mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-sky-600" />
            <span>부서별 담당 업무 및 연락처</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.name} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-1">{dept.name}</h3>
                <p className="text-xs text-slate-600 mb-3">{dept.desc}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
