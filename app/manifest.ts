import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Piano — 30 min par jour',
    short_name: 'Piano',
    description: 'Suivi de pratique quotidienne du piano',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0d1f45',
    theme_color: '#3b82f6',
    categories: ['productivity', 'music', 'education'],
    icons: [
      {
        src: '/favicon/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
