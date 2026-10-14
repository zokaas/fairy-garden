import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loadGarden, loadRaw } from '@/lib/data';
import { dayBefore, helsinkiDay, kindOf, weekStart } from '@/lib/garden';
import Avatar from '@/components/Avatar';
import { WEEK_GOAL, dayFlowers } from '@/lib/weekly';

const WD = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];
const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const fi = (n: number) => n.toLocaleString('fi-FI');

const PAGE = 7;

/**
 * Kaikkien keijujen päivät (Päivät-sivun Kaikki-välilehti): yksi rivi per keiju per päivä,
 * tuoreimmat päivät auki ja vanhemmat kokoon taitettuna, suodattimena kaikki / urheilu / luova / kukat.
 */
export default async function TekemisetView({ paivia }: { paivia?: string }) {
  const [{ board, me }, raw] = await Promise.all([loadGarden(), loadRaw()]);
  if (!me) redirect('/');
  const shown = Math.min(60, Math.max(PAGE, Number(paivia) || PAGE));
  const who = new Map(board.map((b) => [b.id, b]));
  const today = helsinkiDay();
  const yesterday = dayBefore(today);
  const wk = weekStart(today);

  const thisWeek = raw.workouts.filter((w) => w.day >= wk && who.has(w.fairy_id));
  const counts = new Map<string, number>();
  thisWeek.forEach((w) => counts.set(w.sport, (counts.get(w.sport) ?? 0) + 1));
  const topSport = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const doers = new Set(thisWeek.map((w) => w.fairy_id)).size;

  // Yksi merkintä per keiju per päivä: kukat, askeleet ja lajit koottuna.
  type Person = { id: string; day: string; steps: number; flowers: number; sport: Map<string, number>; creative: Map<string, number>; latest: string; count: number };
  const sportDays = new Set(raw.workouts.filter((w) => kindOf(w.sport) === 'urheilu').map((w) => `${w.fairy_id}|${w.day}`));
  const people = new Map<string, Person>();
  const get = (id: string, day: string) => {
    const k = `${id}|${day}`;
    let p = people.get(k);
    if (!p) people.set(k, (p = { id, day, steps: 0, flowers: 0, sport: new Map(), creative: new Map(), latest: '', count: 0 }));
    return p;
  };
  for (const r of raw.steps) {
    if (!who.has(r.fairy_id)) continue;
    const n = dayFlowers(r.steps, sportDays.has(`${r.fairy_id}|${r.day}`) ? WEEK_GOAL.stepsSportDay : WEEK_GOAL.stepsRestDay);
    if (r.steps > 0) Object.assign(get(r.fairy_id, r.day), { steps: r.steps, flowers: n });
  }
  for (const w of raw.workouts) {
    if (!who.has(w.fairy_id)) continue;
    const p = get(w.fairy_id, w.day);
    const m = kindOf(w.sport) === 'luova' ? p.creative : p.sport;
    m.set(w.sport, (m.get(w.sport) ?? 0) + w.minutes);
    const created = (w as { created_at?: string }).created_at ?? '';
    if (created > p.latest) p.latest = created;
    p.count++;
  }

  const byDay = new Map<string, Person[]>();
  for (const p of people.values()) byDay.set(p.day, [...(byDay.get(p.day) ?? []), p]);
  const allDays = [...byDay.keys()].sort((a, b) => b.localeCompare(a));
  const days = allDays.slice(0, shown);
  const label = (d: string) => (d === today ? 'Tänään' : d === yesterday ? 'Eilen' : `${WD[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${dm(d)}`);
  const list = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([s, min]) => `${s} ${min} min`).join(', ');
  const href = (n: number) => `/paivat?nakyma=kaikki&paivia=${n}`;

  const visible = (p: Person) => p.steps > 0 || p.sport.size > 0 || p.creative.size > 0;
  const rankOf = new Map(board.map((b, i) => [b.id, i]));
  const order = (a: Person, b: Person) => (rankOf.get(a.id) ?? 0) - (rankOf.get(b.id) ?? 0);

  return (
    <>
      <p className="sub">Kaikkien keijujen päivät: askeleet, urheilu ja luovat harrastukset. 🌸 = päivän tavoite täyttyi. Yksi rivi per keiju per päivä, keijut aina kisan sijajärjestyksessä.</p>

      <section className="card">
        <div className="tiles">
          <div><b>{thisWeek.length}</b><span>kirjausta tällä viikolla (kaikki yhteensä)</span></div>
          <div><b>{doers} / {board.length}</b><span>keijua on kirjannut liikuntaa tällä viikolla</span></div>
          <div><b>{topSport ? topSport[0] : '–'}</b><span>suosituin laji tällä viikolla</span>{topSport && <small>{topSport[1]} kertaa</small>}</div>
        </div>
      </section>

      {days.length === 0 ? (
        <section className="card"><p className="muted">Ei vielä kirjauksia. Ensimmäinen kirjaus tulee tähän näkyviin.</p></section>
      ) : days.map((d) => {
        const all = byDay.get(d)!;
        const rows = all.filter(visible).sort(order);
        const movers = all.filter((p) => p.sport.size > 0 || p.creative.size > 0).length;
        const fl = all.reduce((a, p) => a + p.flowers, 0);
        const stepsAll = all.reduce((a, p) => a + p.steps, 0);
        return (
          <details key={d} className="card dayfold" open={d === today || d === yesterday}>
            <summary>
              <b>{label(d)}</b>
              <small>{fi(stepsAll)} askelta · {fl} 🌸{movers > 0 ? ` · ${movers} liikkui` : ''}</small>
            </summary>
            {rows.length === 0 ? <p className="muted">Ei kirjauksia.</p> : (
              <ul className="plain feed">
                {rows.map((p) => {
                  const f = who.get(p.id)!;
                  const showSt = p.steps > 0;
                  const showSp = p.sport.size > 0;
                  const showCr = p.creative.size > 0;
                  return (
                    <li key={p.id} className={f.mine ? 'me' : ''}>
                      <Link href={`/keiju/${f.id}`} aria-label={`Avaa ${f.name}`}><Avatar a={f} size={36} stage={f.stageIdx} /></Link>
                      <span className="fd-t">
                        <Link href={`/keiju/${f.id}`}><b>{f.name}{f.mine ? ' (sinä)' : ''}</b></Link>
                        {showSt && <small>{p.flowers > 0 ? '🌸'.repeat(Math.min(p.flowers, 4)) : '👟'} {fi(p.steps)} askelta</small>}
                        {showSp && <small>💪 {list(p.sport)}</small>}
                        {showCr && <small>🎨 {list(p.creative)}</small>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </details>
        );
      })}

      {allDays.length > shown && (
        <Link className="btn ghost" href={href(shown + PAGE)}>Näytä {Math.min(PAGE, allDays.length - shown)} päivää lisää</Link>
      )}
      <Link className="btn ghost" href="/kirjaa">Kirjaa oma liikunta</Link>
    </>
  );
}
