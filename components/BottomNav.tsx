'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconCalendar, IconGarden, IconLog, IconStats, IconTrophy } from './Icons';

const TABS = [
  { href: '/', Icon: IconGarden, label: 'Puutarha' },
  { href: '/kirjaa', Icon: IconLog, label: 'Kirjaa' },
  { href: '/paivat', Icon: IconCalendar, label: 'Päivät' },
  { href: '/kisa', Icon: IconTrophy, label: 'Kisa' },
  { href: '/tilastot', Icon: IconStats, label: 'Tilastot' },
];

export default function BottomNav() {
  const path = usePathname();
  const idx = Math.max(0, TABS.findIndex((t) => path === t.href || (t.href !== '/' && path.startsWith(t.href))));
  return (
    <nav className="tabs" aria-label="Päävalikko">
      <i className="tab-ind" style={{ transform: `translateX(${idx * 100}%)` }} />
      {TABS.map(({ href, Icon, label }) => (
        <Link key={href} href={href} className={path === href || (href !== '/' && path.startsWith(href)) ? 'on' : ''}>
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}
