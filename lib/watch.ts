import type { Fairy } from './data';
import { dayBefore, helsinkiDay } from './garden.ts';

export type WatchLevel = 'ok' | 'warn' | 'alert' | 'never';
export type WatchRow = { fairy: Fairy; missing: string[]; level: WatchLevel };

const ORDER: Record<WatchLevel, number> = { never: 0, alert: 1, warn: 2, ok: 3 };

/**
 * Synkkavahti: kenen askeleet puuttuvat viimeisiltä 3 päivältä (eilen, toissapäivänä, sitä edellinen).
 * Vain päivät oman ensimmäisen kirjauksen jälkeen lasketaan puuttuviksi.
 * ok = ei puutu mitään, warn = 1 päivä puuttuu, alert = 2+ päivää puuttuu, never = ei yhtään kirjausta.
 */
export function syncWatch(board: Fairy[], steps: { fairy_id: string; day: string; steps: number }[], today = helsinkiDay()): WatchRow[] {
  const days: string[] = [];
  let d = today;
  for (let i = 0; i < 3; i++) { d = dayBefore(d); days.push(d); }
  const rows = board.map((fairy) => {
    const mine = steps.filter((r) => r.fairy_id === fairy.id && r.steps > 0);
    if (mine.length === 0) return { fairy, missing: [] as string[], level: 'never' as WatchLevel };
    const first = mine.map((r) => r.day).sort()[0];
    const have = new Set(mine.map((r) => r.day));
    const missing = days.filter((x) => x >= first && !have.has(x)).reverse();
    return { fairy, missing, level: (missing.length === 0 ? 'ok' : missing.length === 1 ? 'warn' : 'alert') as WatchLevel };
  });
  return rows.sort((a, b) => ORDER[a.level] - ORDER[b.level] || b.missing.length - a.missing.length || a.fairy.name.localeCompare(b.fairy.name));
}
