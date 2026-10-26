import React from 'react';
import Link from 'next/link';
import { Cpu, Award, GraduationCap, Microscope, ArrowUpRight } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

const BUSINESS_CARDS = [
  {
    id: 'tech',
    title: 'AI 기술개발 및 실증',
    description: '산업 현장의 생산성 향상과 공정 혁신을 위한 인공지능 응용 기술 개발 및 실증 테스트베드를 지원합니다.',
    icon: Cpu,
    badgeText: null,
    href: '/business#tech',
    color: 'from-blue-500/10 to-sky-500/10 text-sky-600',
  },
  {
    id: 'qualification',
    title: 'AI 민간자격 개발',
    description: '국가직무능력표준(NCS) 및 산업 수요에 부합하는 공인 수준의 표준 교육체계와 AI 자격 검정 체계를 연구·기획하고 있습니다.',
    icon: Award,
    badgeText: '준비 중',
    href: '/business#qualification',
    color: 'from-amber-500/10 to-orange-500/10 text-amber-600',
  },
  {
    id: 'edu',
    title: '전문교육 및 인재양성',
    description: '산업 현장 재직자 및 청년 구직자를 대상으로 실무 중심의 생성형 AI, 데이터 사이언스, 소프트웨어 집중 교육을 운영합니다.',
    icon: GraduationCap,
    badgeText: null,
    href: '/business#edu',
    color: 'from-indigo-500/10 to-purple-500/10 text-indigo-600',
  },
  {
    id: 'research',
    title: '조사·연구 및 산업협력',
    description: '미래 산업 동향 분석, 정책 연구, 기술 표준화 논의와 함께 산·학·연 유기적 협력 네트워크를 구축합니다.',
    icon: Microscope,
    badgeText: null,
    href: '/business#research',
    color: 'from-teal-500/10 to-emerald-500/10 text-teal-600',
  },
];

export const BusinessSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200" id="business-overview">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <UiBadge id="P01-SEC02-BIZ01" name="메인 주요사업 안내 섹션" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
            진흥원 4대 주요 사업
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            산업 전반의 디지털 전환과 인공지능 기술 융합을 이끄는 핵심 추진 분야입니다.
          </p>
        </div>

        {/* 4개 사업 카드 그리드 (PC 4열, 태블릿 2열, 모바일 1열) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BUSINESS_CARDS.map((card, idx) => {
            const IconComponent = card.icon;
            const serialId = `P01-SEC02-CRD0${idx + 1}`;

            return (
              <Link
                key={card.id}
                href={card.href}
                className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <UiBadge id={serialId} name={`사업카드: ${card.title}`} />
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* 카드 2: 민간자격 '준비 중' 필수 배지 (DEL-02 준수) */}
                    {card.badgeText && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {card.badgeText}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors flex items-center gap-1">
                    <span>{card.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#0284C7]" />
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#0284C7]">
                  <span>상세 내용 보기</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BusinessSection;
