import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPush } from '@/lib/push';
import { dayBefore, helsinkiDay } from '@/lib/garden';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Aamumuistutus klo 9 Suomen aikaa (vercel.json ajaa tämän klo 6 ja 7 UTC, ja vain se ajo, joka osuu klo 9:ään, lähettää).
 * Lähettää vain niille, joilla on ilmoitukset päällä ja joiden eilinen puuttuu, mutta joilla on aiempia askelia.
 * Vaatii CRON_SECRET-ympäristömuuttujan.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Ei oikeutta.' }, { status: 401 });
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Helsinki', hour: '2-digit', hour12: false }).format(new Date())) % 24;
  if (hour !== 9) return NextResponse.json({ skipped: true, hour });

  const supabase = db();
  const yesterday = dayBefore(helsinkiDay());
  const [{ data: subs }, { data: steps }] = await Promise.all([
    supabase.from('push_subscriptions').select('fairy_id'),
    supabase.from('steps').select('fairy_id, day, steps'),
  ]);
  const subscribed = Array.from(new Set((subs ?? []).map((s) => s.fairy_id as string)));
  const hadAny = new Set((steps ?? []).map((s) => s.fairy_id as string));
  const gotYesterday = new Set((steps ?? []).filter((s) => s.day === yesterday && s.steps > 0).map((s) => s.fairy_id as string));
  const targets = subscribed.filter((id) => hadAny.has(id) && !gotYesterday.has(id));
  const sent = await sendPush({ title: 'Fairy Garden 🌸', body: 'Eilisen askeleet puuttuvat. Synkkaa ne, niin puutarhasi kasvaa ✨', url: '/' }, targets);
  return NextResponse.json({ targets: targets.length, sent });
}
