import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Υιοθέτησε ένα Δέντρο - Θέρμη Θεσσαλονίκης';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #22c55e 50%, #86efac 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Tree icon */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          {/* Tree crown */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            🌳
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            marginBottom: 16,
          }}
        >
          Υιοθέτησε ένα Δέντρο
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#dcfce7',
            textAlign: 'center',
            textShadow: '0 1px 5px rgba(0,0,0,0.15)',
            marginBottom: 40,
          }}
        >
          Θέρμη Θεσσαλονίκης
        </div>

        {/* Footer bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 32px',
            borderRadius: 40,
          }}
        >
          <div style={{ fontSize: 20, color: 'white' }}>
            📍 Διάλεξε · ✍️ Υιοθέτησε · 💧 Φρόντισε
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
