import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180, height: 180,
        background: 'linear-gradient(135deg, #0d1f45 0%, #1e3a6e 100%)',
        borderRadius: 38,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}
    >
      {/* Keys container */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', position: 'relative' }}>
        {/* White keys */}
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: 24, height: 88,
            background: '#ffffff',
            borderRadius: '0 0 5px 5px',
            border: '1px solid rgba(0,0,0,0.15)',
          }} />
        ))}
        {/* Black keys */}
        {[0,1,3].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: pos === 0 ? 17 : pos === 1 ? 46 : 104,
            top: 0,
            width: 16, height: 54,
            background: '#060f23',
            borderRadius: '0 0 4px 4px',
            zIndex: 2,
          }} />
        ))}
      </div>
      {/* Blue accent bar */}
      <div style={{
        width: 132, height: 5,
        background: '#3b82f6',
        borderRadius: 3,
        marginTop: 14,
      }} />
    </div>,
    { ...size }
  );
}
