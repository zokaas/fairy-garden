import 'server-only';
import { db } from './db';

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const { data } = await db().from('settings').select('key, value').in('key', keys);
  return Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value as string]));
}
