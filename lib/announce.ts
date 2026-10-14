import 'server-only';
import { db } from './db';
import { DEMO } from './demo';
import { loadGarden } from './data';
import { BADGES } from './badges';
import { STOPS, UNLOCKS, weekStart, helsinkiDay } from './garden';
import { sendPush } from './push';

type Ach = { key: string; title: string; body: string };

/** Kaikki tähän mennessä saavutetut asiat. Avain on pysyvä, joten sama saavutus ilmoitetaan vain kerran. */
async function achievements(): Promise<Ach[]> {
  const { board } = await loadGarden();
  const out: Ach[] = [];
  const wk = weekStart(helsinkiDay());
  for (const f of board) {
    for (const id of f.badges) {
      const b = BADGES.find((x) => x.id === id);
      if (b) out.push({ key: `b:${f.id}:${id}`, title: `${b.emoji} ${f.name} sai merkin`, body: `${b.name}: ${b.desc}` });
    }
    if (f.goal.done) out.push({ key: `w:${f.id}:${wk}`, title: `🎯 ${f.name} täytti viikkotavoitteen`, body: `+10 pistettä! Hienoa työtä.` });
    for (const u of UNLOCKS) if (f.flowers >= u.at) out.push({ key: `g:${f.id}:${u.at}`, title: `🌸 ${f.name}: puutarha kasvoi`, body: `${u.at} kukkaa: ${u.text}` });
  }
  const total = board.reduce((a, f) => a + f.totalSteps, 0);
  STOPS.forEach((s, i) => {
    if (s.at > 0 && total >= s.at) out.push({ key: `j:${i}`, title: `${s.emoji} Yhteinen matka: ${s.name}`, body: `Ryhmä on kävellyt ${s.at.toLocaleString('fi-FI')} askelta yhdessä!` });
  });
  return out;
}

/**
 * Ilmoittaa kaikille uusista saavutuksista (merkit, viikkotavoite, puutarhan palkinnot, matkan etapit).
 * Ensimmäisellä ajolla nykyiset saavutukset vain merkitään ilmoitetuiksi, jotta vanhoista ei tule ilmoitusryöppyä.
 * Virheet eivät kaada kutsujaa; jos taulua ei ole (migraatio 007), ei tehdä mitään.
 */
export async function announceAchievements(): Promise<void> {
  if (DEMO) return;
  try {
    const supabase = db();
    const { count, error: cErr } = await supabase.from('announced').select('key', { count: 'exact', head: true });
    if (cErr) return;
    const all = await achievements();
    if (all.length === 0) return;
    const { data: fresh, error } = await supabase.from('announced').upsert(all.map((a) => ({ key: a.key })), { onConflict: 'key', ignoreDuplicates: true }).select('key');
    if (error || (count ?? 0) === 0) return; // ensimmäinen ajo: vain pohjatilanne talteen
    const keys = new Set((fresh ?? []).map((r) => r.key as string));
    const news = all.filter((a) => keys.has(a.key)).slice(0, 5);
    for (const a of news) await sendPush({ title: a.title, body: a.body, url: '/kisa' });
  } catch {}
}
