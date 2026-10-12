import type { Metadata, Viewport } from 'next';
import { Figtree, Fraunces } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import ResumeRefresh from '@/components/ResumeRefresh';

const serif = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--serif', display: 'swap' });
const sans = Figtree({ subsets: ['latin'], variable: '--sans', display: 'swap' });

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
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f7efdd' }, { media: '(prefers-color-scheme: dark)', color: '#1b1030' }],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const member = !!cookies().get('fg_token');
  return (
    <html lang="fi" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <div className="dust" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 8) % 96}%`, animationDelay: `${i * 1.7}s`, animationDuration: `${14 + (i % 4) * 4}s` }} />)}
        </div>
        <main className={member ? 'withnav' : ''}>{children}</main>
        {member && <BottomNav />}
        {member && <ResumeRefresh />}
      </body>
    </html>
  );
}
