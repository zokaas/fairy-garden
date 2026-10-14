import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loadGarden, loadRaw } from '@/lib/data';
import { dayBefore, helsinkiDay, kindOf, weekStart } from '@/lib/garden';
import Avatar from '@/components/Avatar';
import { WEEK_GOAL, dayFlowers } from '@/lib/weekly';

const WD = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];
const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const clock = (iso?: string) => (iso ? new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '');

/** Kaikkien keijujen kirjaukset ja päivän kukat päivittäin ryhmiteltynä (Päivät-sivun Kaikki-välilehti). */
export default async function TekemisetView() {
  const [{ board, me }, raw] = await Promise.all([loadGarden(), loadRaw()]);
  if (!me) redirect('/');
  const who = new Map(board.map((b) => [b.id, b]));
  const today = helsinkiDay();
  const yesterday = dayBefore(today);
  const wk = weekStart(today);

  const entries = raw.workouts
    .map((w) => ({ ...w, created: (w as { created_at?: string }).created_at ?? '' }))
    .filter((w) => who.has(w.fairy_id))
    .sort((a, b) => (a.day === b.day ? b.created.localeCompare(a.created) : b.day.localeCompare(a.day)))
    .slice(0, 80);

  const thisWeek = raw.workouts.filter((w) => w.day >= wk && who.has(w.fairy_id));
  const counts = new Map<string, number>();
  thisWeek.forEach((w) => counts.set(w.sport, (counts.get(w.sport) ?? 0) + 1));
  const topSport = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const doers = new Set(thisWeek.map((w) => w.fairy_id)).size;

  // Päivän kukat viimeisen 7 päivän ajalta näkyvät syötteessä omina kohtinaan.
  const sportDays = new Set(raw.workouts.filter((w) => kindOf(w.sport) === 'urheilu').map((w) => `${w.fairy_id}|${w.day}`));
  let oldest = today;
  for (let i = 0; i < 7; i++) oldest = dayBefore(oldest);
  const blooms = raw.steps
    .filter((r) => r.day >= oldest && who.has(r.fairy_id))
    .map((r) => ({ fairy_id: r.fairy_id, day: r.day, steps: r.steps, n: dayFlowers(r.steps, sportDays.has(`${r.fairy_id}|${r.day}`) ? WEEK_GOAL.stepsSportDay : WEEK_GOAL.stepsRestDay) }))
    .filter((r) => r.n > 0);

  type Item = { kind: 'w'; e: (typeof entries)[number] } | { kind: 's'; b: (typeof blooms)[number] };
  const groups: { day: string; items: Item[] }[] = [];
  const put = (day: string, it: Item) => {
    let g = groups.find((x) => x.day === day);
    if (!g) groups.push((g = { day, items: [] }));
    g.items.push(it);
  };
  // Päivän sisällä: ensin päivän kukat (eniten askelia ensin), sitten kirjaukset uusimmasta vanhimpaan.
  for (const b of [...blooms].sort((x, y) => y.steps - x.steps)) put(b.day, { kind: 's', b });
  for (const e of entries) put(e.day, { kind: 'w', e });
  groups.sort((a, b) => b.day.localeCompare(a.day));
  const label = (d: string) => (d === today ? 'Tänään' : d === yesterday ? 'Eilen' : `${WD[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${dm(d)}`);

  return (
    <>
      <p className="sub">Tässä näkyvät kaikkien keijujen urheilu- ja luovuuskirjaukset sekä päivän kukat. 💪 = urheilu, 🎨 = luova, 🌸 = päivän askeltavoite.</p>

      <section className="card">
        <div className="tiles">
          <div><b>{thisWeek.length}</b><span>kirjausta tällä viikolla (kaikki yhteensä)</span></div>
          <div><b>{doers} / {board.length}</b><span>keijua on kirjannut liikuntaa tällä viikolla</span></div>
          <div><b>{topSport ? topSport[0] : '–'}</b><span>suosituin laji tällä viikolla</span>{topSport && <small>{topSport[1]} kertaa</small>}</div>
        </div>
      </section>

      {groups.length === 0 ? (
        <section className="card"><p className="muted">Ei vielä kirjauksia. Ensimmäinen kirjaus tulee tähän näkyviin.</p></section>
      ) : groups.map((g) => (
        <section key={g.day} className="card">
          <h2>{label(g.day)}</h2>
          <ul className="plain feed">
            {g.items.map((it, i) => {
              if (it.kind === 's') {
                const f = who.get(it.b.fairy_id)!;
                return (
                  <li key={`s-${f.id}-${it.b.day}`} className={f.mine ? 'me' : ''}>
                    <Link href={`/keiju/${f.id}`} aria-label={`Avaa ${f.name}`}><Avatar a={f} size={36} stage={f.stageIdx} /></Link>
                    <span className="fd-t"><Link href={`/keiju/${f.id}`}><b>{f.name}{f.mine ? ' (sinä)' : ''}</b></Link><small>{'🌸'.repeat(Math.min(it.b.n, 4))} päivän askeltavoite täyttyi · {it.b.steps.toLocaleString('fi-FI')} askelta</small></span>
                  </li>
                );
              }
              const e = it.e;
              const f = who.get(e.fairy_id)!;
              const luova = kindOf(e.sport) === 'luova';
              return (
                <li key={`${e.fairy_id}-${e.day}-${i}`} className={f.mine ? 'me' : ''}>
                  <Link href={`/keiju/${f.id}`} aria-label={`Avaa ${f.name}`}><Avatar a={f} size={36} stage={f.stageIdx} /></Link>
                  <span className="fd-t"><Link href={`/keiju/${f.id}`}><b>{f.name}{f.mine ? ' (sinä)' : ''}</b></Link><small>{luova ? '🎨' : '💪'} {e.sport} · {e.minutes} min{e.created ? ` · klo ${clock(e.created)}` : ''}</small></span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <Link className="btn ghost" href="/kirjaa">Kirjaa oma liikunta</Link>
    </>
  );
}
