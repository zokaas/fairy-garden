import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CHECKS: Record<string, string> = {
  fairies: 'id, name, token, avatar_emoji, avatar_bg, avatar_path, avatar_acc, pin_hash, is_admin',
  steps: 'fairy_id, day, steps, updated_at',
  workouts: 'id, fairy_id, day, sport, minutes',
  cheers: 'id, from_id, to_id, day',
  reactions: 'id, from_id, to_id, target',
  settings: 'key, value',
  push_subscriptions: 'endpoint, fairy_id, p256dh, auth',
};

/** Kertoo, onko tietokanta ajan tasalla. Ei palauta dataa, vain puuttuvat osat. */
export async function GET() {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('env: NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('env: SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length === 0) {
    const supabase = db();
    for (const [table, cols] of Object.entries(CHECKS)) {
      const { error } = await supabase.from(table).select(cols).limit(1);
      if (error) missing.push(`${table}: ${error.message}`);
    }
  }
  return NextResponse.json(missing.length ? { ok: false, ongelmat: missing, ohje: 'Aja supabase/migrations/000_kaikki.sql Supabasen SQL Editorissa.' } : { ok: true }, { status: missing.length ? 500 : 200 });
}
