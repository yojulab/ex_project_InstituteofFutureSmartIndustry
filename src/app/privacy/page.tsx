import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Mail, FileCheck } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const metadata = {
  title: '개인정보처리방침 | 미래스마트산업진흥원',
  description: '미래스마트산업진흥원 공식 누리집의 온라인 문의 처리 및 개인정보 처리방침 안내입니다.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">개인정보처리방침</span>
        </nav>

        <article className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 shadow-xs">
          <UiBadge id="P08-SEC01-DOC01" name="개인정보처리방침 전문" />

          <div className="flex items-center gap-2.5 mb-3 text-[#0F2C59]">
            <ShieldCheck className="w-7 h-7 text-sky-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">개인정보처리방침</h1>
          </div>
          <p className="text-xs text-slate-400 mb-8 pb-4 border-b border-slate-100">
            시행일자: 2026년 10월 26일 (개정 v3.0)
          </p>

          <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section>
              <p className="leading-relaxed">
                <strong>미래스마트산업진흥원</strong>(이하 &apos;진흥원&apos;)은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
              </p>
            </section>

            {/* 제1조 수집하는 개인정보 항목 (AC-10 준수: 문의 폼과 1:1 일치) */}
            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#0F2C59]">
                제1조 (수집하는 개인정보 항목 및 수집 방법)
              </h2>
              <p>
                진흥원은 일반 방문자의 불필요한 개인정보를 수집하지 않으며, 회원가입 절차 없이 누구나 자유롭게 정보를 열람할 수 있습니다. 다만, 온라인 문의하기(/contact) 이용 시 서비스 제공을 위해 최소한의 항목을 수집합니다.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-800">
                      <th className="py-2 font-bold">수집 채널</th>
                      <th className="py-2 font-bold">필수 수집 항목</th>
                      <th className="py-2 font-bold">선택 수집 항목</th>
                      <th className="py-2 font-bold">자동 수집 항목</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-800">온라인 문의하기 (/contact)</td>
                      <td className="py-2.5 text-[#0F2C59] font-medium">성명, 이메일 주소, 문의 유형, 문의 내용</td>
                      <td className="py-2.5">소속 기관/기업명</td>
                      <td className="py-2.5">접속 IP 주소, 브라우저 User-Agent (스팸 차단 목적)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 제2조 처리 목적 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F2C59]">
                제2조 (개인정보의 처리 목적)
              </h2>
              <p>진흥원은 수집한 개인정보를 다음의 목적을 위해서만 활용하며, 목적 이외의 용도로는 일체 이용하지 않습니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>문의 및 협력 제안 접수·처리:</strong> 신청자 본인 확인, 문의 내용 검토, 유선 또는 이메일을 통한 사실 확인 및 결과 회신</li>
                <li><strong>시스템 보안 및 악성 스팸 방지:</strong> 비정상적인 반복 제출 및 자동화 봇 공격 차단</li>
              </ul>
            </section>

            {/* 제3조 보유 및 이용기간 (1년, AC-10) */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F2C59]">
                제3조 (개인정보의 처리 및 보유기간)
              </h2>
              <p>
                진흥원은 원칙적으로 개인정보의 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 문의 이력 확인 및 분쟁 예방을 위하여 아래의 기간 동안 안전하게 보관합니다.
              </p>
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-xs sm:text-sm text-sky-950 font-medium">
                • 보유 기간: <strong>문의 접수 완료일로부터 1년</strong> (1년 도래 시 시스템에 의해 자동 영구 파기)
              </div>
            </section>

            {/* 제4조 파기 절차 및 방법 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F2C59]">
                제4조 (개인정보의 파기 절차 및 파기 방법)
              </h2>
              <p>진흥원은 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>파기 절차:</strong> 문의 처리 후 1년이 경과한 데이터는 데이터베이스 TTL(Time-To-Live) 자동 삭제 기능을 통해 복구 불가능한 방식으로 영구 파기됩니다.</li>
                <li><strong>파기 방법:</strong> 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 기술적 방법을 사용하여 완전히 삭제합니다.</li>
              </ul>
            </section>

            {/* 제5조 정보주체의 권리 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F2C59]">
                제5조 (정보주체의 권리·의무 및 행사 방법)
              </h2>
              <p>
                정보주체는 진흥원에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있으며, 공식 이메일(contact@smartindustry.or.kr)을 통해 서면 또는 유선으로 요청하시면 지체 없이 조치하겠습니다.
              </p>
            </section>

            {/* 제6조 개인정보 보호책임자 */}
            <section className="space-y-2">
              <h2 className="text-base font-bold text-[#0F2C59]">
                제6조 (개인정보 보호책임자 및 담당 부서)
              </h2>
              <p>진흥원은 개인정보 처리에 관한 업무를 총괄해서 책임지고 정보주체의 고충을 신속하게 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 space-y-1.5 text-xs sm:text-sm">
                <div>• <strong>개인정보 보호책임자:</strong> 미래스마트산업진흥원 개인정보보호담당</div>
                <div>• <strong>문의 이메일:</strong> contact@smartindustry.or.kr</div>
                <div>• <strong>기타 문의:</strong> 온라인 문의하기 폼을 통한 접수 지원</div>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>메인 화면으로 돌아가기</span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
