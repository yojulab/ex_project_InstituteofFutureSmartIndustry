import React from 'react';
import Link from 'next/link';
import {
  Building2,
  FileText,
  UserCheck,
  Cpu,
  GraduationCap,
  Microscope,
  Award,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import UiBadge from '@/components/common/UiBadge';
import { getSiteContent } from '@/lib/queries/contents';

export const revalidate = 60; // 60초 ISR (관리자 수정 시 revalidatePath로 즉시 갱신)

export const metadata = {
  title: '진흥원 소개 | 미래스마트산업진흥원',
  description: 'AI와 디지털 기술로 미래산업의 변화를 준비하는 비영리 공익 전문단체 미래스마트산업진흥원 소개입니다.',
};

export default async function AboutPage() {
  const content = await getSiteContent('about');
  const roles = content.metadata?.roles || [];
  const charterUrl = content.metadata?.charterUrl || '/docs/articles-public.pdf';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 페이지 타이틀 헤더 */}
      <section className="bg-gradient-to-b from-[#0F2C59] to-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-3xl">
            <UiBadge id="P02-SEC01-TIT01" name="진흥원 소개 타이틀 섹션" />
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">About Institute</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
              {content.title}
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              {content.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 2. 설립 취지 및 비영리 공익성 안내 (관리자 웹 에디터 연동) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
              <UiBadge id="P02-SEC02-PURP01" name="설립 취지 및 성격 섹션" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
                설립 취지 및 기관 성격
              </h2>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                  h2: ({ node, ...props }) => <h3 className="text-xl font-bold text-[#0F2C59] mt-6 mb-3" {...props} />,
                  h3: ({ node, ...props }) => <h4 className="text-base font-bold text-slate-800 mt-5 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-1 mb-4" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-1 mb-4" {...props} />,
                  img: ({ node, ...props }) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img {...props} alt={props.alt || '소개 이미지'} className="rounded-2xl max-h-96 my-6 border border-slate-200 shadow-sm" />
                  ),
                }}
              >
                {content.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 진흥원 4대 핵심 역할 */}
      {roles.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="relative text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <UiBadge id="P02-SEC03-ROLE01" name="4대 핵심 역할 섹션" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
                진흥원 핵심 역할
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                미래 스마트 산업의 도약과 인재 양성을 위해 집중 추진하는 주요 활동 영역입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {roles.map((role: any, idx: number) => {
                const icons = [Cpu, Award, GraduationCap, Microscope];
                const IconComponent = icons[idx % icons.length] || Building2;
                const isPrep = role.title.includes('자격') || role.title.includes('준비');

                return (
                  <div key={idx} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{role.title}</h3>
                      {isPrep && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">준비 중</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {role.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. 공개용 정관 열람 및 원장 소개 링크 섹션 */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 정관 PDF 카드 */}
            <div className="relative p-7 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <UiBadge id="P02-SEC04-DOC01" name="공개용 정관 다운로드/열람" />
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">공개용 정관 열람</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  진흥원의 설립 목적, 조직 구성, 재정 원칙 및 총회 규정을 명시한 공식 정관입니다. (개인정보 보호를 위해 임원 명부 및 서명란은 제외된 공람용 사본입니다.)
                </p>
              </div>

              <div className="mt-6">
                <a
                  href={charterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>공개용 정관(PDF) 열람하기</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </a>
              </div>
            </div>

            {/* 원장 소개 연결 카드 */}
            <div className="relative p-7 rounded-2xl bg-gradient-to-br from-[#0F2C59] to-slate-900 text-white flex flex-col justify-between shadow-md">
              <UiBadge id="P02-SEC04-DIR01" name="원장 소개 링크 배너" />
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/10 text-sky-300 flex items-center justify-center mb-4 backdrop-blur-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">원장 소개 바로가기</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  25년 이상의 현장 실무와 전문 직업교육을 바탕으로 산업 AI 혁신을 선도하는 김범준 원장의 정식 프로필과 학술 연구 성과를 안내합니다.
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href="/about/director"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <span>원장 프로필 및 이력 보기</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
