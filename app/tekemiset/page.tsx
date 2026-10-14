import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden, loadRaw } from '@/lib/data';
import { dayBefore, helsinkiDay, kindOf, weekStart } from '@/lib/garden';
import Avatar from '@/components/Avatar';
import ReactButton from '@/components/ReactButton';
import { loadComments, loadReactions, stepsTarget, workoutTarget } from '@/lib/reactions';
import { WEEK_GOAL, dayFlowers } from '@/lib/weekly';

export const dynamic = 'force-dynamic';

const WD = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];
const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const clock = (iso?: string) => (iso ? new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '');

export default async function Tekemiset() {
  if (!cookies().get('fg_token')) redirect('/');
  const [{ board, me }, raw, reactions, allComments] = await Promise.all([loadGarden(), loadRaw(), loadReactions(), loadComments()]);
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

  const names = (target: string) => reactions.filter((r) => r.target === target).map((r) => who.get(r.from_id)?.name ?? '').filter(Boolean);
  const commentsOf = (target: string) => allComments.filter((c) => c.target === target).map((c) => ({ id: c.id, name: who.get(c.from_id)?.name ?? 'Keiju', body: c.body }));
  const reacted = (target: string) => reactions.some((r) => r.target === target && who.get(r.from_id)?.mine);

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
  for (const e of entries) put(e.day, { kind: 'w', e });
  for (const b of blooms) put(b.day, { kind: 's', b });
  groups.sort((a, b) => b.day.localeCompare(a.day));
  const label = (d: string) => (d === today ? 'Tänään' : d === yesterday ? 'Eilen' : `${WD[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${dm(d)}`);

  return (
    <>
      <h1>Kuka teki mitä</h1>
      <p className="sub">Tässä näkyvät kaikkien keijujen urheilu- ja luovuuskirjaukset sekä päivän kukat. 💪 = urheilu, 🎨 = luova, 🌸 = päivän askeltavoite. Lähetä muille kimallusta ✨ tai kommentti 💬, ja saat ilmoituksen, kun joku tekee saman sinulle.</p>

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
                const t = stepsTarget(f.id, it.b.day);
                return (
                  <li key={`s-${f.id}-${it.b.day}`} className={f.mine ? 'me' : ''}>
                    <Link href={`/keiju/${f.id}`} aria-label={`Avaa ${f.name}`}><Avatar a={f} size={36} stage={f.stageIdx} /></Link>
                    <span className="fd-t"><Link href={`/keiju/${f.id}`}><b>{f.name}{f.mine ? ' (sinä)' : ''}</b></Link><small>{'🌸'.repeat(Math.min(it.b.n, 4))} päivän askeltavoite täyttyi · {it.b.steps.toLocaleString('fi-FI')} askelta</small></span>
                    <ReactButton target={t} names={names(t)} mine={reacted(t)} own={f.mine} comments={commentsOf(t)} />
                  </li>
                );
              }
              const e = it.e;
              const f = who.get(e.fairy_id)!;
              const luova = kindOf(e.sport) === 'luova';
              const t = (e as { id?: string }).id ? workoutTarget((e as { id?: string }).id!) : '';
              return (
                <li key={`${e.fairy_id}-${e.day}-${i}`} className={f.mine ? 'me' : ''}>
                  <Link href={`/keiju/${f.id}`} aria-label={`Avaa ${f.name}`}><Avatar a={f} size={36} stage={f.stageIdx} /></Link>
                  <span className="fd-t"><Link href={`/keiju/${f.id}`}><b>{f.name}{f.mine ? ' (sinä)' : ''}</b></Link><small>{luova ? '🎨' : '💪'} {e.sport} · {e.minutes} min{e.created ? ` · klo ${clock(e.created)}` : ''}</small></span>
                  {t && <ReactButton target={t} names={names(t)} mine={reacted(t)} own={f.mine} comments={commentsOf(t)} />}
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
