import { ImageResponse } from 'next/og';

import { buildProfileCopy } from '@/lib/results/profile-copy';
import {
  buildShareCardHighlights,
  buildShareCardText,
  parseShareCardMode,
} from '@/lib/results/share-card';
import { getSessionResultById } from '@/lib/server/session-service';

type RouteContext = {
  params: { sessionId: string } | Promise<{ sessionId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { sessionId } = await Promise.resolve(context.params);
  const result = await getSessionResultById(sessionId);

  if (!result) {
    return new Response('Result not found', { status: 404 });
  }

  const url = new URL(request.url);
  const mode = parseShareCardMode(url.searchParams.get('mode') ?? undefined);

  const profile = buildProfileCopy({
    typeCode: result.typeCode,
    breakdown: result.dimensionBreakdown,
    strongestSignals: result.strongestSignals,
    tieFlags: result.tieFlags,
    mode,
  });

  const highlights = buildShareCardHighlights({
    mode,
    breakdown: result.dimensionBreakdown,
  });

  const summary = buildShareCardText({
    mode,
    typeCode: result.typeCode,
    nickname: profile.nickname,
    highlights,
  });

  const palette =
    mode === 'intrusive'
      ? {
          bg: '#1f1020',
          panel: '#2f1832',
          accent: '#fb923c',
          text: '#fff7ed',
          subtext: '#fed7aa',
        }
      : {
          bg: '#0b1224',
          panel: '#111b34',
          accent: '#22d3ee',
          text: '#f8fafc',
          subtext: '#bae6fd',
        };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.panel} 85%)`,
          color: palette.text,
          padding: '44px',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${palette.accent}`,
              color: palette.subtext,
              fontSize: '24px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span>Agent Tea</span>
          </div>
          <div style={{ fontSize: '68px' }}>🦞</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '88px', fontWeight: 900, letterSpacing: '-0.04em' }}>{result.typeCode}</div>
          <div style={{ fontSize: '46px', fontWeight: 700, color: palette.subtext }}>{profile.nickname}</div>
          <div style={{ fontSize: '26px', lineHeight: 1.35 }}>{summary}</div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          {highlights.map((highlight) => (
            <div
              key={highlight}
              style={{
                display: 'flex',
                borderRadius: '14px',
                padding: '12px 18px',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.08)',
                fontSize: '24px',
                color: palette.text,
              }}
            >
              {highlight}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
