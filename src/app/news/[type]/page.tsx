import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Post } from '@/models/Post';
import { Pin, Paperclip, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsListPageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

const TYPE_CONFIG: Record<string, { title: string; desc: string }> = {
  notice: { title: '공지사항', desc: '진흥원의 주요 공지사항 및 사업 공고를 안내합니다.' },
  press: { title: '보도자료', desc: '진흥원의 주요 성과 및 언론 보도 배포 자료입니다.' },
  event: { title: '행사·교육', desc: '스마트제조 기술 세미나 및 교육 일정을 안내합니다.' },
  bid: { title: '입찰·공모', desc: '진흥원 물품 구매 및 연구용역 입찰공고입니다.' },
};

export const revalidate = 60;

export default async function NewsListPage({ params, searchParams }: NewsListPageProps) {
  const { type } = await params;
  const { page = '1', q = '' } = await searchParams;

  if (!TYPE_CONFIG[type]) {
    notFound();
  }

  await connectToDatabase();

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 10;

  const query: any = {
    type,
    status: 'published',
    deletedAt: null,
  };

  if (q.trim()) {
    query.$or = [
      { title: { $regex: q.trim(), $options: 'i' } },
      { summary: { $regex: q.trim(), $options: 'i' } },
      { body: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  const [totalCount, posts] = await Promise.all([
    Post.countDocuments(query),
    Post.find(query)
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const config = TYPE_CONFIG[type];

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* 브레드크럼 */}
        <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2" aria-label="브레드크럼">
          <Link href="/" className="hover:underline">홈</Link>
          <span>&gt;</span>
          <Link href="/news" className="hover:underline">알림마당</Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">{config.title}</span>
        </nav>

        {/* 상단 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            {config.title}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">{config.desc}</p>
        </div>

        {/* 서브 탭 네비게이션 */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 pb-3">
          {Object.entries(TYPE_CONFIG).map(([key, item]) => {
            const isActive = type === key;
            return (
              <Link
                key={key}
                href={`/news/${key}`}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#0F2C59] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>

        {/* 검색 및 건수 안내 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="text-xs sm:text-sm text-slate-500">
            총 <strong className="text-slate-900">{totalCount}</strong>건의 게시물이 있습니다.
            (페이지 {currentPage}/{totalPages})
          </div>

          <form method="GET" action={`/news/${type}`} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="제목 또는 내용 검색"
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-sky-500 w-56 shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
            >
              검색
            </button>
          </form>
        </div>

        {/* 게시글 목록 테이블 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <caption className="sr-only">{config.title} 게시물 목록</caption>
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th scope="col" className="py-3.5 px-4 w-16 text-center">번호</th>
                <th scope="col" className="py-3.5 px-4">제목</th>
                <th scope="col" className="py-3.5 px-4 w-28 text-center hidden sm:table-cell">담당부서</th>
                <th scope="col" className="py-3.5 px-4 w-28 text-center">등록일</th>
                <th scope="col" className="py-3.5 px-4 w-16 text-center">첨부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    등록된 게시물이 없습니다.
                  </td>
                </tr>
              ) : (
                posts.map((post: any, idx) => {
                  const itemNumber = totalCount - ((currentPage - 1) * pageSize + idx);
                  const hasAttachments = post.attachments && post.attachments.length > 0;

                  return (
                    <tr
                      key={post._id.toString()}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        post.isPinned ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center text-slate-500 font-medium">
                        {post.isPinned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-100/60 px-1.5 py-0.5 rounded">
                            <Pin className="w-3 h-3" />
                            고정
                          </span>
                        ) : (
                          itemNumber
                        )}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-900">
                        <Link
                          href={`/news/${type}/${post.slug}`}
                          className="hover:text-[#0284C7] transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                      </td>

                      <td className="py-4 px-4 text-center text-slate-500 hidden sm:table-cell">
                        {post.department || '-'}
                      </td>

                      <td className="py-4 px-4 text-center text-slate-500">
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toISOString().slice(0, 10)}
                        </time>
                      </td>

                      <td className="py-4 px-4 text-center text-slate-400">
                        {hasAttachments ? (
                          <span title={`${post.attachments.length}개 파일 첨부`}>
                            <Paperclip className="w-4 h-4 text-sky-600 inline-block" />
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Link
              href={`/news/${type}?page=${Math.max(1, currentPage - 1)}${q ? `&q=${q}` : ''}`}
              className={`p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 ${
                currentPage === 1 ? 'pointer-events-none opacity-40' : ''
              }`}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <span className="text-xs sm:text-sm font-semibold px-4 text-slate-700">
              {currentPage} / {totalPages}
            </span>

            <Link
              href={`/news/${type}?page=${Math.min(totalPages, currentPage + 1)}${q ? `&q=${q}` : ''}`}
              className={`p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 ${
                currentPage === totalPages ? 'pointer-events-none opacity-40' : ''
              }`}
              aria-label="다음 페이지"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
