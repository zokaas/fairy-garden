import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Fairy Garden Askeleet',
  description: 'Kävele kukkaan, keijuksi ja Fairy Gardeniin 28.11.2026',
  appleWebApp: { capable: true, title: 'Fairy Garden', statusBarStyle: 'default' },
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
