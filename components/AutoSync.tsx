'use client';
import { useEffect, useState } from 'react';

const KEY_ON = 'fg_autosync';
const KEY_LAST = 'fg_autosync_last';
const GAP = 5 * 60 * 1000;

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ei tallennusta */ } };

/**
 * Käynnistää Komennon automaattisesti, kun kotivalikon sovellus avataan (puhelin on silloin auki, joten Terveys-data on luettavissa).
 * Päälle vasta kun käyttäjä on kerran synkannut napilla (paluu ?synkattu=1). Enintään kerran 5 min välein, vain kotivalikon sovelluksessa.
 */
export default function AutoSync() {
  useEffect(() => {
    const standalone = (navigator as unknown as { standalone?: boolean }).standalone === true || matchMedia('(display-mode: standalone)').matches;
    if (!standalone) return;
    const q = new URLSearchParams(location.search);
    if (q.has('synkattu')) {
      if (get(KEY_ON) === null) set(KEY_ON, '1');
      set(KEY_LAST, String(Date.now()));
      return;
    }
    if (get(KEY_ON) !== '1') return;
    if (Date.now() - Number(get(KEY_LAST) ?? 0) < GAP) return;
    set(KEY_LAST, String(Date.now()));
    const back = encodeURIComponent(`${location.origin}/?synkattu=1`);
    location.href = `shortcuts://x-callback-url/run-shortcut?name=Fairy%20Garden&x-success=${back}&x-cancel=${back}&x-error=${back}`;
  }, []);
  return null;
}

/** Kytkin /shortcut-sivulle. */
export function AutoSyncToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(get(KEY_ON) === '1'), []);
  return (
    <label className="autosync">
      <input type="checkbox" checked={on} onChange={(e) => { setOn(e.target.checked); set(KEY_ON, e.target.checked ? '1' : '0'); }} />
      <span>Synkkaa automaattisesti, kun avaan sovelluksen (enintään 5 min välein)</span>
    </label>
  );
}
