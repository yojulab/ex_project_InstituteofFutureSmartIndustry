import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = '미래스마트산업진흥원 — 대한민국 제조 AI 및 스마트산업 혁신 선도';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
          fontFamily: 'sans-serif',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 900,
              color: '#ffffff',
              marginRight: '20px',
            }}
          >
            FSI
          </div>
          <span
            style={{
              fontSize: '28px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: '#38bdf8',
              fontWeight: 700,
            }}
          >
            Institute of Future Smart Industry
          </span>
        </div>

        <div
          style={{
            fontSize: '54px',
            fontWeight: 900,
            lineHeight: 1.25,
            marginBottom: '24px',
            color: '#f8fafc',
            maxWidth: '1000px',
          }}
        >
          미래스마트산업진흥원
        </div>

        <div
          style={{
            fontSize: '26px',
            lineHeight: 1.4,
            color: '#94a3b8',
            maxWidth: '900px',
          }}
        >
          대한민국 제조 AI 및 스마트산업 혁신 선도 — DX 실증, 스마트공장 보급, 인재양성
        </div>

        <div
          style={{
            marginTop: '48px',
            display: 'flex',
            gap: '16px',
          }}
        >
          {['제조 AI 융합', '스마트공장 DX', '디지털 인재양성', '산업 정책연구'].map((item) => (
            <div
              key={item}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '9999px',
                padding: '10px 24px',
                fontSize: '18px',
                fontWeight: 600,
                color: '#e0f2fe',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
