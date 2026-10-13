'use client';
import { useEffect, useState } from 'react';
import { enablePush, isStandalone, pushSupported, subscribeNow } from './pushClient';

const SNOOZE = 'fg_push_snooze';
const DAY = 24 * 60 * 60 * 1000;
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ei tallennusta */ } };

/**
 * Kysyy ilmoitusten päälle laittoa heti, kun kotivalikon sovellus avataan.
 * iOS vaatii napautuksen ennen järjestelmän lupakyselyä, joten näytämme oman kehotteen ja napautus avaa varsinaisen kyselyn.
 */
export default function PushPrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pushSupported() || !isStandalone()) return;
    if (Notification.permission === 'granted') {
      // Lupa on, mutta tilaus voi puuttua: yritetään hiljaa.
      navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then(async (reg) => {
        if (!(await reg.pushManager.getSubscription())) await subscribeNow();
      }).catch(() => undefined);
      return;
    }
    if (Notification.permission !== 'default') return;
    if (Date.now() < Number(get(SNOOZE) ?? 0)) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  async function on() {
    setBusy(true);
    setError('');
    try {
      const { permission } = await enablePush();
      if (permission === 'granted') return setOpen(false);
      if (permission === 'denied') setError('Ilmoitukset on estetty. Salli ne kohdassa Asetukset → Ilmoitukset → Fairy Garden.');
      else setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function later() {
    set(SNOOZE, String(Date.now() + DAY));
    setOpen(false);
  }

  return (
    <div className="pp-wrap" role="dialog" aria-label="Ilmoitukset">
      <div className="pp-card">
        <b>🔔 Laita ilmoitukset päälle</b>
        <p>Saat muistutuksen puuttuvista askelista ja maanantaisin viime viikon yhteenvedon.</p>
        {error && <p className="err">{error}</p>}
        <div className="pp-actions">
          <button type="button" className="btn" disabled={busy} onClick={on}>{busy ? 'Hetki…' : 'Laita päälle'}</button>
          <button type="button" className="btn ghost" onClick={later}>Ei nyt</button>
        </div>
      </div>
    </div>
  );
}
