import 'server-only';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { DEMO, demoRows } from '@/lib/demo';
import { WEEK_BONUS, weekGoal, weeksDone, type WeekGoal } from '@/lib/weekly';
import { ACTIVE_DAY, DAILY_GOAL, bestStreak, kindOf, dayBefore, helsinkiDay, points, sportPoints, stageFor, stepPoints, streak, weekStart } from '@/lib/garden';
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
  minsToday: number;
  sportMins: number;
  creativeMins: number;
  sportToday: number;
  creativeToday: number;
  goal: WeekGoal;
  weeksDone: number;
  bonusPts: number;
  cheersToday: number;
  isAdmin: boolean;
  team: string | null;
  weekPts: number;
  week: { steps: number; activeDays: number; goalDays: number; mins: number; sessions: number; sportMins: number; creativeMins: number };
  bestDay: number;
  bestRun: number;
  workouts: number;
  cheersTotal: number;
  activeDays: number;
  avgSteps: number;
  stepPts: number;
  sportPts: number;
  avgSession: number;
};

async function fetchRows() {
  const supabase = db();
  const [{ data: fairies }, { data: steps }, { data: workouts }, { data: cheers }] = await Promise.all([
    supabase.from('fairies').select('id, name, token, avatar_emoji, avatar_bg, avatar_path, avatar_acc, is_admin, team'),
    supabase.from('steps').select('fairy_id, day, steps, updated_at'),
    supabase.from('workouts').select('fairy_id, minutes, day, sport'),
    supabase.from('cheers').select('from_id, to_id, day'),
  ]);
  return { fairies: fairies ?? [], steps: steps ?? [], workouts: workouts ?? [], cheers: cheers ?? [] };
}

export async function loadGarden() {
  const token = cookies().get('fg_token')?.value;
  const { fairies, steps, workouts, cheers } = DEMO ? demoRows() : await fetchRows();
  const today = helsinkiDay();
  const wk = weekStart(today);
  const board: Fairy[] = (fairies ?? [])
    .map((f) => {
      const st = (steps ?? []).filter((s) => s.fairy_id === f.id);
      const totalSteps = st.reduce((a, s) => a + s.steps, 0);
      const ws = (workouts ?? []).filter((w) => w.fairy_id === f.id);
      const mins = ws.reduce((a, w) => a + w.minutes, 0);
      const last = st.reduce<string | null>((a, s) => (!a || s.updated_at > a ? s.updated_at : a), null);
      const wDone = weeksDone(st, ws, today);
      const bonusPts = wDone * WEEK_BONUS;
      const pts = points(totalSteps, mins) + bonusPts;
      const stageIdx = stageFor(pts).idx;
      const stats = { totalSteps, bestDay: Math.max(0, ...st.map((x) => x.steps)), bestStreak: bestStreak(st), workouts: ws.length, mins, hasSteps: st.length > 0, stageIdx, weeksDone: wDone };
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
        isAdmin: !!f.is_admin,
        team: f.team,
        week: {
          steps: st.filter((x) => x.day >= wk).reduce((a, x) => a + x.steps, 0),
          activeDays: st.filter((x) => x.day >= wk && x.steps >= ACTIVE_DAY).length,
          goalDays: st.filter((x) => x.day >= wk && x.steps >= DAILY_GOAL).length,
          mins: ws.filter((w) => w.day >= wk).reduce((a, w) => a + w.minutes, 0),
          sessions: ws.filter((w) => w.day >= wk).length,
          sportMins: ws.filter((w) => w.day >= wk && kindOf(w.sport) === 'urheilu').reduce((a, w) => a + w.minutes, 0),
          creativeMins: ws.filter((w) => w.day >= wk && kindOf(w.sport) === 'luova').reduce((a, w) => a + w.minutes, 0),
        },
        weekPts: points(
          st.filter((x) => x.day >= wk).reduce((a, x) => a + x.steps, 0),
          ws.filter((w) => w.day >= wk).reduce((a, w) => a + w.minutes, 0),
        ) + (weekGoal(st, ws, today).done ? WEEK_BONUS : 0),
        bestDay: stats.bestDay,
        bestRun: stats.bestStreak,
        workouts: ws.length,
        activeDays: st.filter((x) => x.steps > 0).length,
        avgSteps: st.filter((x) => x.steps > 0).length ? Math.round(totalSteps / st.filter((x) => x.steps > 0).length) : 0,
        stepPts: stepPoints(totalSteps),
        sportPts: sportPoints(mins),
        avgSession: ws.length ? Math.round(mins / ws.length) : 0,
        cheersTotal: (cheers ?? []).filter((c) => c.to_id === f.id).length,
        stageIdx,
        yesterday: st.find((x) => x.day === dayBefore(today))?.steps ?? 0,
        minsToday: ws.filter((w) => w.day === today).reduce((a, w) => a + w.minutes, 0),
        sportMins: ws.filter((w) => kindOf(w.sport) === 'urheilu').reduce((a, w) => a + w.minutes, 0),
        creativeMins: ws.filter((w) => kindOf(w.sport) === 'luova').reduce((a, w) => a + w.minutes, 0),
        sportToday: ws.filter((w) => w.day === today && kindOf(w.sport) === 'urheilu').reduce((a, w) => a + w.minutes, 0),
        creativeToday: ws.filter((w) => w.day === today && kindOf(w.sport) === 'luova').reduce((a, w) => a + w.minutes, 0),
        goal: weekGoal(st, ws, today),
        weeksDone: wDone,
        bonusPts,
        cheersToday: (cheers ?? []).filter((c) => c.to_id === f.id && c.day === today).length,
        badges: BADGES.filter((b) => b.test(stats)).map((b) => b.id),
      };
    })
    .sort((a, b) => b.pts - a.pts);
  const me = board.find((b) => b.mine) ?? null;
  const sentToday = me ? (cheers ?? []).filter((c) => c.from_id === me.id && c.day === today).map((c) => c.to_id as string) : [];
  return { board, me, myRank: board.findIndex((b) => b.mine) + 1, sentToday };
}

/** Raakadata tilastoja varten: kaikkien askeleet ja liikunnat. */
export async function loadRaw() {
  if (DEMO) {
    const r = demoRows();
    return { steps: r.steps as import('./stats').StepRow[], workouts: r.workouts as import('./stats').WorkRow[], cheers: r.cheers as { from_id: string; to_id: string; day: string }[] };
  }
  const supabase = db();
  const [{ data: steps }, { data: workouts }, { data: cheers }] = await Promise.all([
    supabase.from('steps').select('fairy_id, day, steps'),
    supabase.from('workouts').select('fairy_id, day, sport, minutes'),
    supabase.from('cheers').select('from_id, to_id, day'),
  ]);
  return { steps: (steps ?? []) as import('./stats').StepRow[], workouts: (workouts ?? []) as import('./stats').WorkRow[], cheers: (cheers ?? []) as { from_id: string; to_id: string; day: string }[] };
}
