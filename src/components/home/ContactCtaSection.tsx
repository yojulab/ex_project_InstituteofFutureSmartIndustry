import React from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Handshake, Users, Sparkles } from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export const ContactCtaSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-[#0F2C59] via-slate-900 to-[#0F2C59] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-14 backdrop-blur-sm text-center max-w-4xl mx-auto">
          <UiBadge id="P01-SEC05-CTA01" name="메인 협력 문의 유도 섹션" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-400/10 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-6">
            <Handshake className="w-3.5 h-3.5" />
            <span>산·학·연 파트너십 & 교육 협력</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            미래스마트산업진흥원과 함께<br className="hidden sm:inline" />{' '}
            미래 산업 혁신을 만들어 갈 파트너를 모십니다.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            인공지능 기술 실증, 전문 직업교육, 정책 연구, 산학 협력 등 진흥원과의 다양한 협업 기회에 대해 언제든 편하게 문의해 주시기 바랍니다.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            >
              <Mail className="w-4 h-4" />
              <span>온라인 문의하기 바로가기</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCtaSection;
