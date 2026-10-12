import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseDays } from '@/lib/sync';

export const dynamic = 'force-dynamic';

/**
 * iOS-oikotie lähettää joko vain tämän päivän: { "token": "...", "steps": 8234 }
 * tai takautuvasti viimeiset päivät: { "token": "...", "lines": "2026-10-09=8234\n2026-10-08=7120" }
 * (myös { "days": [{ "day": "2026-10-09", "steps": 8234 }] } käy). Päivälle jää aina suurin arvo.
 */
export async function POST(req: Request) {
  let body: { token?: unknown; days?: unknown; lines?: unknown; values?: unknown; newest?: unknown; steps?: unknown; day?: unknown };
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
  const { data: existing } = await supabase.from('steps').select('day, steps').eq('fairy_id', fairy.id).in('day', entries.map((e) => e.day));
  const had = new Map((existing ?? []).map((r) => [r.day as string, r.steps as number]));
  const now = new Date().toISOString();
  const rows = entries.map((e) => ({ fairy_id: fairy.id, day: e.day, steps: Math.max(e.steps, had.get(e.day) ?? 0), updated_at: now }));
  const { error } = await supabase.from('steps').upsert(rows);
  if (error) return NextResponse.json({ error: 'Tallennus epäonnistui' }, { status: 500 });
  return NextResponse.json({ ok: true, name: fairy.name, saved: rows.length, days: rows.map((r) => ({ day: r.day, steps: r.steps })) });
}
