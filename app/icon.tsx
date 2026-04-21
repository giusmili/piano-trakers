import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32, height: 32,
        background: '#0d1f45',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 4,
        gap: 1,
      }}
    >
      {/* White keys */}
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          width: 5, height: 16,
          background: '#ffffff',
          borderRadius: 1,
        }} />
      ))}
      {/* Blue accent dot */}
      <div style={{
        position: 'absolute',
        top: 5, left: 5,
        width: 22, height: 2,
        background: '#3b82f6',
        borderRadius: 1,
      }} />
    </div>,
    { ...size }
  );
}
