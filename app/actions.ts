'use server';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { CREATIVE, SPORTS, dayBefore, helsinkiDay, isDay, loggableDays } from '@/lib/garden';
import { AVATAR_BGS, AVATAR_EMOJIS } from '@/lib/avatar';
import { loadGarden } from '@/lib/data';
import { hashPin, verifyPin } from '@/lib/pin';
import { sendPush } from '@/lib/push';
import { DEMO } from '@/lib/demo';

const COOKIE = 'fg_token';

function setSession(token: string) {
  cookies().set(COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' });
}

export async function join(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim().slice(0, 30);
  const pin = String(formData.get('pin') ?? '');
  if (!name) redirect('/?virhe=nimi');
  if (pin.length < 4) redirect('/?virhe=salasana');
  const supabase = db();
  // Sama nimi (isoilla/pienillä kirjaimilla ei väliä) ei voi olla kahdesti: silloin kirjaudutaan, ei luoda uutta.
  const { data: all } = await supabase.from('fairies').select('name');
  if ((all ?? []).some((f) => f.name.toLowerCase() === name.toLowerCase())) redirect('/?virhe=olemassa');
  const token = randomBytes(18).toString('base64url');
  const { error } = await supabase.from('fairies').insert({ name, token, pin_hash: hashPin(pin) });
  if (error) redirect(`/?virhe=tallennus&d=${encodeURIComponent(error.message.slice(0, 120))}`);
  setSession(token);
  redirect('/profiili?uusi=1');
}

/** Kirjautuminen nimellä ja salasanalla (uusi laite, toinen selain tai kotinäytön sovellus). */
export async function login(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const pin = String(formData.get('pin') ?? '');
  if (!name || pin.length < 4) redirect('/?kirjaudu=1&virhe=salasana');
  const supabase = db();
  const { data: all } = await supabase.from('fairies').select('id, name, token, pin_hash');
  const f = (all ?? []).find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!f) redirect('/?kirjaudu=1&virhe=eiloydy');
  if (!f.pin_hash) {
    // Vanha tunnus ilman salasanaa: ensimmäinen kirjautuja asettaa salasanan.
    await supabase.from('fairies').update({ pin_hash: hashPin(pin) }).eq('id', f.id);
  } else if (!verifyPin(pin, f.pin_hash)) {
    redirect('/?kirjaudu=1&virhe=vaara');
  }
  setSession(f.token);
  redirect('/');
}

export async function logWorkout(formData: FormData) {
  const token = cookies().get(COOKIE)?.value;
  const sport = String(formData.get('sport') ?? '');
  const minutes = Math.round(Number(formData.get('minutes')));
  const known = [...SPORTS, ...CREATIVE] as readonly string[];
  if (!token || !known.includes(sport) || !(minutes > 0 && minutes <= 600)) return;
  const when = String(formData.get('when') ?? '');
  const allowed = loggableDays();
  // vanhat arvot 'tanaan' / 'eilen' toimivat edelleen; muuten odotetaan päivämäärää (vain sallituista päivistä)
  const day = when === 'eilen' ? dayBefore(helsinkiDay()) : isDay(when) && allowed.includes(when) ? when : helsinkiDay();
  const supabase = db();
  const { data: fairy } = await supabase.from('fairies').select('id').eq('token', token).maybeSingle();
  if (!fairy) return;
  await supabase.from('workouts').insert({ fairy_id: fairy.id, day, sport, minutes });
  // Ilmoitus muille, kun kirjaus on tältä tai eiliseltä päivältä (takautuvista ei pingata).
  if (day >= dayBefore(helsinkiDay())) {
    try {
      const [{ data: me }, { data: others }] = await Promise.all([
        supabase.from('fairies').select('name').eq('id', fairy.id).single(),
        supabase.from('fairies').select('id').neq('id', fairy.id),
      ]);
      const icon = (CREATIVE as readonly string[]).includes(sport) ? '🎨' : '💪';
      await sendPush({ title: `${icon} ${me?.name ?? 'Joku'} kirjasi ${sport.toLowerCase()}`, body: `${minutes} min. Käy lähettämässä kimallusta ✨`, url: '/tekemiset' }, (others ?? []).map((o) => o.id as string));
    } catch {}
  }
  revalidatePath('/', 'layout');
  redirect('/kirjaa?ok=liikunta');
}

