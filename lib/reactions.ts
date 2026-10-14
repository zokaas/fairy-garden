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

export type Comment = { id: string; from_id: string; to_id: string; target: string; body: string; created_at: string };

/** Kommentit vanhimmasta uusimpaan. Tyhjä lista, jos taulua ei ole vielä luotu (migraatio 008). */
export async function loadComments(): Promise<Comment[]> {
  if (DEMO) return [{ id: 'c0', from_id: 'f1', to_id: 'f0', target: 'w:w0', body: 'Hyvä! Kimallusta päivääsi ✨', created_at: new Date().toISOString() }];
  const { data } = await db().from('comments').select('id, from_id, to_id, target, body, created_at').order('created_at');
  return (data ?? []) as Comment[];
}
