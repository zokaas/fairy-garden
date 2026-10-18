import 'server-only';
import { db } from './db';
import { DEMO } from './demo';
import { unstable_cache } from 'next/cache';
import { DATA_TAG } from './cache';

const fetchSettings = unstable_cache(
  async (keys: string[]): Promise<Record<string, string>> => {
    const { data, error } = await db().from('settings').select('key, value').in('key', keys);
    if (error) throw new Error('db');
    return Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value as string]));
  },
  ['fg-settings-v1'],
  { revalidate: 60, tags: [DATA_TAG] },
);

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  if (DEMO) return {};
  try {
    return await fetchSettings(keys);
  } catch {
    return {};
  }
}
