import 'server-only';
import { db } from './db';
import { DEMO } from './demo';
import { helsinkiDay, dayBefore } from './garden';

export const MANUAL_STEPS_MAX = 40_000;

/** Käsin kirjatut askelpäivät avaimella "keijun id|päivä". Tyhjä, jos saraketta ei ole vielä luotu (migraatio 008). */
export async function loadManualDays(): Promise<Set<string>> {
  if (DEMO) return new Set([`f0|${dayBefore(helsinkiDay())}`, `f3|${helsinkiDay()}`]);
  const { data, error } = await db().from('steps').select('fairy_id, day').eq('manual', true);
  if (error) return new Set();
  return new Set((data ?? []).map((r) => `${r.fairy_id}|${r.day}`));
}
