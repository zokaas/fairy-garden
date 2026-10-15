import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { WEEK_GOAL } from '@/lib/weekly';
import WorkoutForm from '@/components/WorkoutForm';
import { db } from '@/lib/db';
import { DEMO } from '@/lib/demo';
import { CREATIVE_WEEK_CAP, dayBefore, helsinkiDay, inContest, kindOf, loggableDays } from '@/lib/garden';
import { addManualSteps, deleteWorkout, logWorkout } from '../actions';
import { MANUAL_STEPS_MAX } from '@/lib/manual';

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
  const WDN = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
  const todayD = helsinkiDay();
  const dayOptions = loggableDays().map((d) => ({
    value: d,
    label: d === todayD ? 'Tänään' : d === dayBefore(todayD) ? 'Eilen' : `${WDN[new Date(`${d}T12:00:00Z`).getUTCDay()]} ${dm(d)}`,
  }));
  // Käsin voi kirjata vain päivän, jolla ei ole yhtään askelta (eilisestä 7 päivää taaksepäin).
  let haveSteps = new Set<string>();
  if (me && !DEMO) {
    const { data } = await db().from('steps').select('day, steps').eq('fairy_id', me.id).in('day', dayOptions.map((d) => d.value));
    haveSteps = new Set((data ?? []).filter((r) => (r.steps as number) > 0).map((r) => r.day as string));
  }
  const missingDays = dayOptions.filter((d) => d.value !== todayD && !haveSteps.has(d.value));
  return (
    <>
      <h1>Kirjaa</h1>
      {searchParams.ok && <p className="toast">{({ poistettu: 'Kirjaus poistettu', askeleet: 'Askeleet tallennettu ✏️', 'askeleet-pienempi': 'Päivällä on jo askelia, joten mitään ei muutettu.', 'askeleet-virhe': 'Tarkista päivä ja askelmäärä.' } as Record<string, string>)[searchParams.ok] ?? 'Kirjattu'}</p>}

      <section className="card">
        <h2>Lisää kirjaus</h2>
        <WorkoutForm action={logWorkout} days={dayOptions} />
        <p className="muted" style={{ margin: '6px 0 0' }}>Voit kirjata tähän päivään tai enintään 7 päivää taaksepäin.</p>
        <p className="muted">Luovasta saa pisteitä enintään 2 h viikossa (kirjata voi enemmänkin). Kaikki säännöt: <Link href="/ohje">Näin kisa toimii →</Link></p>
      </section>

      <details className="card">
        <summary><b>Askeleet käsin</b> <small className="muted">(jos synkka ei toimi)</small></summary>
        {missingDays.length === 0 ? (
          <p className="muted" style={{ marginTop: 12 }}>Ei puuttuvia päiviä: kaikilla viimeisen 7 päivän päivillä on jo askelia.</p>
        ) : (
          <form action={addManualSteps} style={{ marginTop: 12 }}>
            <label htmlFor="ms-day">Päivä, jolta askeleet puuttuvat</label>
            <select id="ms-day" name="day" defaultValue={missingDays[0]?.value}>
              {missingDays.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <label htmlFor="ms-steps">Askelmäärä päivältä (Terveys-sovelluksen luku)</label>
            <input id="ms-steps" name="steps" type="number" inputMode="numeric" min={1} max={MANUAL_STEPS_MAX} placeholder="esim. 8200" required />
            <button className="btn">Tallenna askeleet</button>
          </form>
        )}
        <p className="muted">Käytä vain, jos synkka ei onnistu. Voit kirjata vain päivän, jolta ei ole yhtään askelta (eilisestä 7 päivää taaksepäin), enintään {MANUAL_STEPS_MAX.toLocaleString('fi-FI')} askelta. Käsin kirjattu päivä näkyy kaikille ✏️-merkillä. Jos synkka tuo luvun myöhemmin, se korvaa käsin kirjatun.</p>
      </details>

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
