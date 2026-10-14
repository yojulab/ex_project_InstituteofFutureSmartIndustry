import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">개인정보처리방침</span>
        </nav>

        <article className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-[#0F2C59]">
            <ShieldCheck className="w-6 h-6 text-sky-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">개인정보처리방침</h1>
          </div>
          <p className="text-xs text-slate-400 mb-8">시행일자: 2026년 10월 14일</p>

          <div className="prose-content space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-[#0F2C59] mb-2">제1조 (개인정보의 처리 목적)</h2>
              <p>
                미래스마트산업진흥원은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>진흥원 정보 포털 서비스 제공 및 민원 문의 처리</li>
                <li>관리자 시스템 보안 접속 관리 및 침해사고 예방</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#0F2C59] mb-2">제2조 (개인정보의 처리 및 보유기간)</h2>
              <p>
                본 누리집은 일반 방문자 회원가입 기능이 없으며, 서버에 방문자의 개인정보를 저장하지 않습니다. 단, 시스템 보안 및 감사로그 목적의 관리자 로그인 기록은 1년간 안전하게 보관 후 파기합니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#0F2C59] mb-2">제3조 (온디바이스 검색과 프라이버시 보호)</h2>
              <p>
                진흥원 누리집의 의미 검색은 브라우저 내부(On-Device)에서만 동작하며, 이용자가 입력한 검색어 및 자연어 질의문은 외부 AI 서버나 클라우드로 일체 전송되지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#0F2C59] mb-2">제4조 (개인정보 보호책임자)</h2>
              <p>
                진흥원은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 text-xs">
                <div>• 개인정보 보호책임자: 경영지원본부장</div>
                <div>• 연락처: 02-1234-5678 (privacy@smartindustry.or.kr)</div>
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
