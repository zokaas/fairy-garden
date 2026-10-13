'use client';
import { useEffect } from 'react';

const KEY = 'fg_err_reload';

/** Viimeinen suoja, jos koko sovelluksen runko kaatuu. */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    try {
      const last = Number(sessionStorage.getItem(KEY) ?? 0);
      if (Date.now() - last > 15_000) {
        sessionStorage.setItem(KEY, String(Date.now()));
        location.reload();
      }
    } catch { /* ei tallennusta */ }
  }, [error]);
  return (
    <html lang="fi">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fafafa', color: '#09090b', display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24, textAlign: 'center' }}>
        <div>
          <h2>Hups, jokin meni pieleen 🧚</h2>
          <p style={{ color: '#52525b' }}>Päivitä sivu, niin kaiken pitäisi toimia.</p>
          <button onClick={() => location.reload()} style={{ padding: '12px 24px', borderRadius: 999, border: 0, background: '#09090b', color: '#fff', fontSize: 16 }}>Päivitä sivu</button>
        </div>
      </body>
    </html>
  );
}
