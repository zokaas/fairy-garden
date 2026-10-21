'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  // iOS-sovelluksessa asettelunäkymä voi olla matalampi kuin näkyvä alue: silloin palkki jää keskelle. Siirretään se näkyvän alueen alareunaan.
  const [shift, setShift] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const upd = () => {
      const diff = Math.round(vv.height + vv.offsetTop - window.innerHeight);
      setShift(diff > 40 ? diff : 0);
    };
    upd();
    vv.addEventListener('resize', upd);
    vv.addEventListener('scroll', upd);
    window.addEventListener('resize', upd);
    return () => {
      vv.removeEventListener('resize', upd);
      vv.removeEventListener('scroll', upd);
      window.removeEventListener('resize', upd);
    };
  }, []);
  const idx = Math.max(0, TABS.findIndex((t) => path === t.href || (t.href !== '/' && path.startsWith(t.href))));
  return (
    <nav className="tabs" aria-label="Päävalikko" style={shift ? { transform: `translateY(${shift}px)` } : undefined}>
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
