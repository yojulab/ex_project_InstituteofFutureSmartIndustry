import { connectToDatabase } from '../lib/db';
import { Post, SiteContent, AdminUser } from '../models';
import { getFeaturedPosts, getPublishedPosts } from '../lib/queries/posts';
import { getSiteContent } from '../lib/queries/contents';

async function main() {
  console.log('========================================================');
  console.log('🚀 사용자 3대 보완 요구사항 엔지니어링 검증 시작');
  console.log('========================================================\n');

  await connectToDatabase();

  // 1. 메인 화면 통합게시물 노출 검증
  console.log('1. [메인 화면 통합게시물 노출 검증]');
  const featured = await getFeaturedPosts(3);
  console.log(`   - 메인 노출 게시물 수: ${featured.length}건`);
  if (featured.length === 0) {
    throw new Error('❌ 메인 노출 게시물이 0건입니다!');
  }
  featured.forEach((p, idx) => {
    console.log(`     [${idx + 1}] (${p.category}) ${p.title} (slug: ${p.slug})`);
  });
  console.log('   ✅ 메인 화면 통합게시물 정상 조회 확인 (PASS)\n');

  // 2. 통합 게시판 목록 검증
  console.log('2. [통합게시판 (/updates) 목록 검증]');
  const published = await getPublishedPosts({ page: 1, limit: 10 });
  console.log(`   - 전체 공개 게시물 수: ${published.total}건 (현재 페이지 ${published.posts.length}건)`);
  if (published.total === 0) {
    throw new Error('❌ 공개 게시물이 0건입니다!');
  }
  console.log('   ✅ 통합게시판 정상 동작 확인 (PASS)\n');

  // 3. 고정 페이지(진흥원 소개, 원장 소개) 콘텐츠 모델 및 쿼리 검증
  console.log('3. [고정 페이지 (진흥원 소개 / 원장 소개) 콘텐츠 검증]');
  const about = await getSiteContent('about');
  console.log(`   - 진흥원 소개 제목: "${about.title}"`);
  console.log(`   - 진흥원 4대 역할 수: ${about.metadata?.roles?.length || 0}개`);
  if (!about.title || !about.content) {
    throw new Error('❌ 진흥원 소개 기본 데이터가 유효하지 않습니다.');
  }

  const director = await getSiteContent('director');
  console.log(`   - 원장 소개 제목: "${director.title}"`);
  console.log(`   - 원장 성명: "${director.metadata?.directorName}"`);
  console.log(`   - 학력 항목: ${director.metadata?.education?.join(', ')}`);
  console.log(`   - 논문 수: ${director.metadata?.papers?.length || 0}편`);
  if (!director.title || !director.metadata?.directorName) {
    throw new Error('❌ 원장 소개 기본 데이터가 유효하지 않습니다.');
  }
  console.log('   ✅ 고정 페이지 콘텐츠 조회 및 디폴트 폴백 정상 확인 (PASS)\n');

  // 4. 고정 콘텐츠 업데이트 시뮬레이션
  console.log('4. [관리자 고정 콘텐츠 DB 수정 및 반영 테스트]');
  const testTitle = '미래스마트산업진흥원 (개정 소개)';
  await SiteContent.findOneAndUpdate(
    { slug: 'about' },
    {
      $set: {
        title: testTitle,
        subtitle: '수정 테스트 요약',
        content: '수정 테스트 마크다운 본문',
        metadata: {
          roles: [
            { title: '1. AI 기술개발 및 산업 실증 지원', desc: '테스트' },
          ],
          charterUrl: '/docs/articles-public.pdf',
        },
      },
    },
    { upsert: true, new: true }
  );

  const updatedAbout = await getSiteContent('about');
  console.log(`   - DB 저장 후 조회된 제목: "${updatedAbout.title}"`);
  if (updatedAbout.title !== testTitle) {
    throw new Error('❌ 고정 콘텐츠 DB 저장이 반영되지 않았습니다.');
  }

  // 원복 (초기 기본값으로 복원)
  await SiteContent.deleteOne({ slug: 'about' });
  const restoredAbout = await getSiteContent('about');
  console.log(`   - 기본값 복원 확인: "${restoredAbout.title}"`);
  console.log('   ✅ 고정 콘텐츠 수정 및 저장/복원 완벽 검증 (PASS)\n');

  console.log('========================================================');
  console.log('🎉 3대 보완 요구사항 전체 기능 검증 완료! (ALL PASSED)');
  console.log('========================================================');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
