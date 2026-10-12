import 'server-only';
import { db } from './db';
import { dayBefore, helsinkiDay, sportPoints, stepPoints, weekStart } from './garden';
import { WEEK_BONUS, WEEK_GOAL, weekGoal } from './weekly';
import { sendPush } from './push';

/** Lähettää viime viikon yhteenvedon push-ilmoituksena (kaikille tilaajille tai vain yhdelle). */
export async function sendWeeklySummary(onlyId?: string): Promise<{ targets: number; sent: number }> {
  const supabase = db();
  const [{ data: fairies }, { data: steps }, { data: work }, { data: subs }] = await Promise.all([
    supabase.from('fairies').select('id, name'),
    supabase.from('steps').select('fairy_id, day, steps'),
    supabase.from('workouts').select('fairy_id, day, sport, minutes'),
    supabase.from('push_subscriptions').select('fairy_id'),
  ]);
  const today = helsinkiDay();
  const thisWeek = weekStart(today);
  let lastMon = thisWeek;
  for (let i = 0; i < 7; i++) lastMon = dayBefore(lastMon);
  const lastSun = dayBefore(thisWeek);

  const rows = (fairies ?? []).map((f) => {
    const st = (steps ?? []).filter((r) => r.fairy_id === f.id);
    const ws = (work ?? []).filter((r) => r.fairy_id === f.id);
    const g = weekGoal(st, ws, lastSun);
    const sSum = st.filter((r) => r.day >= lastMon && r.day <= lastSun).reduce((a, r) => a + r.steps, 0);
    const mSum = ws.filter((r) => r.day >= lastMon && r.day <= lastSun).reduce((a, r) => a + r.minutes, 0);
    return { id: f.id as string, name: f.name as string, g, pts: stepPoints(sSum) + sportPoints(mSum) + (g.done ? WEEK_BONUS : 0) };
  }).sort((a, b) => b.pts - a.pts);

  const subscribed = new Set((subs ?? []).map((s) => s.fairy_id as string));
  const targets = onlyId ? [onlyId] : rows.filter((r) => subscribed.has(r.id)).map((r) => r.id);
  let sent = 0;
  for (const id of targets) {
    const i = rows.findIndex((r) => r.id === id);
    if (i < 0) continue;
    const me = rows[i];
    const missing: string[] = [];
    if (!me.g.stepsDone) missing.push(`askeleet ${me.g.stepDaysOk}/7`);
    if (!me.g.sportDone) missing.push(`urheilu ${me.g.sportDays}/${WEEK_GOAL.sportDays}`);
    if (!me.g.creativeDone) missing.push(`luova ${me.g.creativeDays}/${WEEK_GOAL.creativeDays}`);
    const leader = rows[0] && rows[0].id !== id ? ` Viikon paras: ${rows[0].name} (${rows[0].pts} p).` : ' Sinä olit viikon paras!';
    const goal = me.g.done ? `Tavoite täynnä, +${WEEK_BONUS} p!` : `Tavoitteesta puuttui: ${missing.join(', ')}.`;
    sent += await sendPush({ title: 'Viime viikko 🌸', body: `${me.pts} p, sija ${i + 1}/${rows.length}. ${goal}${leader} Uusi viikko alkaa nyt!`, url: '/' }, [id]);
  }
  return { targets: targets.length, sent };
}
