import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { WEEK_GOAL } from '@/lib/weekly';
import WorkoutForm from '@/components/WorkoutForm';
import { logWorkout } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Kirjaa({ searchParams }: { searchParams: { ok?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const { me } = await loadGarden();
  return (
    <>
      <h1>Liikunta ja luovuus</h1>
      {searchParams.ok && <p className="toast">Kirjattu</p>}

      <section className="card">
        <h2>Lisää kirjaus</h2>
        <WorkoutForm action={logWorkout} />
        <p className="muted">1 piste / 30 min (0,5 p / 15 min). Urheilu on rajatonta, luovasta saa pisteitä enintään 2 h viikossa (kirjata voi enemmänkin). Kävely ratkaisee silti eniten: se kirjautuu itsestään askelista.</p>
      </section>

      {me && (
        <section className="card">
          <h2>Tämän viikon tavoite</h2>
          <ul className="plain">
            <li>Urheilupäiviä <b>{me.goal.sportDays} / {WEEK_GOAL.sportDays}</b> (sali, lenkkeily, laskettelu, hiihto, lentopallo, tribe, pilates, tennis…)</li>
            <li>Luova päivä <b>{me.goal.creativeDays} / {WEEK_GOAL.creativeDays}</b> (piirtäminen, virkkaaminen, lukeminen, soittaminen, ompelu…)</li>
          </ul>
        </section>
      )}
    </>
  );
}
