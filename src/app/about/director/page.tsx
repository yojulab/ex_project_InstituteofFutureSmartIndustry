import React from 'react';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  ExternalLink,
  Info,
  Calendar,
  Building,
  ArrowLeft,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import UiBadge from '@/components/common/UiBadge';
import { getSiteContent } from '@/lib/queries/contents';

export const revalidate = 60; // 60초 ISR (관리자 수정 시 revalidatePath로 즉시 갱신)

export const metadata = {
  title: '원장 소개 | 미래스마트산업진흥원',
  description:
    '미래스마트산업진흥원 김범준 원장의 25년 이상 실무·교육 경력, 학술 연구(DOI 논문) 및 대외 활동 소개입니다.',
};

export default async function DirectorPage() {
  const content = await getSiteContent('director');
  const meta = content.metadata || {};

  const directorName = meta.directorName || '김범준';
  const directorEnName = meta.directorEnName || 'Kim Beom-Jun';
  const directorTitle =
    meta.directorTitle || '미래스마트산업진흥원 초대 원장 / IT 직업교육·인공지능 연구자';
  const profileImageUrl = meta.profileImageUrl || '';
  const educationList: string[] = meta.education || [];
  const defaultEducation = [
    '컴퓨터공학 박사과정 수료 (인공지능 보안, IT 윤리 전공)',
    '공학 석사 학위 취득 (소프트웨어 공학)',
    '공학사 학위 취득 (컴퓨터과학)',
  ];
  const effectiveEducation = educationList.length > 0 ? educationList : defaultEducation;
  const timelineList: Array<{ period: string; title: string; desc: string }> =
    meta.timeline || [];
  const papersList: Array<{ title: string; journal: string; doi: string }> =
    meta.papers || [];
  const transparencyNotice =
    meta.transparencyNotice ||
    '본 페이지에 수록된 학술 연구, 강의, 프로젝트 및 경력 사항은 김범준 원장 개인의 전문 이력이며, 미래스마트산업진흥원 기관 설립 이후의 고유 사업 수행 실적과 엄격히 구분하여 투명하게 공개합니다.';

  // 기본 공인 DOI 논문 목록 (AC-13 준수)
  const defaultPapers = [
    {
      title: '정보기술 직업교육 전문가들의 사이버보안 인식과 방향성 탐색',
      journal: '『융합과 통섭』, 제9권 제5호, pp. 309–325, 2026',
      doi: 'https://doi.org/10.33090/SFCC.9.5.18',
    },
    {
      title: '생성형 인공지능 시대, IT산업의 윤리적 방향성 탐색: 저작권의 딜레마',
      journal: '『융합과 통섭』, 제8권 제5호, pp. 112–130, 2025',
      doi: 'https://doi.org/10.33090/SFCC.8.5.8',
    },
  ];
  const effectivePapers = papersList.length > 0 ? papersList : defaultPapers;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. 상단 타이틀 헤더 */}
      <section className="bg-gradient-to-b from-[#0F2C59] to-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-3xl">
            <UiBadge id="P03-SEC01-TIT01" name="원장 소개 타이틀 섹션" />
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>진흥원 소개로 돌아가기</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {content.title}
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              {content.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 2. [필수] 개인 실적과 기관 실적 분리 고지문 (MOD-02, AC-05) */}
      <section className="bg-amber-50/80 border-b border-amber-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-start sm:items-center gap-3 text-xs sm:text-sm text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <p className="leading-relaxed">
              <strong>[표시 투명성 안내]</strong> {transparencyNotice}
            </p>
          </div>
        </div>
      </section>

      {/* 3. 원장 프로필 기본 정보 (사진 + 학력/약력 요약) */}
      <section className="py-14 sm:py-18 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative max-w-5xl mx-auto">
            <UiBadge id="P03-SEC02-PROF01" name="원장 프로필 요약 카드" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* 프로필 사진 또는 아바타 */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-[#0F2C59] via-slate-800 to-sky-700 p-1.5 shadow-xl">
                  {profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImageUrl}
                      alt={`${directorName} 원장 프로필 사진`}
                      className="w-full h-full rounded-2xl object-cover bg-slate-900"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white p-6">
                      <User className="w-20 h-20 text-sky-400 mb-3" />
                      <span className="text-xs text-sky-300 font-semibold tracking-wide">
                        미래스마트산업진흥원
                      </span>
                      <span className="text-2xl font-black tracking-tight text-white mt-1">
                        {directorName}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">초대 원장</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 기본 이력 및 학력 (MOD-01: '박사과정' 명확히 기술) */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {directorName} 원장{' '}
                    {directorEnName && (
                      <span className="text-base font-normal text-slate-500">
                        ({directorEnName})
                      </span>
                    )}
                  </h2>
                  <p className="text-sm font-semibold text-[#0284C7] mt-1">
                    {directorTitle}
                  </p>
                </div>

                {/* 인사말 마크다운 본문 (관리자 웹 에디터 연동) */}
                <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      h2: ({ node, ...props }) => <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                    }}
                  >
                    {content.content}
                  </ReactMarkdown>
                </div>

                {/* 학력 정보 (MOD-01 준수: 박사학위와 박사과정 엄격 구분) */}
                {effectiveEducation.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <GraduationCap className="w-4 h-4 text-sky-600" />
                      <span>학력 사항 (정규 학위 및 수료 과정)</span>
                    </div>
                    <ul className="text-xs sm:text-sm text-slate-700 space-y-1 pl-6 list-disc">
                      {effectiveEducation.map((edu, idx) => (
                        <li key={idx}>
                          {edu.includes('박사과정') ? <strong>{edu}</strong> : edu}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-slate-500 pt-1">
                      ※ 학력 위조/과장 오해 방지를 위해 '박사학위 취득'이 아닌 '박사과정 수료' 상태임을 명확히 기재합니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 대표 학술 연구 성과 (DOI 링크 포함, AC-13) */}
      {effectivePapers.length > 0 && (
        <section className="py-14 sm:py-18 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="relative mb-8">
                <UiBadge id="P03-SEC03-PAPER01" name="학술 논문 및 연구 성과 섹션" />
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                  <BookOpen className="w-4 h-4" />
                  <span>Academic Research</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mt-1">
                  대표 학술 논문 (Peer-Reviewed Papers)
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                  인공지능 기술의 직업교육 적용 및 윤리적 방향성에 대한 공인 등재학술지 게재 논문입니다. (DOI 공식 링크 연결)
                </p>
              </div>

              <div className="space-y-4">
                {effectivePapers.map((paper, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        등재 학술 논문
                      </span>
                      <span className="text-xs text-slate-500">{paper.journal}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {paper.title}
                    </h3>

                    {paper.doi && (
                      <div className="pt-2">
                        <a
                          href={paper.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-[#0F2C59] underline underline-offset-4"
                        >
                          <span>DOI 원문 열람: {paper.doi}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. 25년 이상 주요 실무 및 교육 경력 타임라인 */}
      {timelineList.length > 0 && (
        <section className="py-14 sm:py-18 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="relative mb-10">
                <UiBadge id="P03-SEC04-CAREER01" name="주요 경력 타임라인 섹션" />
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                  <Briefcase className="w-4 h-4" />
                  <span>Professional Experience</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight mt-1">
                  주요 실무 및 직업교육 경력
                </h2>
              </div>

              <div className="space-y-6 border-l-2 border-slate-200 pl-6 sm:pl-8 ml-2 sm:ml-4">
                {timelineList.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-xs ${
                        idx === 0 ? 'bg-sky-600' : 'bg-slate-400'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        idx === 0 ? 'text-sky-600' : 'text-slate-500'
                      }`}
                    >
                      {item.period}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. 하단 목록 복귀 링크 */}
      <section className="py-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>진흥원 소개 페이지로 돌아가기</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
