'use client';
import { useEffect, useState } from 'react';

const KEY_ON = 'fg_autosync';
const KEY_LAST = 'fg_autosync_last';
const GAP = 2 * 60 * 60 * 1000;

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ei tallennusta */ } };

/**
 * Käynnistää Komennon automaattisesti, kun kotivalikon sovellus avataan tai tuodaan takaisin etualalle
 * (puhelin on silloin auki, joten Terveys-data on luettavissa). Enintään kerran 2 h välein, vain kotivalikon sovelluksessa.
 * Päälle menee itsestään, kun keijulla on jo askeleita (ks. AutoSyncEnable), ja sen voi kytkeä pois Synkka-ohjeesta.
 */
export default function AutoSync() {
  useEffect(() => {
    const standalone = (navigator as unknown as { standalone?: boolean }).standalone === true || matchMedia('(display-mode: standalone)').matches;
    if (!standalone) return;
    const q = new URLSearchParams(location.search);
    if (q.has('synkattu')) set(KEY_LAST, String(Date.now()));

    const run = () => {
      if (get(KEY_ON) !== '1') return;
      if (Date.now() - Number(get(KEY_LAST) ?? 0) < GAP) return;
      set(KEY_LAST, String(Date.now()));
      // Ilman paluulinkkiä: paluulinkki avaisi Safarin eikä sovellusta. Paluu sovellukseen onnistuu iOS:n yläkulman nuolella.
      location.href = 'shortcuts://run-shortcut?name=Fairy%20Garden';
    };
    run();
    const onVisible = () => { if (document.visibilityState === 'visible') run(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);
  return null;
}

/** Kytkee automaattisen synkan päälle, kun keijulla on jo askeleita (oikotie on silloin asennettu). Käyttäjän oma valinta (pois) säilyy. */
export function AutoSyncEnable({ hasSteps }: { hasSteps: boolean }) {
  useEffect(() => {
    if (hasSteps && get(KEY_ON) === null) set(KEY_ON, '1');
  }, [hasSteps]);
  return null;
}

/** Kytkin /shortcut-sivulle. */
export function AutoSyncToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(get(KEY_ON) === '1'), []);
  return (
    <label className="autosync">
      <input type="checkbox" checked={on} onChange={(e) => { setOn(e.target.checked); set(KEY_ON, e.target.checked ? '1' : '0'); }} />
      <span>Synkkaa automaattisesti, kun avaan sovelluksen (enintään 2 h välein)</span>
    </label>
  );
}
