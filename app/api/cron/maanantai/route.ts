import { NextResponse } from 'next/server';
import { sendWeeklySummary } from '@/lib/summary';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Maanantain yhteenveto klo 9 Suomen aikaa (vercel.json ajaa tämän klo 6 ja 7 UTC maanantaisin,
 * ja vain se ajo, joka osuu klo 9:ään, lähettää). Vaatii CRON_SECRET-ympäristömuuttujan.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Ei oikeutta.' }, { status: 401 });
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Helsinki', hour: '2-digit', hour12: false, weekday: 'short' }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value) % 24;
  const weekday = parts.find((p) => p.type === 'weekday')?.value;
  if (hour !== 9 || weekday !== 'Mon') return NextResponse.json({ skipped: true, hour, weekday });
  return NextResponse.json(await sendWeeklySummary());
}
