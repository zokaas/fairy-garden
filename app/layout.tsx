import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Fairy Garden Askeleet',
  description: 'Kävele kukkaan, keijuksi ja Fairy Gardeniin 28.11.2026',
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
export const viewport: Viewport = { themeColor: '#f8d7ec', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const member = !!cookies().get('fg_token');
  return (
    <html lang="fi">
      <body>
        <div className="sparkles" aria-hidden="true">
          {['🦋', '✨', '🌸', '🍄', '✨', '🦋'].map((e, i) => (
            <span key={i} style={{ left: `${8 + i * 17}%`, animationDelay: `${i * 2.3}s` }}>{e}</span>
          ))}
        </div>
        <main className={member ? 'withnav' : ''}>{children}</main>
        {member && <BottomNav />}
      </body>
    </html>
  );
}
