import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const token = cookies().get('fg_token')?.value;
  if (!token) return NextResponse.json({ error: 'Kirjaudu ensin.' }, { status: 401 });
  const sub = await req.json().catch(() => null);
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return NextResponse.json({ error: 'Virheellinen tilaus.' }, { status: 400 });
  const supabase = db();
  const { data: fairy } = await supabase.from('fairies').select('id').eq('token', token).maybeSingle();
  if (!fairy) return NextResponse.json({ error: 'Tuntematon käyttäjä.' }, { status: 401 });
  const { error } = await supabase.from('push_subscriptions').upsert({ endpoint: sub.endpoint, fairy_id: fairy.id, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  if (error) return NextResponse.json({ error: 'Tallennus epäonnistui.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
