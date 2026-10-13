'use client';
import { useState } from 'react';

/** Synkkausnappi: avaa Komennot-oikotien, joka lukee askeleet Terveydestä. */
export default function SyncButton({ site }: { site: string }) {
  const [busy, setBusy] = useState(false);
  const back = encodeURIComponent(`${site}/?synkattu=1`);
  const href = `shortcuts://x-callback-url/run-shortcut?name=Fairy%20Garden&x-success=${back}&x-cancel=${back}&x-error=${back}`;
  return (
    <a className={`sync-btn ${busy ? 'busy' : ''}`} href={href} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 6000); }}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="sync-ic">
        <path d="M20 11a8 8 0 0 0-14.5-4.4M4 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14.5 4.4M20 20v-4h-4" />
      </svg>
      <span>{busy ? 'Avataan Komennot…' : 'Synkkaa askeleet'}</span>
    </a>
  );
}
