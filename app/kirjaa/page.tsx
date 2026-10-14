import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { WEEK_GOAL } from '@/lib/weekly';
import WorkoutForm from '@/components/WorkoutForm';
import { db } from '@/lib/db';
import { DEMO } from '@/lib/demo';
import { CREATIVE_WEEK_CAP, dayBefore, helsinkiDay, inContest, kindOf } from '@/lib/garden';
import { deleteWorkout, logWorkout } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Kirjaa({ searchParams }: { searchParams: { ok?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const { me } = await loadGarden();
  let mine: { id: string; day: string; sport: string; minutes: number }[] = [];
  if (me && !DEMO) {
    let oldest = helsinkiDay();
    for (let i = 0; i < 7; i++) oldest = dayBefore(oldest);
    const { data } = await db().from('workouts').select('id, day, sport, minutes').eq('fairy_id', me.id).gte('day', oldest).order('day', { ascending: false }).order('created_at', { ascending: false }).limit(30);
    mine = (data ?? []).filter((w) => inContest(w.day)) as typeof mine;
  }
  const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
  return (
    <>
      <h1>Liikunta ja luovuus</h1>
      {searchParams.ok && <p className="toast">{searchParams.ok === 'poistettu' ? 'Kirjaus poistettu' : 'Kirjattu'}</p>}

      <section className="card">
        <h2>Lisää kirjaus</h2>
        <WorkoutForm action={logWorkout} />
        <p className="muted">Luovasta saa pisteitä enintään 2 h viikossa (kirjata voi enemmänkin). Kaikki säännöt: <Link href="/ohje">Näin kisa toimii →</Link></p>
      </section>

      {me && (
        <p className="muted" style={{ marginTop: -4 }}>Luova tällä viikolla pisteisiin: <b>{CREATIVE_WEEK_CAP - me.creativeLeft} / {CREATIVE_WEEK_CAP} min</b>{me.creativeLeft === 0 ? ' (katto täynnä, lisäminuutit eivät enää kerrytä pisteitä)' : ''}</p>
      )}

      {mine.length > 0 && (
        <section className="card">
          <h2>Omat kirjauksesi</h2>
          <p className="muted">Viimeiset 7 päivää. Jos kirjasit väärin, poista kirjaus ja lisää se uudelleen.</p>
          <ul className="plain mylog">
            {mine.map((w) => (
              <li key={w.id}>
                <span>{kindOf(w.sport) === 'luova' ? '🎨' : '💪'} <b>{w.sport}</b> · {w.minutes} min<small>{dm(w.day)}</small></span>
                <form action={deleteWorkout}><input type="hidden" name="id" value={w.id} /><button className="btn ghost" aria-label={`Poista ${w.sport}`}>Poista</button></form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {me && (
        <section className="card">
          <h2>Tämän viikon tavoite</h2>
          <ul className="plain">
            <li>Urheilupäiviä <b>{me.goal.sportDays} / {WEEK_GOAL.sportDays}</b> (esim. sali, juoksu, jooga, tanssi, tennis, hiihto, uinti…)</li>
            <li>Luova päivä <b>{me.goal.creativeDays} / {WEEK_GOAL.creativeDays}</b> (esim. piirtäminen, lukeminen, sudoku, ristikot, virkkaaminen, soittaminen…)</li>
          </ul>
        </section>
      )}
    </>
  );
}
