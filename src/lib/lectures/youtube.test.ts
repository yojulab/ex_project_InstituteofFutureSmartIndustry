import { extractYouTubeVideoId, getYouTubeThumbnailUrl, getYouTubeEmbedUrl } from './youtube';

function runTests() {
  console.log('Testing YouTube Video ID Normalization (LAC-07)...');

  const validCases = [
    { input: 'dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', desc: '11자리 단순 ID' },
    { input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', desc: '표준 watch?v= URL' },
    { input: 'http://youtube.com/watch?v=dQw4w9WgXcQ&t=120s', expected: 'dQw4w9WgXcQ', desc: '추가 파라미터가 붙은 watch URL' },
    { input: 'https://youtu.be/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', desc: '축약 youtu.be URL' },
    { input: 'https://youtu.be/dQw4w9WgXcQ?si=abcdefghijk', expected: 'dQw4w9WgXcQ', desc: '트래킹 파라미터가 붙은 youtu.be URL' },
    { input: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', desc: '임베드 /embed/ URL' },
    { input: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', desc: '쇼츠 /shorts/ URL' },
    { input: 'https://www.youtube.com/live/dQw4w9WgXcQ?feature=share', expected: 'dQw4w9WgXcQ', desc: '라이브 /live/ URL' },
    { input: 'www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ', desc: '프로토콜 없는 www URL' },
  ];

  const invalidCases = [
    { input: '', desc: '빈 문자열' },
    { input: '   ', desc: '공백 문자열' },
    { input: 'not_an_id', desc: '짧은 문자열' },
    { input: 'toolongvideoidstring123', desc: '너무 긴 문자열' },
    { input: 'https://vimeo.com/12345678', desc: '타 비디오 플랫폼 URL' },
    { input: 'https://www.youtube.com/user/channel', desc: '유튜브 채널 URL' },
    { input: 'https://malicious.com/?v=dQw4w9WgXcQ', desc: '비인가 호스트 URL' },
    { input: '<script>alert(1)</script>', desc: 'XSS 시도 문자열' },
  ];

  let passedCount = 0;

  for (const c of validCases) {
    const res = extractYouTubeVideoId(c.input);
    if (res === c.expected) {
      console.log(`  ✅ [PASS] ${c.desc}: ${res}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${c.desc}: expected ${c.expected}, got ${res}`);
    }
  }

  for (const c of invalidCases) {
    const res = extractYouTubeVideoId(c.input);
    if (res === null) {
      console.log(`  ✅ [PASS] 무효 입력 거부 (${c.desc}): null`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] 무효 입력 허용됨 (${c.desc}): got ${res}`);
    }
  }

  const thumb = getYouTubeThumbnailUrl('dQw4w9WgXcQ');
  if (thumb === 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg') {
    console.log(`  ✅ [PASS] 썸네일 URL 생성: ${thumb}`);
    passedCount++;
  }

  const embed = getYouTubeEmbedUrl('dQw4w9WgXcQ', { autoplay: true, startSeconds: 45 });
  if (embed.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ') && embed.includes('autoplay=1') && embed.includes('start=45')) {
    console.log(`  ✅ [PASS] 임베드 URL 생성 (nocookie & 파라미터): ${embed}`);
    passedCount++;
  }

  console.log(`\n결과: ${passedCount} / ${validCases.length + invalidCases.length + 2} 테스트 통과`);
  if (passedCount !== validCases.length + invalidCases.length + 2) {
    process.exit(1);
  }
}

runTests();
