'use server';
import { randomBytes } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { loadGarden } from '@/lib/data';
import { AVATAR_BGS, AVATAR_EMOJIS } from '@/lib/avatar';
import { fairyName, helsinkiDay, isDay } from '@/lib/garden';
import { hashPin } from '@/lib/pin';

const TEST = '🧪 ';

async function requireAdmin() {
  const { me } = await loadGarden();
  if (!me?.isAdmin) redirect('/');
  return me;
}
const done = (msg: string) => {
  revalidatePath('/', 'layout');
  redirect(`/yllapito?ok=${encodeURIComponent(msg)}`);
};

export async function adminSetSteps(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const steps = Math.round(Number(formData.get('steps')));
  const dayRaw = formData.get('day');
  const day = isDay(dayRaw) ? dayRaw : helsinkiDay();
  if (!id || !Number.isFinite(steps) || steps < 0 || steps > 200_000) return;
  await db().from('steps').upsert({ fairy_id: id, day, steps, updated_at: new Date().toISOString() });
  done('Askeleet tallennettu');
}

export async function adminResetPassword(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const pin = String(formData.get('pin') ?? '');
  if (!id || pin.length < 4) return;
  await db().from('fairies').update({ pin_hash: hashPin(pin) }).eq('id', id);
  done('Salasana vaihdettu');
}

export async function adminDelete(formData: FormData) {
  const me = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id || id === me.id) return;
  await db().from('fairies').delete().eq('id', id);
  done('Keiju poistettu');
}

export async function seedTest() {
  await requireAdmin();
  const supabase = db();
  const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  const today = new Date(`${helsinkiDay()}T12:00:00Z`);
  for (let i = 0; i < 8; i++) {
    const name = `${TEST}${fairyName()}`.slice(0, 30);
    const { data: f } = await supabase
      .from('fairies')
      .insert({ name, token: randomBytes(18).toString('base64url'), avatar_emoji: AVATAR_EMOJIS[rnd(0, AVATAR_EMOJIS.length - 1)], avatar_bg: AVATAR_BGS[rnd(0, AVATAR_BGS.length - 1)] })
      .select('id')
      .maybeSingle();
    if (!f) continue;
    const days = rnd(4, 40);
    const rows = Array.from({ length: days }, (_, k) => {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - k);
      return { fairy_id: f.id, day: d.toISOString().slice(0, 10), steps: rnd(2500, 16000) };
    });
    await supabase.from('steps').upsert(rows);
    const sports = ['Juoksu', 'Sali', 'Jooga', 'Tanssi', 'Pyöräily'];
    await supabase.from('workouts').insert(Array.from({ length: rnd(0, 8) }, () => ({ fairy_id: f.id, day: helsinkiDay(), sport: sports[rnd(0, 4)], minutes: rnd(15, 90) })));
  }
  done('8 testikeijua luotu');
}

export async function clearTest() {
  await requireAdmin();
  await db().from('fairies').delete().like('name', `${TEST}%`);
  done('Testikeijut poistettu');
}
