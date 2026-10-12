import 'server-only';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { helsinkiDay, points, streak } from '@/lib/garden';

export type Fairy = {
  id: string;
  name: string;
  mine: boolean;
  totalSteps: number;
  mins: number;
  today: number;
  pts: number;
  streak: number;
  hasSteps: boolean;
  lastSync: string | null;
};

export async function loadGarden() {
  const token = cookies().get('fg_token')?.value;
  const supabase = db();
  const [{ data: fairies }, { data: steps }, { data: workouts }] = await Promise.all([
    supabase.from('fairies').select('id, name, token'),
    supabase.from('steps').select('fairy_id, day, steps, updated_at'),
    supabase.from('workouts').select('fairy_id, minutes'),
  ]);
  const today = helsinkiDay();
  const board: Fairy[] = (fairies ?? [])
    .map((f) => {
      const st = (steps ?? []).filter((s) => s.fairy_id === f.id);
      const totalSteps = st.reduce((a, s) => a + s.steps, 0);
      const mins = (workouts ?? []).filter((w) => w.fairy_id === f.id).reduce((a, w) => a + w.minutes, 0);
      const last = st.reduce<string | null>((a, s) => (!a || s.updated_at > a ? s.updated_at : a), null);
      return {
        id: f.id,
        name: f.name,
        mine: !!token && f.token === token,
        totalSteps,
        mins,
        today: st.find((s) => s.day === today)?.steps ?? 0,
        pts: points(totalSteps, mins),
        streak: streak(st, today),
        hasSteps: st.length > 0,
        lastSync: last,
      };
    })
    .sort((a, b) => b.pts - a.pts);
  return { board, me: board.find((b) => b.mine) ?? null, myRank: board.findIndex((b) => b.mine) + 1 };
}
