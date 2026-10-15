import { connectToDatabase } from '../lib/db';
import { getInitialAdminConfig } from '../lib/config/env';
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

export async function runSeed(options: SeedOptions = {}): Promise<SeedResult> {
  const isReset = !!options.reset;
  console.log(`[Seed] Starting database seed process (mode: ${isReset ? 'RESET & RE-SEED' : 'INCREMENTAL'})...`);
  await connectToDatabase();

  const adminConfig = getInitialAdminConfig();
  const operator = options.operatorUsername || 'system-cli';
  const ip = options.operatorIp || '127.0.0.1';

  // 1. 리셋 모드인 경우 기존 콘텐츠 컬렉션 정리
  if (isReset) {
    console.log('[Seed] Reset mode active. Purging existing contents...');
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

  // 2. 관리자 계정 생성 또는 상태 리셋
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
    if (isReset) {
      // 리셋 모드일 경우 비밀번호 해시 갱신 및 잠금 상태 초기화
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

  // 3. 사이트 기본 설정
  let siteSettingCount = 0;
  const existingSetting = await SiteSetting.findOne();
  if (isReset || !existingSetting) {
    await SiteSetting.create(mockSiteSetting);
    siteSettingCount = 1;
    console.log('[Seed] SiteSettings seeded from mock.');
  } else {
    siteSettingCount = 1;
  }

  // 4. 퀵링크 6종
  let quickLinkCount = await QuickLink.countDocuments();
  if (isReset || quickLinkCount === 0) {
    await QuickLink.insertMany(mockQuickLinks);
    quickLinkCount = mockQuickLinks.length;
    console.log(`[Seed] QuickLinks (${quickLinkCount} items) seeded from mock.`);
  }

  // 5. 공지 배너
  let bannerCount = await Banner.countDocuments();
  if (isReset || bannerCount === 0) {
    await Banner.insertMany(mockBanners);
    bannerCount = mockBanners.length;
    console.log(`[Seed] Banners (${bannerCount} items) seeded from mock.`);
  }

  // 6. 주요 사업 안내 (신청 기능 배제, 안내 중심)
  let programCount = await Program.countDocuments();
  if (isReset || programCount === 0) {
    await Program.insertMany(mockPrograms);
    programCount = mockPrograms.length;
    console.log(`[Seed] Programs (${programCount} items) seeded from mock.`);
  }

  // 7. 게시물(공지/보도/행사/입찰)
  let postCount = await Post.countDocuments();
  if (isReset || postCount === 0) {
    const postsToInsert = mockPosts.map((p) => ({
      ...p,
      publishedAt: new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000),
      createdBy: adminUserId,
    }));
    await Post.insertMany(postsToInsert);
    postCount = postsToInsert.length;
    console.log(`[Seed] Posts (${postCount} items) seeded from mock.`);
  }

  // 8. 자료실
  let resourceCount = await Resource.countDocuments();
  if (isReset || resourceCount === 0) {
    const resourcesToInsert = mockResources.map((r) => ({
      ...r,
      publishedAt: new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
    }));
    await Resource.insertMany(resourcesToInsert);
    resourceCount = resourcesToInsert.length;
    console.log(`[Seed] Resources (${resourceCount} items) seeded from mock.`);
  }

  // 9. FAQ
  let faqCount = await Faq.countDocuments();
  if (isReset || faqCount === 0) {
    await Faq.insertMany(mockFaqs);
    faqCount = mockFaqs.length;
    console.log(`[Seed] FAQs (${faqCount} items) seeded from mock.`);
  }

  // 10. 리셋 모드인 경우 감사 로그 기록 및 검색 인덱스 갱신
  if (isReset) {
    try {
      await AuditLog.create({
        adminId: adminUserId,
        username: operator,
        action: 'DATA_RESET',
        ipAddress: ip,
        userAgent: 'system/seed',
        details: {
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
      console.log('[Seed] Search index rebuilt automatically after data reset.');
    } catch (idxErr) {
      console.warn('[Seed] Warning: Failed to rebuild search index:', idxErr);
    }
  }

  console.log('[Seed] Database seed completed successfully!');

  return {
    success: true,
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
      console.log('[Seed CLI] Process finished successfully:', JSON.stringify(res.counts));
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed CLI] Error:', err);
      process.exit(1);
    });
}
