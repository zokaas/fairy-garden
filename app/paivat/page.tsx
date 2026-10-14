import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden, loadRaw } from '@/lib/data';
import { CONTEST_START, dayBefore, helsinkiDay, kindOf, sportPoints, stepPoints, weekStart } from '@/lib/garden';
import { WEEK_GOAL, dayFlowers } from '@/lib/weekly';
import { byDay } from '@/lib/stats';

export const dynamic = 'force-dynamic';

const WD = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
const fi = (n: number) => n.toLocaleString('fi-FI');
const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const wdOf = (d: string) => WD[new Date(`${d}T12:00:00Z`).getUTCDay()];

export default async function Paivat() {
  if (!cookies().get('fg_token')) redirect('/');
  const [{ me }, raw] = await Promise.all([loadGarden(), loadRaw()]);
  if (!me) redirect('/');
  const mySteps = byDay(raw.steps.filter((r) => r.fairy_id === me.id));
  const myWork = raw.workouts.filter((r) => r.fairy_id === me.id);

  const today = helsinkiDay();
  const days: string[] = [];
  for (let d = today; d >= CONTEST_START; d = dayBefore(d)) days.push(d);

  const rows = days.map((day) => {
    const steps = mySteps.get(day) ?? 0;
    const w = myWork.filter((x) => x.day === day);
    const sport = w.filter((x) => kindOf(x.sport) === 'urheilu');
    const creative = w.filter((x) => kindOf(x.sport) === 'luova');
    const sportMins = sport.reduce((a, x) => a + x.minutes, 0);
    const target = sportMins > 0 ? WEEK_GOAL.stepsSportDay : WEEK_GOAL.stepsRestDay;
    return { day, steps, target, flowerN: dayFlowers(steps, target), flower: steps >= target, stepPts: stepPoints(steps), sportMins, sportPts: sportPoints(sportMins), creativeMins: creative.reduce((a, x) => a + x.minutes, 0), names: w.map((x) => x.sport) };
  });
  const totalSteps = rows.reduce((a, r) => a + r.steps, 0);
  const flowers = rows.reduce((a, r) => a + r.flowerN, 0);
  const done = rows.filter((r) => r.day < today);
  const avg = done.length ? Math.round(done.reduce((a, r) => a + r.steps, 0) / done.length) : 0;
  const best = rows.reduce((a, r) => (r.steps > a.steps ? r : a), rows[0] ?? { steps: 0, day: today });

  // viikkojen ryhmittely (uusin ensin)
  const weeks: { wk: string; rows: typeof rows }[] = [];
  for (const r of rows) {
    const wk = weekStart(r.day);
    const last = weeks[weeks.length - 1];
    if (last && last.wk === wk) last.rows.push(r);
    else weeks.push({ wk, rows: [r] });
  }
  const maxSteps = Math.max(1, ...rows.map((r) => Math.max(r.steps, r.target)));

  return (
    <>
      <h1>Päivä päivältä</h1>
      <p className="sub">Omat askeleesi ja liikuntasi kisan alusta.</p>

      <section className="card">
        <div className="tiles">
          <div><b>{fi(totalSteps)}</b><span>askelta yhteensä</span></div>
          <div><b>{flowers}</b><span>kukkaa 🌸</span></div>
          <div><b>{fi(avg)}</b><span>ka. päivässä</span><small>täydet päivät</small></div>
          <div><b>{fi(best.steps)}</b><span>paras päivä</span><small>{dm(best.day)}</small></div>
        </div>
      </section>

      {weeks.map((w) => {
        const total = w.rows.reduce((a, r) => a + r.steps, 0);
        return (
          <section key={w.wk} className="card">
            <h2>Viikko {dm(w.wk)}<small className="muted" style={{ marginLeft: 8 }}>{fi(total)} askelta</small></h2>
            <ul className="daylist">
              {w.rows.map((r) => (
                <li key={r.day} className={r.day === today ? 'today' : ''}>
                  <span className="dl-d"><b>{wdOf(r.day)}</b> {dm(r.day)}{r.day === today && <small> tänään</small>}</span>
                  <span className="dl-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (r.steps / maxSteps) * 100)}%` }} className={r.flower ? 'ok' : ''} /><u style={{ left: `${Math.min(100, (r.target / maxSteps) * 100)}%` }} /></span>
                  <span className="dl-s"><b>{fi(r.steps)}</b>{r.flowerN > 0 ? ` ${'🌸'.repeat(Math.min(r.flowerN, 4))}${r.flowerN > 4 ? `×${r.flowerN}` : ''}` : ''}</span>
                  <span className="dl-x">
                    {r.stepPts > 0 && <>{r.stepPts} p askelista</>}
                    {r.sportMins > 0 && <>{r.stepPts > 0 ? ' · ' : ''}💪 {r.sportMins} min</>}
                    {r.creativeMins > 0 && <>{r.stepPts > 0 || r.sportMins > 0 ? ' · ' : ''}🎨 {r.creativeMins} min</>}
                    {r.stepPts === 0 && r.sportMins === 0 && r.creativeMins === 0 && <span className="muted">ei pisteitä</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="muted">Pystyviiva palkissa on päivän tavoite (10 000, urheilupäivänä 7 000). 🌸 = päivän kukka. Jokainen täysi 10 000 askelta tavoitteen yli tuo lisäkukan.</p>
      <Link className="btn ghost" href="/tilastot">Lisää tilastoja</Link>
    </>
  );
}
