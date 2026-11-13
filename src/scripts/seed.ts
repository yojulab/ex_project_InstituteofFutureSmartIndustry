import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/db';
import { getInitialAdminConfig, getDatabaseName } from '../lib/config/env';
import { AdminUser, Post, Course, LectureAttachment, AuditLog } from '../models';
import { hashPassword } from '../lib/auth/password';

export interface SeedOptions {
  reset?: boolean;
  operatorUsername?: string;
  operatorIp?: string;
}

export interface SeedResult {
  success: boolean;
  dbName: string;
  isReset: boolean;
  adminUsername: string;
  counts: {
    adminUsers: number;
    posts: number;
    courses: number;
    attachments: number;
  };
}

/**
 * MVP 모델 인덱스 동기화 (AdminUser, Post, Course, LectureAttachment, AuditLog)
 */
async function syncCoreIndexes(): Promise<void> {
  console.log('[Seed] ⚡ 모델 인덱스 동기화(syncIndexes)를 수행합니다...');
  await Promise.all([
    AdminUser.syncIndexes(),
    Post.syncIndexes(),
    Course.syncIndexes(),
    LectureAttachment.syncIndexes(),
    AuditLog.syncIndexes(),
  ]);
  console.log('   ✓ 핵심 모델 인덱스 동기화 완료');
}

/**
 * 레거시 컬렉션 정리 (DEL-04, DEL-06)
 */
async function cleanupLegacyCollections(): Promise<void> {
  const legacyNames = ['programs', 'resources', 'banners', 'quicklinks', 'faqs', 'sitesettings'];
  const db = mongoose.connection.db!;
  const existingCollectionsCursor = await db.listCollections().toArray();
  const existingNames = new Set(existingCollectionsCursor.map((c) => c.name));

  for (const name of legacyNames) {
    if (existingNames.has(name)) {
      try {
        await db.dropCollection(name);
        console.log(`   ✓ 레거시 컬렉션 [${name}] 제거 완료`);
      } catch {
        // 이미 제거되었거나 drop 권한 이슈 시 무시
      }
    }
  }
}

/**
 * 데이터베이스 초기화 및 초기 관리자 계정 생성
 */
