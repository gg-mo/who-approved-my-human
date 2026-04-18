import { ImageResponse } from 'next/og';

export const alt = 'Agent Tea — Your AI has tea about you.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 96px',
          background:
            'radial-gradient(900px 500px at 15% 10%, rgba(34,211,238,0.25), transparent 65%), radial-gradient(900px 500px at 85% 90%, rgba(139,92,246,0.28), transparent 70%), linear-gradient(160deg, #0a1a2c 0%, #17214a 48%, #2a1848 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#67e8f9',
              marginBottom: 28,
            }}
          >
            Agent Tea
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Your AI has tea about you.
          </div>
          <div style={{ fontSize: 30, color: '#cbd5e1', marginTop: 28, lineHeight: 1.35 }}>
            Find out how your AI reads your style — in under two minutes.
          </div>
        </div>
        <svg width="360" height="360" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M20 4 C 17 9, 23 12, 20 17" />
            <path d="M32 2 C 29 7, 35 10, 32 15" />
            <path d="M44 4 C 41 9, 47 12, 44 17" />
          </g>
          <path d="M48 28 C 62 28, 62 48, 48 48" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
          <path d="M48 28 C 62 28, 62 48, 48 48" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M5 22 Q 32 78 59 22 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="32" cy="22" rx="25" ry="4.5" fill="#4ade80" stroke="#0f172a" strokeWidth="2" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
