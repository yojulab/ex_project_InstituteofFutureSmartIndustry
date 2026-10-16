import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  FileText,
  HelpCircle,
  MapPin,
  PhoneCall,
  ArrowUpRight,
} from 'lucide-react';
import UiBadge from '@/components/common/UiBadge';

export interface QuickLinkItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  HelpCircle: <HelpCircle className="w-6 h-6" />,
  MapPin: <MapPin className="w-6 h-6" />,
  PhoneCall: <PhoneCall className="w-6 h-6" />,
};

interface QuickLinksGridProps {
  links: QuickLinkItem[];
}

export const QuickLinksGrid: React.FC<QuickLinksGridProps> = ({ links }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-10 relative z-20" aria-label="자주 찾는 빠른 메뉴">
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <UiBadge id="P01-SEC03-QCK00" name="자주 찾는 퀵링크 서비스 영역" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
            <h2 className="text-xl font-extrabold text-[#0F2C59]">자주 찾는 서비스</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">원하시는 메뉴를 빠르게 탐색하세요</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {links.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              className="relative group flex flex-col items-center text-center p-4 rounded-xl border border-slate-100 hover:border-sky-300 bg-slate-50/60 hover:bg-sky-50/50 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <UiBadge id={`P01-SEC03-QCK0${idx + 1}`} name={`퀵링크: ${item.title}`} />
              <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#0F2C59] group-hover:text-[#0284C7] group-hover:border-sky-300 shadow-xs transition-colors mb-3">
                {ICON_MAP[item.icon] || <Briefcase className="w-6 h-6" />}
              </div>

              <div className="flex items-center gap-1 font-bold text-slate-900 group-hover:text-[#0284C7] text-sm">
                <span>{item.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {item.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {item.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinksGrid;
