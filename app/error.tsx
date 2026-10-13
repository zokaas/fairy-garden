'use client';
import { useEffect } from 'react';

const KEY = 'fg_err_reload';

/** Virheraja: jos sivu rikkoutuu esim. uuden version julkaisun jälkeen, yritetään kerran päivittää sivu itsestään. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const stale = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported|Importing a module script failed|Unexpected token '<'/i.test(`${error.name} ${error.message}`);
    try {
      const last = Number(sessionStorage.getItem(KEY) ?? 0);
      if (stale && Date.now() - last > 15_000) {
        sessionStorage.setItem(KEY, String(Date.now()));
        location.reload();
      }
    } catch { /* ei tallennusta */ }
  }, [error]);
  return (
    <section className="card" style={{ textAlign: 'center', marginTop: 60 }}>
      <h2>Hups, jokin meni pieleen 🧚</h2>
      <p className="muted">Sivu ei latautunut oikein. Yleensä se korjautuu päivittämällä sivun.</p>
      <button className="btn" onClick={() => location.reload()}>Päivitä sivu</button>
      <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => reset()}>Yritä uudelleen</button>
      {error.digest && <p className="muted" style={{ fontSize: '.7rem' }}>Koodi: {error.digest}</p>}
    </section>
  );
}
