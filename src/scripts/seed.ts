import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/db';
import { getInitialAdminConfig, getDatabaseName } from '../lib/config/env';
import {
  AdminUser,
  Post,
  Program,
  Resource,
  Banner,
  QuickLink,
  Faq,
  SiteSetting,
  AuditLog,
} from '../models';
import { hashPassword } from '../lib/auth/password';
import { buildSearchIndex } from './build-search-index';
import {
  mockSiteSetting,
  mockQuickLinks,
  mockBanners,
  mockPrograms,
  mockPosts,
  mockResources,
  mockFaqs,
} from '../data/mock';

export interface SeedOptions {
  reset?: boolean;
  operatorUsername?: string;
  operatorIp?: string;
}

export interface SeedResult {
  success: boolean;
  dbName: string;
  dbExisted: boolean;
  dbCreated: boolean;
  isReset: boolean;
  adminUsername: string;
  counts: {
    siteSettings: number;
    quickLinks: number;
    banners: number;
    programs: number;
    posts: number;
    resources: number;
    faqs: number;
  };
}

/**
 * 9대 핵심 모델 인덱스 동기화
 */
async function syncAllIndexes(): Promise<void> {
  console.log('[Seed] ⚡ 모델 인덱스 동기화(syncIndexes)를 수행합니다...');
  await Promise.all([
    AdminUser.syncIndexes(),
    Post.syncIndexes(),
    Program.syncIndexes(),
    Resource.syncIndexes(),
    AuditLog.syncIndexes(),
    Banner.syncIndexes(),
    QuickLink.syncIndexes(),
    Faq.syncIndexes(),
    SiteSetting.syncIndexes(),
  ]);
  console.log('   ✓ 모든 모델 인덱스 동기화 완료');
}

/**
 * 필수 컬렉션 명시적 생성
 */
async function ensureCollectionsExist(): Promise<string[]> {
  const targetCollections = [
    'adminusers',
    'posts',
    'programs',
    'resources',
    'auditlogs',
    'banners',
    'quicklinks',
    'faqs',
    'sitesettings',
  ];

  const db = mongoose.connection.db!;
  const existingCollectionsCursor = await db.listCollections().toArray();
  const existingNames = new Set(existingCollectionsCursor.map((c) => c.name));
  const created: string[] = [];

  for (const colName of targetCollections) {
    if (!existingNames.has(colName)) {
      try {
        await db.createCollection(colName);
        created.push(colName);
      } catch (err: any) {
        // 동시 생성 등의 경우 이미 존재할 수 있음
      }
    }
  }

  return created;
}

