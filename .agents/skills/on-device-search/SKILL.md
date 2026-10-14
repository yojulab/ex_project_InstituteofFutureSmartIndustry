---
name: on-device-search
description: "On-Device 의미 검색 엔지니어링 및 외부 트래픽 0건 격리 검증 스킬. Web Worker 기반 Transformers.js 브라우저 로컬 임베딩 추론, 코사인 유사도 연산, MongoDB 키워드 검색과의 RRF 하이브리드 재순위화, 모델 다운로드 동의 모달 및 Playwright E2E 네트워크 격리 검증 구현 시 사용한다."
---

# On-Device 의미 검색 & 격리 검증 스킬

사용자의 검색 질의를 외부 서버로 전송하지 않고 브라우저 내부(Web Worker)에서 Transformers.js로 안전하게 처리하는 온디바이스 의미 검색 구현 및 무결성 검증 절차입니다.

---

## 1. 구현 핵심 절차

### 1-1. 사용자 동의 및 모델 로딩
- 검색 페이지(`/search`) 첫 진입 시 동의 모달 노출:
  - `"의미 검색 기능 사용을 위해 소형 모델(약 30~50MB)을 내려받으시겠습니까?"`
  - [동의]: Web Worker를 초기화하고 GCS CDN에서 양자화 모델 및 `search-index.json` 다운로드.
  - [거부]: 서버 키워드 검색 전용 모드로 즉시 폴백.

### 1-2. Web Worker 스레드 격리 (`search.worker.ts`)
```typescript
// Web Worker 내부
import { pipeline } from '@xenova/transformers';

let embedder: any = null;
let documentsIndex: { id: string; type: string; title: string; slug: string; vector: number[] }[] = [];

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  if (type === 'INIT') {
    embedder = await pipeline('feature-extraction', payload.modelPath, { quantized: true });
    documentsIndex = payload.indexData;
    self.postMessage({ type: 'INIT_DONE' });
  }
  
  if (type === 'SEARCH') {
    const { query, topK = 10 } = payload;
    // 1. 질의 임베딩 생성 (네트워크 호출 없음!)
    const output = await embedder(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data);
    
    // 2. 코사인 유사도 연산
    const results = documentsIndex.map(doc => {
      let dotProduct = 0;
      for (let i = 0; i < queryVector.length; i++) {
        dotProduct += (queryVector[i] as number) * doc.vector[i];
      }
      return { ...doc, score: dotProduct };
    });
    
    results.sort((a, b) => b.score - a.score);
    self.postMessage({ type: 'SEARCH_RESULTS', payload: results.slice(0, topK) });
  }
};
```

### 1-3. RRF 하이브리드 재순위화
- 서버 키워드 검색 결과(제목/본문 형태소 일치)와 On-Device 벡터 검색 결과를 RRF(Reciprocal Rank Fusion) 알고리즘으로 결합하여 단일 정렬 리스트로 렌더링.

---

## 2. 외부 트래픽 0건 Playwright E2E 검증 (WBS T-20)

온디바이스 의미 검색 기능이 사용자 질의를 외부로 유출하지 않는지 네트워크 패킷을 단언(Assert)합니다:

```typescript
// tests/on-device-search.spec.ts
import { test, expect } from '@playwright/test';

test('온디바이스 의미 검색 실행 시 외부 LLM API 트래픽이 0건이어야 한다', async ({ page }) => {
  const externalRequests: string[] = [];

  page.on('request', request => {
    const url = request.url();
    // 허용되지 않은 외부 AI/LLM 도메인 체크
    if (
      url.includes('api.openai.com') ||
      url.includes('anthropic') ||
      url.includes('generativelanguage.googleapis.com') ||
      url.includes('cohere')
    ) {
      externalRequests.push(url);
    }
  });

  await page.goto('/search');
  // 모델 다운로드 동의
  await page.click('button:has-text("동의")');
  await page.waitForSelector('[data-testid="search-ready"]');

  // 자연어 검색어 입력
  await page.fill('input[name="search"]', '스마트공장 제조 데이터 바우처 지원 내용');
  await page.click('button[type="submit"]');

  // 검색 결과 확인
  await expect(page.locator('.search-results')).toBeVisible();

  // 외부 LLM API 요청 발생 여부 검증 (반드시 0건)
  expect(externalRequests.length).toBe(0);
});
```
