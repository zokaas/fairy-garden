import 'server-only';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { bestStreak, dayBefore, helsinkiDay, points, stageFor, streak } from '@/lib/garden';
import { BADGES } from '@/lib/badges';

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
  avatarEmoji: string | null;
  avatarBg: string | null;
  avatarPath: string | null;
  avatarVer: string | null;
  avatarAcc: string | null;
  stageIdx: number;
  yesterday: number;
  badges: string[];
};

export async function loadGarden() {
  const token = cookies().get('fg_token')?.value;
  const supabase = db();
  const [{ data: fairies }, { data: steps }, { data: workouts }] = await Promise.all([
    supabase.from('fairies').select('id, name, token, avatar_emoji, avatar_bg, avatar_path, avatar_acc'),
    supabase.from('steps').select('fairy_id, day, steps, updated_at'),
    supabase.from('workouts').select('fairy_id, minutes'),
  ]);
  const today = helsinkiDay();
  const board: Fairy[] = (fairies ?? [])
    .map((f) => {
      const st = (steps ?? []).filter((s) => s.fairy_id === f.id);
      const totalSteps = st.reduce((a, s) => a + s.steps, 0);
      const ws = (workouts ?? []).filter((w) => w.fairy_id === f.id);
      const mins = ws.reduce((a, w) => a + w.minutes, 0);
      const last = st.reduce<string | null>((a, s) => (!a || s.updated_at > a ? s.updated_at : a), null);
      const pts = points(totalSteps, mins);
      const stageIdx = stageFor(pts).idx;
      const stats = { totalSteps, bestDay: Math.max(0, ...st.map((x) => x.steps)), bestStreak: bestStreak(st), workouts: ws.length, mins, hasSteps: st.length > 0, stageIdx };
      return {
        id: f.id,
        name: f.name,
        mine: !!token && f.token === token,
        totalSteps,
        mins,
        today: st.find((s) => s.day === today)?.steps ?? 0,
        pts,
        streak: streak(st, today),
        hasSteps: st.length > 0,
        lastSync: last,
        avatarEmoji: f.avatar_emoji,
        avatarBg: f.avatar_bg,
        avatarPath: f.avatar_path,
        avatarVer: f.avatar_path,
        avatarAcc: f.avatar_acc,
        stageIdx,
        yesterday: st.find((x) => x.day === dayBefore(today))?.steps ?? 0,
        badges: BADGES.filter((b) => b.test(stats)).map((b) => b.id),
      };
    })
    .sort((a, b) => b.pts - a.pts);
  return { board, me: board.find((b) => b.mine) ?? null, myRank: board.findIndex((b) => b.mine) + 1 };
}
