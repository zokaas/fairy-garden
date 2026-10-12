'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconFlag, IconGarden, IconLog, IconStats, IconTrophy } from './Icons';

const TABS = [
  { href: '/', Icon: IconGarden, label: 'Puutarha' },
  { href: '/kirjaa', Icon: IconLog, label: 'Kirjaa' },
  { href: '/karki', Icon: IconTrophy, label: 'Kärki' },
  { href: '/tilastot', Icon: IconStats, label: 'Tilastot' },
  { href: '/kisa', Icon: IconFlag, label: 'Kisa' },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Päävalikko">
      {TABS.map(({ href, Icon, label }) => (
        <Link key={href} href={href} className={path === href || (href !== '/' && path.startsWith(href)) ? 'on' : ''}>
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}
