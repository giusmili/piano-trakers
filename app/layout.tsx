import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Piano — 30 min par jour',
  description: 'Suivi de pratique quotidienne du piano',
  icons: {
    icon: [
      { url: '/favicon/icon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (cookies().get('piano_theme')?.value ?? 'light') as 'light' | 'dark';

  return (
    <html lang="fr" data-theme={theme}>
      <head>
        {/* Détection dark mode avant le premier paint (zéro flash) */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var c=document.cookie.match(/piano_theme=([^;]+)/);
            if(!c&&window.matchMedia('(prefers-color-scheme:dark)').matches){
              document.documentElement.dataset.theme='dark';
            }
          })();
        `}} />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
