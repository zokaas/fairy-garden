import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden, loadRaw } from '@/lib/data';
import { dayBefore, helsinkiDay, kindOf, weekStart } from '@/lib/garden';
import Avatar from '@/components/Avatar';

export const dynamic = 'force-dynamic';

const WD = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];
const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const clock = (iso?: string) => (iso ? new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '');

export default async function Tekemiset() {
  if (!cookies().get('fg_token')) redirect('/');
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

  const groups: { day: string; items: typeof entries }[] = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    if (last && last.day === e.day) last.items.push(e);
    else groups.push({ day: e.day, items: [e] });
  }
  const label = (d: string) => (d === today ? 'Tänään' : d === yesterday ? 'Eilen' : `${WD[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${dm(d)}`);

  return (
    <>
      <h1>Kuka teki mitä</h1>
      <p className="sub">Keijujen liikunta- ja luovuuskirjaukset. Kannusta, kun joku on ollut reipas!</p>

      <section className="card">
        <div className="tiles">
          <div><b>{thisWeek.length}</b><span>kirjausta tällä viikolla</span></div>
          <div><b>{doers} / {board.length}</b><span>keijua on kirjannut</span></div>
          <div><b>{topSport ? topSport[0] : '–'}</b><span>suosituin laji</span>{topSport && <small>{topSport[1]} kertaa</small>}</div>
        </div>
      </section>

      {groups.length === 0 ? (
        <section className="card"><p className="muted">Ei vielä kirjauksia. Ensimmäinen kirjaus tulee tähän näkyviin.</p></section>
      ) : groups.map((g) => (
        <section key={g.day} className="card">
          <h2>{label(g.day)}</h2>
          <ul className="plain feed">
            {g.items.map((e, i) => {
              const f = who.get(e.fairy_id)!;
              const luova = kindOf(e.sport) === 'luova';
              return (
                <li key={`${e.fairy_id}-${e.day}-${i}`} className={f.mine ? 'me' : ''}>
                  <Avatar a={f} size={36} stage={f.stageIdx} />
                  <span className="fd-t"><b>{f.name}{f.mine ? ' (sinä)' : ''}</b><small>{luova ? '🎨' : '💪'} {e.sport} · {e.minutes} min{e.created ? ` · klo ${clock(e.created)}` : ''}</small></span>
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
