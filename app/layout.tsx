import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import ResumeRefresh from '@/components/ResumeRefresh';
import AutoSync from '@/components/AutoSync';
import Motion from '@/components/Motion';

const sans = Inter({ subsets: ['latin'], variable: '--sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Fairy Garden Askeleet',
  description: 'Kävele kukkaan, kasva keijuksi ja ole reippain keiju',
  icons: { icon: '/icon-192.png', apple: '/icon-180.png' },
  appleWebApp: {
    capable: true,
    title: 'Fairy Garden',
    statusBarStyle: 'default',
    startupImage: [
      [1125, 2436, 375, 812],
      [1170, 2532, 390, 844],
      [1179, 2556, 393, 852],
      [1284, 2778, 428, 926],
      [1290, 2796, 430, 932],
    ].map(([w, h, dw, dh]) => ({ url: `/splash-${w}x${h}.png`, media: `(device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: 3)` })),
  },
};
export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#fafafa' }, { media: '(prefers-color-scheme: dark)', color: '#09090b' }],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const member = !!cookies().get('fg_token');
  return (
    <html lang="fi" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('fg_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}" }} />
      </head>
      <body>
        <main className={member ? 'withnav' : ''}>{children}</main>
        {member && <BottomNav />}
        {member && <ResumeRefresh />}
        {member && <AutoSync />}
        <Motion />
      </body>
    </html>
  );
}
