import 'server-only';
import { db } from './db';
import { DEMO } from './demo';
import { helsinkiDay, dayBefore } from './garden';
import { unstable_cache } from 'next/cache';
import { DATA_TAG } from './cache';

export const MANUAL_STEPS_MAX = 40_000;

/** Käsin kirjatut askelpäivät avaimella "keijun id|päivä". Tyhjä, jos saraketta ei ole vielä luotu (migraatio 008). */
const fetchManual = unstable_cache(
  async (): Promise<string[]> => {
    const { data, error } = await db().from('steps').select('fairy_id, day').eq('manual', true);
    if (error) throw new Error('db');
    return (data ?? []).map((r) => `${r.fairy_id}|${r.day}`);
  },
  ['fg-manual-v1'],
  { revalidate: 30, tags: [DATA_TAG] },
);

export async function loadManualDays(): Promise<Set<string>> {
  if (DEMO) return new Set([`f0|${dayBefore(helsinkiDay())}`, `f3|${helsinkiDay()}`]);
  try {
    return new Set(await fetchManual());
  } catch {
    return new Set();
  }
}
