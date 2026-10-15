import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseDays } from '@/lib/sync';
import { dayBefore, helsinkiDay, kindOf } from '@/lib/garden';
import { WEEK_GOAL, dayFlowers } from '@/lib/weekly';
import { sendPush } from '@/lib/push';
import { announceAchievements } from '@/lib/announce';

export const dynamic = 'force-dynamic';

/**
 * iOS-oikotie lähettää joko vain tämän päivän: { "token": "...", "steps": 8234 }
 * tai takautuvasti viimeiset päivät: { "token": "...", "lines": "2026-10-09=8234\n2026-10-08=7120" }
 * (myös { "days": [{ "day": "2026-10-09", "steps": 8234 }] } käy). Päivälle jää aina suurin arvo.
 */
export async function POST(req: Request) {
  let body: { token?: unknown; days?: unknown; lines?: unknown; values?: unknown; values2?: unknown; newest?: unknown; steps?: unknown; day?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Virheellinen JSON' }, { status: 400 });
  }
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const entries = parseDays(body);
  if (!token || entries.length === 0) return NextResponse.json({ error: 'Tarkista token ja askelmäärät' }, { status: 400 });

  const supabase = db();
  const { data: fairy } = await supabase.from('fairies').select('id, name').eq('token', token).maybeSingle();
  if (!fairy) return NextResponse.json({ error: 'Tuntematon token' }, { status: 401 });

  // Pidetään päivän suurin arvo, jotta myöhäinen nollasynkronointi ei tyhjennä päivää.
  // Käsin kirjattu (✏️) luku säilyy vain, jos se on suurempi kuin synkattu; muuten synkka korvaa merkinnän.
  let hasManual = true;
  let existing: { day: string; steps: number; manual?: boolean }[] | null = null;
  const withManual = await supabase.from('steps').select('day, steps, manual').eq('fairy_id', fairy.id).in('day', entries.map((e) => e.day));
  if (withManual.error) {
    hasManual = false;
    existing = (await supabase.from('steps').select('day, steps').eq('fairy_id', fairy.id).in('day', entries.map((e) => e.day))).data;
  } else {
    existing = withManual.data;
  }
  const had = new Map((existing ?? []).map((r) => [r.day as string, r.steps as number]));
  const wasManual = new Set((existing ?? []).filter((r) => r.manual).map((r) => r.day as string));
  const now = new Date().toISOString();
  const rows = entries.map((e) => {
    const prev = had.get(e.day) ?? 0;
    const row = { fairy_id: fairy.id, day: e.day, steps: Math.max(e.steps, prev), updated_at: now };
    return hasManual ? { ...row, manual: wasManual.has(e.day) && prev > e.steps } : row;
  });
  const { error } = await supabase.from('steps').upsert(rows);
  if (error) return NextResponse.json({ error: 'Tallennus epäonnistui' }, { status: 500 });

  // Ilmoitus muille, kun tämän tai eilisen päivän kukka (tai lisäkukka) puhkeaa. Takautuvista päivistä ei pingata.
  try {
    const recent = rows.filter((r) => r.day >= dayBefore(helsinkiDay()));
    if (recent.length) {
      const { data: work } = await supabase.from('workouts').select('day, sport').eq('fairy_id', fairy.id).in('day', recent.map((r) => r.day));
      const sportOn = new Set((work ?? []).filter((w) => kindOf(w.sport as string) === 'urheilu').map((w) => w.day as string));
      const bloomed = recent.filter((r) => {
        const target = sportOn.has(r.day) ? WEEK_GOAL.stepsSportDay : WEEK_GOAL.stepsRestDay;
        return dayFlowers(r.steps, target) > dayFlowers(had.get(r.day) ?? 0, target);
      }).sort((a, b) => b.steps - a.steps)[0];
      if (bloomed) {
        const { data: others } = await supabase.from('fairies').select('id').neq('id', fairy.id);
        await sendPush({ title: `🌸 ${fairy.name}: Kasvatti puutarhaansa kukan`, body: `${bloomed.steps.toLocaleString('fi-FI')} askelta. Hienoa työtä!`, url: '/paivat?nakyma=kaikki' }, (others ?? []).map((o) => o.id as string));
      }
    }
  } catch {}
  await announceAchievements();
  return NextResponse.json({ ok: true, name: fairy.name, saved: rows.length, days: rows.map((r) => ({ day: r.day, steps: r.steps })) });
}