/** Poistaa oman liikuntakirjauksen (vain omat, vain viimeisen 7 päivän ajalta). */
export async function deleteWorkout(formData: FormData) {
  const token = cookies().get(COOKIE)?.value;
  const id = String(formData.get('id') ?? '');
  if (!token || !/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = db();
  const { data: fairy } = await supabase.from('fairies').select('id').eq('token', token).maybeSingle();
  if (!fairy) return;
  let oldest = helsinkiDay();
  for (let i = 0; i < 7; i++) oldest = dayBefore(oldest);
  await supabase.from('workouts').delete().eq('id', id).eq('fairy_id', fairy.id).gte('day', oldest);
  revalidatePath('/', 'layout');
  redirect('/kirjaa?ok=poistettu');
}

/** Selvittää tekemisen omistajan ja lyhyen kuvauksen ilmoitusta varten (liikuntakirjaus tai päivän askeltavoite). */
async function resolveTarget(target: string): Promise<{ toId: string; what: string } | null> {
  const wm = /^w:([0-9a-f-]{36})$/i.exec(target);
  const sm = /^s:([0-9a-f-]{36}):(\d{4}-\d{2}-\d{2})$/i.exec(target);
  if (wm) {
    const { data: w } = await db().from('workouts').select('fairy_id, sport, minutes').eq('id', wm[1]).maybeSingle();
    return w ? { toId: w.fairy_id as string, what: `${String(w.sport).toLowerCase()} ${w.minutes} min` } : null;
  }
  if (sm) return { toId: sm[1], what: 'päivän askeltavoite' };
  return null;
}

/** Kimalle-reaktio tekemiseen: napautus lisää, toinen napautus poistaa. Omaan tekemiseen ei voi reagoida. */
export async function react(formData: FormData) {
  if (DEMO) return;
  const target = String(formData.get('target') ?? '');
  const me = await myFairy();
  const t = me ? await resolveTarget(target) : null;
  if (!me || !t || t.toId === me.id) return;
  const supabase = db();
  const { data: had } = await supabase.from('reactions').select('id').eq('from_id', me.id).eq('target', target).maybeSingle();
  if (had) {
    await supabase.from('reactions').delete().eq('id', had.id);
  } else {
    const { error } = await supabase.from('reactions').insert({ from_id: me.id, to_id: t.toId, target });
    if (!error) {
      try {
        const { data: who } = await supabase.from('fairies').select('name').eq('id', me.id).single();
        await sendPush({ title: `✨ ${who?.name ?? 'Joku'} lähetti sinulle kimallusta`, body: `Kohteena ${t.what}`, url: '/tekemiset' }, [t.toId]);
      } catch {}
    }
  }
  revalidatePath('/tekemiset');
}

/** Lyhyt kommentti (enintään 140 merkkiä) tekemiseen. Omaan tekemiseen voi vastata, ilmoitus menee omistajalle. */
export async function comment(formData: FormData) {
  if (DEMO) return;
  const target = String(formData.get('target') ?? '');
  const body = String(formData.get('body') ?? '').trim().slice(0, 140);
  if (!body) return;
  const me = await myFairy();
  const t = me ? await resolveTarget(target) : null;
  if (!me || !t) return;
  const supabase = db();
  const { error } = await supabase.from('comments').insert({ from_id: me.id, to_id: t.toId, target, body });
  if (!error && t.toId !== me.id) {
    try {
      const { data: who } = await supabase.from('fairies').select('name').eq('id', me.id).single();
      await sendPush({ title: `💬 ${who?.name ?? 'Joku'} kommentoi`, body, url: '/tekemiset' }, [t.toId]);
    } catch {}
  }
  revalidatePath('/tekemiset');
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
  const patch: Record<string, string> = { avatar_emoji: emoji, avatar_bg: bg };
  if (name) patch.name = name;
  const supabase = db();
  if (formData.get('mode') === 'hahmo' && fairy.avatar_path) {
    await supabase.from('fairies').update({ avatar_path: null }).eq('id', fairy.id);
    await supabase.storage.from('avatars').remove([fairy.avatar_path]);
  }
  await supabase.from('fairies').update(patch).eq('id', fairy.id);
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

