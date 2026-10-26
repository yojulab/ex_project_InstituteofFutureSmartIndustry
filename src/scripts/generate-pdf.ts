import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function generatePublicArticlesPdf() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const mdPath = path.resolve(process.cwd(), 'docs/미래스마트산업진흥원 정관.md');
  const mdContent = fs.readFileSync(mdPath, 'utf-8');

  // 별지 설립회원명부 및 서명란 제거 (AC-11)
  const parts = mdContent.split('---');
  const publicBody = parts[1] || parts[0];

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>미래스마트산업진흥원 정관 (공개용)</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
      line-height: 1.8;
      padding: 40px;
      color: #1e293b;
      font-size: 13px;
    }
    .header-box {
      border: 1px solid #cbd5e1;
      background-color: #f8fafc;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 30px;
      font-size: 11px;
      color: #64748b;
    }
    h1 {
      text-align: center;
      font-size: 26px;
      margin-bottom: 24px;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    h2 {
      font-size: 16px;
      margin-top: 32px;
      margin-bottom: 12px;
      color: #0284c7;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
    }
    h3 {
      font-size: 14px;
      margin-top: 18px;
      margin-bottom: 6px;
      color: #334155;
    }
    p {
      margin: 6px 0;
      text-align: justify;
      word-break: keep-all;
    }
    .footer-box {
      text-align: center;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <strong>[공개용 공람 문서]</strong> 본 문서는 미래스마트산업진흥원 정관의 대외 공개용 사본입니다. 개인정보 보호법 준수를 위해 발기인·회원 명부 및 서명란은 제외되어 있습니다.
  </div>
  <h1>미래스마트산업진흥원 정관</h1>
  <div>
    ${publicBody
      .replace(/### (.*?)\n/g, '<h3>$1</h3>')
      .replace(/## (.*?)\n/g, '<h2>$1</h2>')
      .split('\n\n')
      .map((p) => `<p>${p.trim()}</p>`)
      .join('')}
  </div>
  <div class="footer-box">
    <strong>미래스마트산업진흥원 (Institute of Future Smart Industry)</strong><br>
    서울특별시 광진구 자양로19길 50
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });

  const outDir = path.resolve(process.cwd(), 'public/docs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'articles-public.pdf');
  await page.pdf({
    path: outPath,
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
    printBackground: true,
  });

  await browser.close();
  console.log('[Generate PDF] Successfully created:', outPath);
}

generatePublicArticlesPdf().catch((err) => {
  console.error('[Generate PDF] Error:', err);
  process.exit(1);
});