export async function runSeed(options: SeedOptions = {}): Promise<SeedResult> {
  const isReset = !!options.reset;
  const dbName = getDatabaseName();
  console.log(`[Seed] Starting database seed process (mode: ${isReset ? 'RESET & RE-SEED' : 'AUTO-CHECK'})...`);
  
  await connectToDatabase();

  const adminConfig = getInitialAdminConfig();
  const operator = options.operatorUsername || 'system-cli';
  const ip = options.operatorIp || '127.0.0.1';

  // 1. 관련 DB 존재 여부 점검 (없으면 생성)
  let dbExisted = false;
  let dbCreated = false;

  try {
    const adminDb = mongoose.connection.db!.admin();
    const { databases } = await adminDb.listDatabases();
    dbExisted = databases.some((d: any) => d.name === dbName);
  } catch (err) {
    // 특정 권한 제한 환경의 경우 현재 DB 접근으로 유추
    console.warn('[Seed] Warning: listDatabases permission restricted, inferring current database.');
    dbExisted = true;
  }

  if (!dbExisted) {
    console.log(`[Seed] ⚠️ 대상 데이터베이스 '${dbName}'가 서버에 존재하지 않습니다.`);
    console.log(`[Seed] 🛠️ 신규 데이터베이스 '${dbName}'를 생성하고 필수 컬렉션을 초기화합니다...`);
    const createdCols = await ensureCollectionsExist();
    console.log(`   ✓ 신규 컬렉션 생성 완료: [${createdCols.join(', ')}]`);
    await syncAllIndexes();
    dbCreated = true;
  } else {
    // 기존 DB인 경우에도 필수 컬렉션 및 인덱스 누락 방지
    const createdCols = await ensureCollectionsExist();
    if (createdCols.length > 0) {
      console.log(`   ✓ 누락된 컬렉션 보완 생성: [${createdCols.join(', ')}]`);
    }
    await syncAllIndexes();
  }

  // 신규 DB 생성 시이거나 리셋 모드인 경우 전체 초기화 진행
  const shouldPurgeAndRecreate = isReset || dbCreated;

  // 2. 전체 초기화 모드인 경우 기존 콘텐츠 정리
  if (shouldPurgeAndRecreate) {
    console.log('[Seed] Purging existing contents for clean initialization...');
    await Promise.all([
      SiteSetting.deleteMany({}),
      QuickLink.deleteMany({}),
      Banner.deleteMany({}),
      Program.deleteMany({}),
      Post.deleteMany({}),
      Resource.deleteMany({}),
      Faq.deleteMany({}),
    ]);
    console.log('[Seed] All content collections purged successfully.');
  }

  // 3. 관리자 계정 생성 또는 상태 리셋
  const existingAdmin = await AdminUser.findOne({
    $or: [{ username: adminConfig.username }, { email: adminConfig.email }],
  });

  let adminUserId: any;
  const passwordHash = await hashPassword(adminConfig.password);

  if (!existingAdmin) {
    const admin = await AdminUser.create({
      username: adminConfig.username,
      email: adminConfig.email,
      passwordHash,
      name: '진흥원 시스템관리자',
      role: 'admin',
      isActive: true,
      failedAttempts: 0,
      passwordChangedAt: new Date(),
    });
    adminUserId = admin._id;
    console.log(`[Seed] Initial Admin account created: ${adminConfig.username} (${adminConfig.email})`);
  } else {
    adminUserId = existingAdmin._id;
    if (shouldPurgeAndRecreate) {
      // 리셋 또는 신규 DB 모드일 경우 비밀번호 해시 갱신 및 잠금 상태 초기화
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.failedAttempts = 0;
      existingAdmin.lockUntil = undefined;
      existingAdmin.isActive = true;
      existingAdmin.passwordChangedAt = new Date();
      await existingAdmin.save();
      console.log(`[Seed] Existing Admin account (${adminConfig.username}) credentials and lockout state reset.`);
    } else {
      console.log('[Seed] Admin account already exists. Skipping admin creation.');
    }
  }

  // 4. 사이트 기본 설정
  let siteSettingCount = 0;
  const existingSetting = await SiteSetting.findOne();
  if (shouldPurgeAndRecreate || !existingSetting) {
    await SiteSetting.create(mockSiteSetting);
    siteSettingCount = 1;
    console.log('[Seed] SiteSettings seeded from mock.');
  } else {
    siteSettingCount = 1;
  }

  // 5. 퀵링크 6종
  let quickLinkCount = await QuickLink.countDocuments();
  if (shouldPurgeAndRecreate || quickLinkCount === 0) {
    await QuickLink.insertMany(mockQuickLinks);
    quickLinkCount = mockQuickLinks.length;
    console.log(`[Seed] QuickLinks (${quickLinkCount} items) seeded from mock.`);
  }

  // 6. 공지 배너
  let bannerCount = await Banner.countDocuments();
  if (shouldPurgeAndRecreate || bannerCount === 0) {
    await Banner.insertMany(mockBanners);
    bannerCount = mockBanners.length;
    console.log(`[Seed] Banners (${bannerCount} items) seeded from mock.`);
  }

  // 7. 주요 사업 안내 (신청 기능 배제, 안내 중심)
  let programCount = await Program.countDocuments();
  if (shouldPurgeAndRecreate || programCount === 0) {
    await Program.insertMany(mockPrograms);
    programCount = mockPrograms.length;
    console.log(`[Seed] Programs (${programCount} items) seeded from mock.`);
  }

  // 8. 게시물(공지/보도/행사/입찰)
  let postCount = await Post.countDocuments();
  if (shouldPurgeAndRecreate || postCount === 0) {
    const postsToInsert = mockPosts.map((p) => ({
      ...p,
      publishedAt: new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000),
      createdBy: adminUserId,
    }));
    await Post.insertMany(postsToInsert);
    postCount = postsToInsert.length;
    console.log(`[Seed] Posts (${postCount} items) seeded from mock.`);
  }

  // 9. 자료실
  let resourceCount = await Resource.countDocuments();
  if (shouldPurgeAndRecreate || resourceCount === 0) {
    const resourcesToInsert = mockResources.map((r) => ({
      ...r,
      publishedAt: new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
    }));
    await Resource.insertMany(resourcesToInsert);
    resourceCount = resourcesToInsert.length;
    console.log(`[Seed] Resources (${resourceCount} items) seeded from mock.`);
  }

  // 10. FAQ
  let faqCount = await Faq.countDocuments();
  if (shouldPurgeAndRecreate || faqCount === 0) {
    await Faq.insertMany(mockFaqs);
    faqCount = mockFaqs.length;
    console.log(`[Seed] FAQs (${faqCount} items) seeded from mock.`);
  }

  // 11. 리셋 또는 신규 생성인 경우 감사 로그 기록 및 검색 인덱스 갱신
  if (shouldPurgeAndRecreate) {
    try {
      await AuditLog.create({
        adminId: adminUserId,
        username: operator,
        action: 'DATA_RESET',
        ipAddress: ip,
        userAgent: 'system/seed',
        details: {
          dbName,
          dbCreated,
          purgedAndRecreated: true,
          counts: {
            siteSettings: siteSettingCount,
            quickLinks: quickLinkCount,
            banners: bannerCount,
            programs: programCount,
            posts: postCount,
            resources: resourceCount,
            faqs: faqCount,
          },
        },
      });
      console.log('[Seed] Audit log for DATA_RESET recorded.');
    } catch (auditErr) {
      console.warn('[Seed] Warning: Failed to record audit log:', auditErr);
    }

    // 온디바이스 검색 인덱스 파일 자동 재구축
    try {
      await buildSearchIndex();
      console.log('[Seed] Search index rebuilt automatically after data seed.');
    } catch (idxErr) {
      console.warn('[Seed] Warning: Failed to rebuild search index:', idxErr);
    }
  }

  console.log(`[Seed] Database '${dbName}' initialization completed successfully!`);

  return {
    success: true,
    dbName,
    dbExisted,
    dbCreated,
    isReset,
    adminUsername: adminConfig.username,
    counts: {
      siteSettings: siteSettingCount,
      quickLinks: quickLinkCount,
      banners: bannerCount,
      programs: programCount,
      posts: postCount,
      resources: resourceCount,
      faqs: faqCount,
    },
  };
}

// 직접 CLI 실행 시 호출
if (require.main === module) {
  const args = process.argv.slice(2);
  const isReset = args.includes('--reset') || args.includes('-r') || args.includes('--force');

  runSeed({ reset: isReset })
    .then((res) => {
      console.log(`[Seed CLI] Database '${res.dbName}' (Created: ${res.dbCreated}, Existed: ${res.dbExisted})`);
      console.log('[Seed CLI] Process finished successfully:', JSON.stringify(res.counts));
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed CLI] Error:', err);
      process.exit(1);
    });
}
