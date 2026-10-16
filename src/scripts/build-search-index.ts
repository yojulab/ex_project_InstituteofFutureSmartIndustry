import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../lib/db';
import { Program, Post, Resource, Faq } from '../models';

export async function buildSearchIndex() {
  console.log('[Search Index Builder] Starting search-index.json build...');
  await connectToDatabase();

  const [programs, posts, resources, faqs] = await Promise.all([
    Program.find({ deletedAt: null }).lean(),
    Post.find({ status: 'published', deletedAt: null }).lean(),
    Resource.find({ deletedAt: null }).lean(),
    Faq.find({ isActive: true }).lean(),
  ]);

  const indexItems: any[] = [];

  // 1. 사업안내 항목
  programs.forEach((p: any) => {
    indexItems.push({
      id: `prog-${p._id}`,
      type: 'program',
      category: p.category,
      title: p.title,
      summary: p.summary,
      url: `/programs/${p.slug}`,
      target: p.target,
      text: `${p.title} ${p.category} ${p.summary} ${p.target} ${p.department}`,
    });
  });

  // 2. 알림마당 게시물
  posts.forEach((p: any) => {
    indexItems.push({
      id: `post-${p._id}`,
      type: p.type,
      category: p.type === 'notice' ? '공지사항' : p.type === 'press' ? '보도자료' : '행사·입찰',
      title: p.title,
      summary: p.summary || '',
      url: `/news/${p.type}/${p.slug}`,
      publishedAt: p.publishedAt,
      text: `${p.title} ${p.summary} ${p.department || ''}`,
    });
  });

  // 3. 자료실
  resources.forEach((r: any) => {
    indexItems.push({
      id: `res-${r._id}`,
      type: 'resource',
      category: r.kind,
      title: r.title,
      summary: r.summary || '',
      url: '/resources',
      text: `${r.title} ${r.summary} ${r.authorOrDept}`,
    });
  });

  // 4. FAQ
  faqs.forEach((f: any) => {
    indexItems.push({
      id: `faq-${f._id}`,
      type: 'faq',
      category: f.category,
      title: f.question,
      summary: f.answer,
      url: '/guide/faq',
      text: `${f.question} ${f.answer} ${f.category}`,
    });
  });

  const outDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outputPath = path.join(outDir, 'search-index.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        version: '1.0.0',
        builtAt: new Date().toISOString(),
        totalItems: indexItems.length,
        items: indexItems,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(`[Search Index Builder] Successfully created ${outputPath} with ${indexItems.length} items!`);
  if (indexItems.length === 0) {
    console.warn('  ⚠️ 안내: MongoDB에 등록된 데이터가 0건이어서 빈 인덱스가 생성되었습니다.');
    console.warn('     초기 목업 데이터를 채우려면 "npm run seed"를 먼저 실행하십시오.');
  }
}

if (require.main === module) {
  buildSearchIndex()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Search Index Builder] Error:', err);
      process.exit(1);
    });
}
