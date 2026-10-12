'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', icon: '🌸', label: 'Puutarha' },
  { href: '/kirjaa', icon: '👟', label: 'Kirjaa' },
  { href: '/karki', icon: '🏆', label: 'Kärki' },
  { href: '/tilastot', icon: '📊', label: 'Tilastot' },
  { href: '/kisa', icon: '🏁', label: 'Kisa' },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={path === t.href || (t.href !== '/' && path.startsWith(t.href)) ? 'on' : ''}>
          <span>{t.icon}</span>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
