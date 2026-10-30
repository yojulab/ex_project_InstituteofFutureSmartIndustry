/**
 * 미래스마트산업진흥원 온라인 강좌 시스템 — 유튜브 URL/ID 정규화 유틸리티
 * 
 * [요구사항 LAC-07]
 * watch?v=, youtu.be/, /embed/, /shorts/, /live/, 단순 Video ID 형태를
 * 모두 정규식으로 안전하게 판별하여 순수 11자리 YouTube Video ID를 추출합니다.
 */

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function extractYouTubeVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. 순수 11자리 Video ID 인지 확인
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  // 2. URL 형태 파싱
  try {
    // 프로토콜이 없는 경우(예: youtube.com/watch?v=...)를 위해 보정
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();

    // 2-1. youtu.be/xxxx 형태
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      if (YOUTUBE_ID_REGEX.test(id)) {
        return id;
      }
    }

    // 2-2. youtube.com 또는 m.youtube.com 또는 www.youtube-nocookie.com
    if (
      host === 'youtube.com' ||
      host.endsWith('.youtube.com') ||
      host === 'youtube-nocookie.com' ||
      host.endsWith('.youtube-nocookie.com')
    ) {
      // 2-2-1. /watch?v=xxxx
      const v = url.searchParams.get('v');
      if (v && YOUTUBE_ID_REGEX.test(v)) {
        return v;
      }

      // 2-2-2. /embed/xxxx, /shorts/xxxx, /live/xxxx, /v/xxxx
      const pathSegments = url.pathname.split('/').filter(Boolean);
      if (pathSegments.length >= 2) {
        const prefix = pathSegments[0].toLowerCase();
        if (['embed', 'shorts', 'live', 'v'].includes(prefix)) {
          const candidate = pathSegments[1];
          if (YOUTUBE_ID_REGEX.test(candidate)) {
            return candidate;
          }
        }
      }
    }
  } catch {
    // URL 생성 실패 시 정규식 패턴 fallback 검사
  }

  // 3. 정규식 fallback 매칭 (지저분한 파라미터나 텍스트 속 추출)
  const fallbackMatch = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i
  );
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1];
  }

  return null;
}

/**
 * YouTube Video ID로부터 기본 고화질 썸네일 URL을 반환합니다.
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * YouTube 안전 임베드(youtube-nocookie.com) URL을 생성합니다.
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options?: {
    autoplay?: boolean;
    startSeconds?: number;
  }
): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : '',
  });

  if (options?.autoplay) {
    params.set('autoplay', '1');
  }
  if (options?.startSeconds && options.startSeconds > 0) {
    params.set('start', Math.floor(options.startSeconds).toString());
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

