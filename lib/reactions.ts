import 'server-only';
import { db } from './db';
import { DEMO } from './demo';

export type Reaction = { from_id: string; to_id: string; target: string };

export const workoutTarget = (id: string) => `w:${id}`;
export const stepsTarget = (fairyId: string, day: string) => `s:${fairyId}:${day}`;

/** Kaikki reaktiot. Palauttaa tyhjän listan, jos taulua ei ole vielä luotu (migraatio 007). */
export async function loadReactions(): Promise<Reaction[]> {
  if (DEMO) return [{ from_id: 'f1', to_id: 'f0', target: 'w:w0' }];
  const { data } = await db().from('reactions').select('from_id, to_id, target');
  return (data ?? []) as Reaction[];
}
