'use server';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { SPORTS, helsinkiDay, isDay } from '@/lib/garden';
import { ACCESSORIES, AVATAR_BGS, AVATAR_EMOJIS } from '@/lib/avatar';
import { loadGarden } from '@/lib/data';

const COOKIE = 'fg_token';

export async function join(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim().slice(0, 30);
  if (!name) redirect('/?virhe=nimi');
  const token = randomBytes(18).toString('base64url');
  const { error } = await db().from('fairies').insert({ name, token });
  if (error) redirect('/?virhe=tallennus');
  cookies().set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' });
  redirect('/profiili?uusi=1');
}

export async function logSteps(formData: FormData) {
  const token = cookies().get(COOKIE)?.value;
  const steps = Math.round(Number(formData.get('steps')));
  const dayRaw = formData.get('day');
  const day = isDay(dayRaw) ? dayRaw : helsinkiDay();
  if (!token || !Number.isFinite(steps) || steps < 0 || steps > 200_000) return;
  const supabase = db();
  const { data: fairy } = await supabase.from('fairies').select('id').eq('token', token).maybeSingle();
  if (!fairy) return;
  await supabase.from('steps').upsert({ fairy_id: fairy.id, day, steps, updated_at: new Date().toISOString() });
  revalidatePath('/', 'layout');
  redirect('/kirjaa?ok=askeleet');
}

export async function logWorkout(formData: FormData) {
  const token = cookies().get(COOKIE)?.value;
  const sport = String(formData.get('sport') ?? '');
  const minutes = Math.round(Number(formData.get('minutes')));
  if (!token || !(SPORTS as readonly string[]).includes(sport) || !(minutes > 0 && minutes <= 600)) return;
  const supabase = db();
  const { data: fairy } = await supabase.from('fairies').select('id').eq('token', token).maybeSingle();
  if (!fairy) return;
  await supabase.from('workouts').insert({ fairy_id: fairy.id, day: helsinkiDay(), sport, minutes });
  revalidatePath('/', 'layout');
  redirect('/kirjaa?ok=liikunta');
}

export async function leave() {
  cookies().delete(COOKIE);
  redirect('/');
}

async function myFairy() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await db().from('fairies').select('id, avatar_path').eq('token', token).maybeSingle();
  return data;
}

export async function saveAvatar(formData: FormData) {
  const fairy = await myFairy();
  const emoji = String(formData.get('emoji') ?? '');
  const bg = String(formData.get('bg') ?? '');
  const name = String(formData.get('name') ?? '').trim().slice(0, 30);
  if (!fairy || !AVATAR_EMOJIS.includes(emoji) || !AVATAR_BGS.includes(bg)) return;
  const accId = String(formData.get('acc') ?? 'none');
  const { me } = await loadGarden();
  const acc = ACCESSORIES.find((a) => a.id === accId);
  const patch: Record<string, string> = { avatar_emoji: emoji, avatar_bg: bg, avatar_acc: acc && me && me.stageIdx >= acc.stage ? acc.id : 'none' };
  if (name) patch.name = name;
  await db().from('fairies').update(patch).eq('id', fairy.id);
  revalidatePath('/', 'layout');
  redirect(formData.get('uusi') ? '/' : '/profiili?ok=1');
}

export async function uploadPhoto(formData: FormData): Promise<{ ok: boolean }> {
  const fairy = await myFairy();
  const file = formData.get('photo');
  if (!fairy || !(file instanceof File) || file.size === 0 || file.size > 400_000 || !file.type.startsWith('image/')) return { ok: false };
  const supabase = db();
  const path = `${fairy.id}-${Date.now()}.jpg`;
  const body = Buffer.from(await file.arrayBuffer());
  let { error } = await supabase.storage.from('avatars').upload(path, body, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) {
    // Ensimmäisellä kerralla bucket puuttuu: luodaan julkinen bucket ja yritetään uudelleen.
    await supabase.storage.createBucket('avatars', { public: true, fileSizeLimit: 500_000, allowedMimeTypes: ['image/jpeg'] });
    ({ error } = await supabase.storage.from('avatars').upload(path, body, { contentType: 'image/jpeg', cacheControl: '31536000' }));
  }
  if (error) return { ok: false };
  await supabase.from('fairies').update({ avatar_path: path }).eq('id', fairy.id);
  if (fairy.avatar_path) await supabase.storage.from('avatars').remove([fairy.avatar_path]);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function removePhoto() {
  const fairy = await myFairy();
  if (!fairy) return;
  const supabase = db();
  await supabase.from('fairies').update({ avatar_path: null }).eq('id', fairy.id);
  if (fairy.avatar_path) await supabase.storage.from('avatars').remove([fairy.avatar_path]);
  revalidatePath('/', 'layout');
  redirect('/profiili?ok=1');
}
