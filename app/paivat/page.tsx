import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden, loadRaw } from '@/lib/data';
import { CONTEST_START, dayBefore, helsinkiDay, kindOf, sportPoints, stepPoints, weekStart } from '@/lib/garden';
import { WEEK_GOAL, dayFlowers } from '@/lib/weekly';
import { byDay } from '@/lib/stats';
import TekemisetView from '@/components/TekemisetView';
import { loadManualDays } from '@/lib/manual';

export const dynamic = 'force-dynamic';

const WD = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
const fi = (n: number) => n.toLocaleString('fi-FI');
const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const wdOf = (d: string) => WD[new Date(`${d}T12:00:00Z`).getUTCDay()];

export default async function Paivat({ searchParams }: { searchParams: { nakyma?: string; paivia?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const all = searchParams.nakyma === 'kaikki';
  const tabs = (
    <div className="seg" role="tablist">
      <Link role="tab" aria-selected={!all} className={!all ? 'on' : ''} href="/paivat">Minä</Link>
      <Link role="tab" aria-selected={all} className={all ? 'on' : ''} href="/paivat?nakyma=kaikki">Kaikki</Link>
    </div>
  );
  if (all) return <><h1>Päivät</h1>{tabs}<TekemisetView paivia={searchParams.paivia} /></>;
  const [{ me }, raw] = await Promise.all([loadGarden(), loadRaw()]);
  if (!me) redirect('/');
  const manual = await loadManualDays();
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
    const sportNames = [...new Set(sport.map((x) => x.sport))].join(', ');
    const creativeNames = [...new Set(creative.map((x) => x.sport))].join(', ');
    const parts: string[] = [];
    if (!(steps >= target) && day === today) parts.push(`Vielä ${fi(target - steps)} askelta kukkaan`);
    else if (!(steps >= target) && steps > 0) parts.push(`kukka jäi ${fi(target - steps)} askeleen päähän`);
    if (stepPoints(steps) > 0) parts.push(`${stepPoints(steps)} p askelista`);
    if (sportMins > 0) parts.push(`💪 ${sportNames} ${sportMins} min · ${String(sportPoints(sportMins)).replace('.', ',')} p`);
    const cMins = creative.reduce((a, x) => a + x.minutes, 0);
    if (cMins > 0) parts.push(`🎨 ${creativeNames} ${cMins} min`);
    return { parts, day, steps, target, flowerN: dayFlowers(steps, target), flower: steps >= target };
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

  return (
    <>
      <h1>Päivät</h1>
      {tabs}
      <p className="sub">Omat askeleesi ja liikuntasi päivä kerrallaan kisan alusta.</p>

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
        const wFlowers = w.rows.reduce((a, r) => a + r.flowerN, 0);
        return (
          <section key={w.wk} className="card">
            <h2>Viikko {dm(w.wk)}<small className="muted" style={{ marginLeft: 8 }}>{fi(total)} askelta{wFlowers > 0 ? ` · 🌸 ${wFlowers}` : ''}</small></h2>
            <ul className="daylist">
              {w.rows.map((r) => (
                <li key={r.day} className={r.day === today ? 'today' : ''}>
                  <span className="dl-d"><b>{wdOf(r.day)}</b> {dm(r.day)}{r.day === today && <small> tänään</small>}</span>
                  <span className="dl-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (r.steps / r.target) * 100)}%` }} className={r.flower ? 'ok' : ''} /></span>
                  <span className="dl-s"><b>{fi(r.steps)}</b>{manual.has(`${me.id}|${r.day}`) ? ' ✏️' : ''}{r.flowerN > 0 ? ` ${'🌸'.repeat(Math.min(r.flowerN, 4))}${r.flowerN > 4 ? `×${r.flowerN}` : ''}` : ''}</span>
                  <span className="dl-x">{r.parts.length ? r.parts.join(' · ') : <span className="muted">{r.day === today ? 'ei vielä kirjauksia' : 'ei kirjauksia'}</span>}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="muted">✏️ = käsin kirjattu. Palkki täyttyy päivän tavoitteeseen (10 000 askelta, urheilupäivänä 7 000). 🌸 = päivän kukka, ja jokainen täysi 10 000 askelta tavoitteen yli tuo lisäkukan.</p>
      <Link className="btn ghost" href="/tilastot">Tilastot</Link>
    </>
  );
}
