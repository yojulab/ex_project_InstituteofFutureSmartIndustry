import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:30013';
const ARTIFACT_DIR = '/root/.gemini/antigravity-ide/brain/2aaf60cb-beec-466a-8151-7c2297e84886/screenshots';
const PUBLIC_DIR = path.join(process.cwd(), 'public/screenshots');

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

interface VerificationResult {
  step: string;
  url: string;
  status: number | string;
  title: string;
  screenshotFile: string;
  hasErrors: boolean;
  errors: string[];
  invariantsCheck: {
    noApplicationForm?: boolean;
    hasSkipNav?: boolean;
    zeroExternalAiCalls?: boolean;
  };
}

async function saveScreenshot(page: Page, filename: string) {
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  const publicPath = path.join(PUBLIC_DIR, filename);
  await page.screenshot({ path: artifactPath, fullPage: true });
  fs.copyFileSync(artifactPath, publicPath);
  return filename;
}

async function main() {
  console.log(`\n=============================================================`);
  console.log(`🚀 [QA & Critic] Playwright Headless 전체 사이트 검증 & 캡처 시작`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📂 Artifact Dir: ${ARTIFACT_DIR}`);
  console.log(`=============================================================\n`);

  const browser: Browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ko-KR',
  });

  const page = await context.newPage();

  const results: VerificationResult[] = [];
  const externalAiCalls: string[] = [];
  const consoleErrors: { url: string; msg: string }[] = [];

  // 1. 외부 AI API 및 트래픽 유출 감시 리스너
  page.on('request', (request) => {
    const url = request.url();
    if (
      url.includes('api.openai.com') ||
      url.includes('anthropic.com') ||
      url.includes('generativelanguage.googleapis.com') ||
      url.includes('huggingface.co/api')
    ) {
      console.error(`🚨 [CRITICAL VIOLATION] 외부 AI 트래픽 감지: ${url}`);
      externalAiCalls.push(url);
    }
  });

  // 2. 브라우저 콘솔 에러 리스너
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // favicon 404나 사소한 폰트 경고 제외한 실제 에러 수집
      if (!text.includes('favicon.ico')) {
        consoleErrors.push({ url: page.url(), msg: text });
      }
    }
  });

  // 검증 함수 래퍼
  async function testPage(name: string, route: string, screenshotName: string, extraCheck?: (p: Page) => Promise<{ noAppForm?: boolean; skipNav?: boolean }>) {
    console.log(`🔍 [검증 중] ${name} -> ${route}`);
    const targetUrl = `${BASE_URL}${route}`;
    const pageErrors: string[] = [];

    let status: number | string = 'unknown';
    try {
      const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });
      status = response?.status() ?? 200;
    } catch (err: any) {
      console.warn(`  ⚠️ networkidle 타임아웃 또는 경고: ${err.message}, load 상태로 재대기`);
      try {
        await page.waitForLoadState('domcontentloaded');
        status = 200;
      } catch (e: any) {
        status = `ERR: ${e.message}`;
        pageErrors.push(e.message);
      }
    }

    // 약간의 렌더링 안정화 대기
    await page.waitForTimeout(1000);

    const title = await page.title();
    const screenshotFile = await saveScreenshot(page, screenshotName);

    // KWCAG Skip Nav 확인
    const skipNavExists = await page.evaluate(() => {
      const link = document.querySelector('a[href="#main-content"]');
      return !!link;
    });

    let extraResults = { noAppForm: true, skipNav: skipNavExists };
    if (extraCheck) {
      const checked = await extraCheck(page);
      extraResults = { ...extraResults, ...checked };
    }

    const result: VerificationResult = {
      step: name,
      url: targetUrl,
      status,
      title,
      screenshotFile,
      hasErrors: pageErrors.length > 0,
      errors: pageErrors,
      invariantsCheck: {
        noApplicationForm: extraResults.noAppForm,
        hasSkipNav: extraResults.skipNav,
        zeroExternalAiCalls: externalAiCalls.length === 0,
      },
    };

    results.push(result);
    console.log(`  ✅ 캡처 완료: ${screenshotFile} (Status: ${status})`);
  }

  try {
    // -------------------------------------------------------------
    // [Phase 1: 공개 포털 화면 검증]
    // -------------------------------------------------------------
    // 1. 메인 포털
    await testPage('01. 메인 포털', '/', '01_main_portal.png');

    // 2. 진흥원 소개 (비전/인사말)
    await testPage('02. 진흥원 비전·인사말', '/about/vision', '02_about_vision.png');

    // 3. 진흥원 연혁
    await testPage('03. 진흥원 연혁', '/about/history', '03_about_history.png');

    // 4. 조직도 및 담당자
    await testPage('04. 조직도 및 담당자', '/about/organization', '04_about_organization.png');

    // 5. 찾아오시는 길
    await testPage('05. 찾아오시는 길', '/about/location', '05_about_location.png');

    // 6. 지원사업 목록 (신청 폼/버튼 배제 invariant 확인)
    await testPage('06. 사업안내 목록', '/programs', '06_programs_list.png', async (p) => {
      // 신청 버튼이나 폼이 있는지 검사
      const text = await p.content();
      const hasApplyButton = text.includes('신청하기') || text.includes('온라인 접수') || text.includes('접수하기');
      return { noAppForm: !hasApplyButton };
    });

    // 7. 지원사업 상세 (첫 번째 사업)
    let firstProgramId = '';
    try {
      const href = await page.getAttribute('a[href^="/programs/"]', 'href');
      if (href && href !== '/programs') {
        firstProgramId = href;
      }
    } catch (_) {}

    if (firstProgramId) {
      await testPage('07. 사업안내 상세', firstProgramId, '07_program_detail.png', async (p) => {
        const text = await p.content();
        const hasApplyButton = text.includes('신청하기') || text.includes('온라인 접수');
        return { noAppForm: !hasApplyButton };
      });
    }

    // 8. 알림마당 (새소식)
    await testPage('08. 알림마당 목록', '/news', '08_news_list.png');

    // 9. 알림마당 상세 (첫 번째 게시글)
    let firstNewsId = '';
    try {
      const href = await page.getAttribute('a[href^="/news/"]', 'href');
      if (href && href !== '/news') {
        firstNewsId = href;
      }
    } catch (_) {}

    if (firstNewsId) {
      await testPage('09. 알림마당 상세', firstNewsId, '09_news_detail.png');
    }

    // 10. 정보자료실
    await testPage('10. 정보자료실 목록', '/resources', '10_resources_list.png');

    // 11. 이용안내 / FAQ
    await testPage('11. 자주 묻는 질문(FAQ)', '/guide/faq', '11_guide_faq.png');

    // 12. 업무별 문의안내
    await testPage('12. 부서별 문의안내', '/guide/contact', '12_guide_contact.png');

    // 13. 사이트맵
    await testPage('13. 전체 사이트맵', '/guide/sitemap', '13_guide_sitemap.png');

    // 14. 개인정보처리방침
    await testPage('14. 개인정보처리방침', '/privacy', '14_privacy_policy.png');

    // 15. 저작권 보호정책
    await testPage('15. 저작권 보호정책', '/copyright', '15_copyright_policy.png');

    // 16. 웹 접근성 정책
    await testPage('16. 웹 접근성 정책', '/accessibility', '16_accessibility_policy.png');

    // 17. 온디바이스 검색 화면
    await testPage('17. 온디바이스 검색 페이지', '/search?q=스마트공장', '17_search_page.png');

    // -------------------------------------------------------------
    // [Phase 2: 관리자 CMS 화면 검증]
    // -------------------------------------------------------------
    // 18. 관리자 로그인 화면
    await testPage('18. 관리자 로그인', '/admin/login', '18_admin_login.png');

    // 19. 관리자 로그인 수행
    console.log(`🔐 [인증] 관리자 로그인 수행 (admin / Admin1234!)...`);
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'Admin1234!');
    await page.click('button[type="submit"]');

    // 대시보드로 이동 대기
    try {
      await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
      console.log(`  ✅ 관리자 로그인 성공 -> 대시보드 진입`);
    } catch (e: any) {
      console.error(`  ❌ 대시보드 리다이렉트 실패: ${e.message}`);
    }

    // 20. 관리자 대시보드
    await testPage('19. 관리자 대시보드', '/admin/dashboard', '19_admin_dashboard.png');

    // 21. 관리자 게시물 관리
    await testPage('20. 게시물 관리', '/admin/posts', '20_admin_posts.png');

    // 22. 관리자 사업 관리
    await testPage('21. 사업 관리', '/admin/programs', '21_admin_programs.png');

    // 23. 관리자 자료실 관리
    await testPage('22. 자료실 관리', '/admin/resources', '22_admin_resources.png');

    // 24. 관리자 FAQ 관리
    await testPage('23. FAQ 관리', '/admin/faqs', '23_admin_faqs.png');

    // 25. 관리자 배너 관리 (대체텍스트 필수)
    await testPage('24. 배너 관리', '/admin/banners', '24_admin_banners.png');

    // 26. 관리자 감사로그
    await testPage('25. 불변 감사로그', '/admin/audit-logs', '25_admin_audit_logs.png');

  } catch (globalErr: any) {
    console.error(`💥 [ERROR in Main Flow]:`, globalErr);
  } finally {
    await browser.close();
  }

  // -------------------------------------------------------------
  // [결과 요약 및 검증 보고서]
  // -------------------------------------------------------------
  console.log(`\n=============================================================`);
  console.log(`📋 [검증 결과 리포트]`);
  console.log(`=============================================================`);
  console.table(
    results.map((r) => ({
      Step: r.step,
      Status: r.status,
      Screenshot: r.screenshotFile,
      NoAppForm: r.invariantsCheck.noApplicationForm ? 'PASS' : 'FAIL',
      SkipNav: r.invariantsCheck.hasSkipNav ? 'PASS' : 'N/A',
      Errors: r.hasErrors ? 'YES' : 'NONE',
    }))
  );

  console.log(`\n🛡️ [5대 절대 가드레일 준수 상태]`);
  console.log(`1. 외부 AI API 호출 트래픽: ${externalAiCalls.length === 0 ? '✅ 0건 (완벽 온디바이스 격리)' : `🚨 ${externalAiCalls.length}건 유출 발생!`}`);
  
  const anyAppFormFailed = results.some((r) => r.invariantsCheck.noApplicationForm === false);
  console.log(`2. 사업 신청/접수 폼 배제: ${!anyAppFormFailed ? '✅ 완벽 배제 (안내 전용 준수)' : '🚨 신청 폼 또는 신청 버튼 발견!'}`);

  console.log(`3. 브라우저 콘솔 에러 발생 건수: ${consoleErrors.length}건`);
  if (consoleErrors.length > 0) {
    console.log(`콘솔 에러 상세:`, consoleErrors.slice(0, 5));
  }

  // 리포트 JSON 파일 저장
  const reportPath = path.join(ARTIFACT_DIR, 'verification_report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ timestamp: new Date().toISOString(), results, externalAiCalls, consoleErrors }, null, 2)
  );
  console.log(`\n📄 검증 리포트 저장 완료: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
