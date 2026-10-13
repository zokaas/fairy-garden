'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Pieni profiilikuvake oikeassa yläkulmassa: avatar, ulkoasu ja ilmoitukset. */
export default function ProfileButton() {
  const path = usePathname();
  if (path.startsWith('/profiili')) return null;
  return (
    <Link href="/profiili" className="profile-btn" aria-label="Profiili ja asetukset">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8.5" r="3.6" />
        <path d="M4.8 20c.9-3.6 3.7-5.4 7.2-5.4s6.3 1.8 7.2 5.4" />
      </svg>
    </Link>
  );
}
