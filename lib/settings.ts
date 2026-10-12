import 'server-only';
import { db } from './db';
import { DEMO } from './demo';

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  if (DEMO) return {};
  const { data } = await db().from('settings').select('key, value').in('key', keys);
  return Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value as string]));
}