export async function seedDatabase(options: SeedOptions = {}): Promise<SeedResult> {
  await connectToDatabase();
  const dbName = getDatabaseName();
  console.log(`\n========================================================`);
  console.log(`[Seed] 미래스마트산업진흥원 MVP 데이터베이스 초기화 시작`);
  console.log(`[Seed] 대상 데이터베이스: ${dbName}`);
  console.log(`========================================================\n`);

  if (options.reset) {
    console.log('[Seed] ⚠️ --reset 옵션 감지: 레거시 및 기존 데이터 정리를 수행합니다.');
    await cleanupLegacyCollections();
    await Promise.all([
      Post.deleteMany({}),
      Course.deleteMany({}),
      LectureAttachment.deleteMany({}),
    ]);
    console.log('   ✓ 모든 게시물 및 강좌/첨부 데이터 삭제 완료');
  }

  await syncCoreIndexes();

  // 초기 관리자 계정 생성 또는 동기화
  const adminConfig = getInitialAdminConfig();
  let admin = await AdminUser.findOne({
    $or: [{ username: adminConfig.username }, { email: adminConfig.email }],
  });

  if (!admin) {
    const passwordHash = await hashPassword(adminConfig.password);
    admin = await AdminUser.create({
      username: adminConfig.username,
      email: adminConfig.email,
      passwordHash,
      name: '시스템 최고관리자',
      role: 'admin',
      isActive: true,
      failedAttempts: 0,
      passwordChangedAt: new Date(),
    });
    console.log(`   ✓ 초기 관리자 계정 [${admin.username}] 생성 완료`);
  } else {
    // 비밀번호 및 상태 재설정
    admin.passwordHash = await hashPassword(adminConfig.password);
    admin.failedAttempts = 0;
    admin.lockUntil = undefined;
    admin.isActive = true;
    await admin.save();
    console.log(`   ✓ 기존 관리자 계정 [${admin.username}] 자격증명 및 잠금 해제 완료`);
  }

  // 기본 게시물 데이터가 없는 경우 표준 게시물 시드 생성
  const existingPostCount = await Post.countDocuments({ deletedAt: null });
  if (existingPostCount === 0) {
    console.log('[Seed] 📝 표준 기본 게시물 4건을 생성합니다...');
    const defaultPosts: Array<{
      category: 'notice' | 'activity' | 'paper' | 'director';
      title: string;
      slug: string;
      summary: string;
      body: string;
      status: 'draft' | 'private' | 'public';
      isFeatured: boolean;
      eventDate?: Date;
      sourceName?: string;
      sourceUrl?: string;
      authors?: string[];
      journal?: string;
      volumeIssuePages?: string;
      doi?: string;
    }> = [
      {
        category: 'activity',
        title: '[보도자료] 미래스마트산업진흥원, 중소 제조기업 AI 전환 지원 본격화',
        slug: 'press-2026-sme-ai-support',
        summary: '중소 제조기업의 AI 기반 생산 공정 혁신 및 스마트 제조 생태계 조성을 위한 기술 지원 사업을 본격 추진합니다.',
        body: '## 미래스마트산업진흥원, 중소 제조기업 AI 전환 지원 본격화\n\n미래스마트산업진흥원은 인공지능(AI)과 디지털 전환(DX)을 통한 제조 혁신을 선도하기 위해 중소 제조기업 맞춤형 AI 도입 지원 프로그램을 추진합니다.\n\n### 주요 지원 내용\n- 현장 맞춤형 온디바이스 AI 비전 검사 알고리즘 기술 자문\n- 실무 인력 양성을 위한 재직자 교육 훈련\n- 제조 데이터 분석 인프라 연계',
        status: 'public',
        isFeatured: true,
        eventDate: new Date('2026-10-15'),
        sourceName: 'AI타임스',
        sourceUrl: 'https://example.com/news/1',
      },
      {
        category: 'notice',
        title: '2026년도 상반기 미래스마트산업진흥원 주요 지원사업 종합 설명회 안내',
        slug: 'notice-2026-h1-business-info',
        summary: '2026년 상반기 미래스마트산업진흥원의 연구실증, 인재양성 및 기업 협력 사업 종합 설명회를 개최합니다.',
        body: '## 2026년 상반기 사업 설명회 개최\n\n- **일시**: 2026년 11월 20일(금) 14:00 ~ 16:30\n- **장소**: 미래스마트산업진흥원 컨퍼런스홀 (온라인 동시 송출)\n- **대상**: 스마트 제조 및 산업 AI에 관심 있는 기업 임직원 및 연구자\n\n많은 관심과 참여를 바랍니다.',
        status: 'public',
        isFeatured: true,
        eventDate: new Date('2026-10-10'),
      },
      {
        category: 'activity',
        title: '제12회 스마트 제조혁신 테크포럼 (온디바이스 AI와 엣지 컴퓨팅)',
        slug: 'forum-12th-smart-manufacturing-tech',
        summary: '엣지 컴퓨팅 기반의 실시간 결함 감지 및 스마트팩토리 적용 사례를 공유하는 기술 포럼을 성황리에 마무리하였습니다.',
        body: '## 제12회 테크포럼 성료\n\n산업 현장에서 클라우드 연결 없이 로컬에서 고속 추론을 수행하는 온디바이스 AI의 최신 트렌드와 성공 사례를 공유하였습니다.',
        status: 'public',
        isFeatured: true,
        eventDate: new Date('2026-09-28'),
        sourceName: '전자신문',
      },
      {
        category: 'paper',
        title: '온디바이스 딥러닝 기반 스마트팩토리 실시간 품질 검사 시스템 연구',
        slug: 'paper-on-device-dl-smart-factory-inspection',
        summary: '엣지 단말에서 저전력 고효율 딥러닝 모델을 활용하여 제조 공정 불량률을 실시간 감지하는 연구 성과를 한국인공지능산업학회에 게재하였습니다.',
        body: '본 연구에서는 제한된 컴퓨팅 자원을 가진 산업용 임베디드 디바이스에서 최적화된 경량 컨볼루션 신경망을 구동하여 99.2%의 불량 검출 정확도와 15ms 이하의 지연시간을 달성하였습니다.',
        status: 'public',
        isFeatured: false,
        authors: ['김범준', '연구개발팀'],
        journal: '한국인공지능산업학회논문지',
        volumeIssuePages: 'Vol.14, No.2, pp.45-58',
        doi: 'https://doi.org/10.1016/j.procir.2023.01.001',
      },
    ];

    for (const postData of defaultPosts) {
      await Post.create(postData);
    }
    console.log('   ✓ 기본 게시물 4건 생성 완료');
  }

  const postCount = await Post.countDocuments({ deletedAt: null });
  const courseCount = await Course.countDocuments({ deletedAt: null });
  const attachmentCount = await LectureAttachment.countDocuments({});
  const adminCount = await AdminUser.countDocuments({ isActive: true });

  console.log('\n========================================================');
  console.log(`[Seed] 초기화 완료: 관리자 ${adminCount}명, 게시물 ${postCount}건, 강좌 ${courseCount}건`);
  console.log('========================================================\n');

  return {
    success: true,
    dbName,
    isReset: !!options.reset,
    adminUsername: adminConfig.username,
    counts: {
      adminUsers: adminCount,
      posts: postCount,
      courses: courseCount,
      attachments: attachmentCount,
    },
  };
}

if (require.main === module) {
  const isReset = process.argv.includes('--reset');
  seedDatabase({ reset: isReset })
    .then(() => {
      console.log('[Seed CLI] 성공적으로 완료되었습니다.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed CLI] 치명적 오류 발생:', err);
      process.exit(1);
    });
}
