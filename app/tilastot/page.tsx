import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden, loadRaw } from '@/lib/data';
import { ACTIVE_DAY, DAILY_GOAL, helsinkiDay, sportBonus, stepPoints, weekStart } from '@/lib/garden';
import { TEAMS } from '@/lib/teams';
import { byDay, route, routeText, daysBetween, km, series, sportStats, sum, trend, weekdayAvg, weeklyMinutes, weeklySteps } from '@/lib/stats';
import BarChart from '@/components/BarChart';
import CountUp from '@/components/CountUp';

export const dynamic = 'force-dynamic';

const fi = (n: number, d = 0) => n.toLocaleString('fi-FI', { maximumFractionDigits: d });
const WD = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
const dm = (day: string) => `${Number(day.slice(8))}.${Number(day.slice(5, 7))}.`;

function Tiles({ items }: { items: [string, string, string?, number?][] }) {
  return (
    <div className="tiles">
      {items.map(([label, value, sub, pct]) => (
        <div key={label}><b><CountUp text={value} /></b><span>{label}</span>{sub && <small>{sub}</small>}{pct !== undefined && <div className="bar"><i style={{ width: `${pct}%` }} /></div>}</div>
      ))}
    </div>
  );
}

export default async function Tilastot({ searchParams }: { searchParams: { nayta?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const [{ board, me }, raw] = await Promise.all([loadGarden(), loadRaw()]);
  if (!me) redirect('/');
  const tab = ['ryhma', 'urheilu'].includes(searchParams.nayta ?? '') ? searchParams.nayta! : 'mina';
  const today = helsinkiDay();
  const wk = weekStart(today);

  const mySteps = raw.steps.filter((r) => r.fairy_id === me.id);
  const myWork = raw.workouts.filter((r) => r.fairy_id === me.id);
  const myDays = byDay(mySteps);
  const activeDays = [...myDays.entries()].filter(([, s]) => s > 0);
  const myTotal = sum(activeDays.map(([, s]) => s));
  const first = activeDays.map(([d]) => d).sort()[0];
  const spanDays = first ? daysBetween(first, today) : 0;
  const best = activeDays.sort((a, b) => b[1] - a[1])[0];
  const goalDays = activeDays.filter(([, s]) => s >= DAILY_GOAL).length;
  const avgActive = activeDays.length ? myTotal / activeDays.length : 0;

  const allDays = byDay(raw.steps);
  const groupTotal = sum(raw.steps.map((r) => r.steps));
  const groupActive = [...allDays.entries()].filter(([, s]) => s > 0);
  const gFirst = groupActive.map(([d]) => d).sort()[0];
  const gSpan = gFirst ? daysBetween(gFirst, today) : 0;
  const gBest = [...groupActive].sort((a, b) => b[1] - a[1])[0];
  const perFairyDay = raw.steps.length ? groupTotal / raw.steps.filter((r) => r.steps > 0).length : 0;

  const tr = trend(mySteps, today);
  const trG = trend(raw.steps, today);
  const wdMe = weekdayAvg(mySteps);
  const wdG = weekdayAvg(raw.steps);
  const bestWd = (a: number[]) => (Math.max(...a) > 0 ? WD[a.indexOf(Math.max(...a))] : '–');

  const mySports = sportStats(myWork);
  const gSports = sportStats(raw.workouts);
  const myMins = sum(myWork.map((w) => w.minutes));
  const gMins = sum(raw.workouts.map((w) => w.minutes));
  const weeksSpan = first || myWork.length ? Math.max(1, Math.ceil(daysBetween(([first, ...myWork.map((w) => w.day)].filter(Boolean) as string[]).sort()[0], today) / 7)) : 1;
  const minsRank = [...board].sort((a, b) => b.mins - a.mins).filter((b) => b.mins > 0);
  const vsGroup = perFairyDay > 0 && avgActive > 0 ? Math.round(((avgActive - perFairyDay) / perFairyDay) * 100) : null;
  const trendTxt = (t: { pct: number | null }) => (t.pct === null ? '–' : `${t.pct > 0 ? '▲' : t.pct < 0 ? '▼' : '='} ${Math.abs(t.pct)} %`);

  const teamRows = TEAMS.map((t) => {
    const ids = new Set(board.filter((f) => f.team === t.id).map((f) => f.id));
    return { ...t, steps: sum(raw.steps.filter((r) => ids.has(r.fairy_id)).map((r) => r.steps)), n: ids.size };
  }).filter((t) => t.n > 0).sort((a, b) => b.steps / b.n - a.steps / a.n);

  return (
    <>
      <h1>Tilastot</h1>
      <div className="seg three">
        <Link href="/tilastot" className={tab === 'mina' ? 'on' : ''}>Minä</Link>
        <Link href="/tilastot?nayta=ryhma" className={tab === 'ryhma' ? 'on' : ''}>Ryhmä</Link>
        <Link href="/tilastot?nayta=urheilu" className={tab === 'urheilu' ? 'on' : ''}>Urheilu</Link>
      </div>

      {tab === 'mina' && (
        <>
          <section className="card">
            <h2>Askeleesi</h2>
            <Tiles items={[
              ['Yhteensä', fi(myTotal)],
              ['Keskiarvo / aktiivinen päivä', fi(avgActive), `${activeDays.length} päivää`],
              ['Keskiarvo / päivä alusta', fi(spanDays ? myTotal / spanDays : 0), `${spanDays} pv`],
              ['Paras päivä', best ? fi(best[1]) : '–', best ? dm(best[0]) : undefined],
              [`Tavoitepäivät (${fi(DAILY_GOAL)}+)`, String(goalDays), activeDays.length ? `${Math.round((goalDays / activeDays.length) * 100)} % päivistä` : undefined],
              ['Putki nyt / ennätys', `${me.streak} / ${me.bestRun}`, `aktiivinen = ${fi(ACTIVE_DAY)}+`],
              ['Matka Helsingistä', `${fi(km(myTotal), 1)} km`, routeText(km(myTotal)), route(km(myTotal)).pct],
            ]} />
          </section>
          <section className="card">
            <h2>Viimeiset 14 päivää</h2>
            <BarChart items={series(mySteps, 14, today).map((d) => ({ label: String(Number(d.day.slice(8))), value: d.steps }))} highlight={13} />
            <p className="muted">Viikkotrendi: viimeiset 7 pv <b>{fi(tr.last)}</b> askelta vs edelliset 7 pv <b>{fi(tr.prev)}</b> ({trendTxt(tr)}).</p>
          </section>
          <section className="card">
            <h2>Viikoittain, 8 viikkoa</h2>
            <BarChart items={weeklySteps(mySteps, 8, wk).map((w) => ({ label: dm(w.day), value: w.steps }))} highlight={7} />
            <p className="muted">Palkki = viikon askeleet (viikko alkaa maanantaina).</p>
          </section>
          <section className="card">
            <h2>Viikonpäivät: keskiarvosi</h2>
            <BarChart items={wdMe.map((v, i) => ({ label: WD[i], value: v }))} highlight={wdMe.indexOf(Math.max(...wdMe))} />
            <p className="muted">Aktiivisin päiväsi: <b>{bestWd(wdMe)}</b>.</p>
          </section>
          <section className="card">
            <h2>Sinä vs ryhmä</h2>
            <Tiles items={[
              ['Sinun keskiarvo / pv', fi(avgActive)],
              ['Ryhmän keskiarvo / keiju-pv', fi(perFairyDay)],
              ['Ero', vsGroup === null ? '–' : `${vsGroup > 0 ? '+' : ''}${vsGroup} %`],
              ['Sijasi (kaikki pisteet)', `${board.findIndex((b) => b.mine) + 1} / ${board.length}`],
            ]} />
          </section>
        </>
      )}

      {tab === 'ryhma' && (
        <>
          <section className="card">
            <h2>Koko puutarha</h2>
            <Tiles items={[
              ['Askeleet yhteensä', fi(groupTotal)],
              ['Ryhmän matka Helsingistä', `${fi(km(groupTotal))} km`, routeText(km(groupTotal)), route(km(groupTotal)).pct],
              ['Keskiarvo / keiju-pv', fi(perFairyDay)],
              ['Keskiarvo / keiju yhteensä', fi(board.length ? groupTotal / board.length : 0)],
              ['Ennätyspäivä (ryhmä)', gBest ? fi(gBest[1]) : '–', gBest ? dm(gBest[0]) : undefined],
              ['Tänään yhteensä', fi(allDays.get(today) ?? 0)],
              ['Aktiivisia tänään', `${board.filter((b) => b.today >= ACTIVE_DAY).length} / ${board.length}`],
              [`${fi(DAILY_GOAL)}+ päivät`, String(raw.steps.filter((r) => r.steps >= DAILY_GOAL).length)],
              ['Putkien keskiarvo', fi(board.length ? sum(board.map((b) => b.streak)) / board.length : 0, 1)],
              ['Päiviä alusta', String(gSpan)],
              ['Pisteet yhteensä', fi(sum(board.map((b) => b.pts)))],
            ]} />
          </section>
          <section className="card">
            <h2>Ryhmän askeleet, 14 pv</h2>
            <BarChart items={series(raw.steps, 14, today).map((d) => ({ label: String(Number(d.day.slice(8))), value: d.steps }))} highlight={13} />
            <p className="muted">Viikkotrendi: {fi(trG.last)} vs {fi(trG.prev)} askelta ({trendTxt(trG)}).</p>
          </section>
          <section className="card">
            <h2>Viikonpäivät: ryhmän keskiarvo</h2>
            <BarChart items={wdG.map((v, i) => ({ label: WD[i], value: v }))} highlight={wdG.indexOf(Math.max(...wdG))} />
            <p className="muted">Ryhmän aktiivisin päivä: <b>{bestWd(wdG)}</b>.</p>
          </section>
          {teamRows.length > 0 && (
            <section className="card">
              <h2>Joukkueet</h2>
              <Tiles items={teamRows.map((t) => [`${t.emoji} ${t.name}`, fi(t.steps / t.n), `${fi(t.steps)} yht. · ${t.n} jäsentä`])} />
              <p className="muted">Luku = askelia / jäsen.</p>
            </section>
          )}
        </>
      )}

      {tab === 'urheilu' && (
        <>
          <section className="card">
            <h2>Oma liikuntasi</h2>
            <Tiles items={[
              ['Minuutit yhteensä', fi(myMins)],
              ['Kertoja', String(myWork.length)],
              ['Keskimäärin / kerta', `${fi(myWork.length ? myMins / myWork.length : 0)} min`],
              ['Keskimäärin / viikko', `${fi(myMins / weeksSpan)} min`],
              ['Lempilaji', mySports[0]?.sport ?? '–', mySports[0] ? `${mySports[0].minutes} min` : undefined],
              ['Urheilubonus', `${sportBonus(myTotal, myMins)} p`, `askelpisteet ${stepPoints(myTotal)} p (bonus 1 p / 30 min, max 15 %)`],
            ]} />
            {mySports.length > 0 && <BarChart items={mySports.slice(0, 6).map((s) => ({ label: s.sport, value: s.minutes }))} unit=" min" height={120} />}
            <h2 style={{ marginTop: 14 }}>Viikoittain (min), 8 viikkoa</h2>
            <BarChart items={weeklyMinutes(myWork, 8, wk).map((w) => ({ label: dm(w.day), value: w.minutes }))} highlight={7} />
          </section>
          <section className="card">
            <h2>Ryhmän liikunta</h2>
            <Tiles items={[
              ['Minuutit yhteensä', fi(gMins)],
              ['Kertoja', String(raw.workouts.length)],
              ['Keskimäärin / kerta', `${fi(raw.workouts.length ? gMins / raw.workouts.length : 0)} min`],
              ['Keskimäärin / keiju', `${fi(board.length ? gMins / board.length : 0)} min`],
              ['Suosituin laji', gSports[0]?.sport ?? '–', gSports[0] ? `${gSports[0].sessions} kertaa` : undefined],
              ['Tänään yhteensä', `${fi(sum(raw.workouts.filter((w) => w.day === today).map((w) => w.minutes)))} min`],
            ]} />
            {gSports.length > 0 && <BarChart items={gSports.slice(0, 6).map((s) => ({ label: s.sport, value: s.minutes }))} unit=" min" height={120} />}
            {gSports.length > 0 && (
              <ul className="plain" style={{ marginTop: 10 }}>
                {gSports.map((s) => <li key={s.sport}><b>{s.sport}</b>: {s.sessions} kertaa, {fi(s.minutes)} min, keskim. {fi(s.minutes / s.sessions)} min</li>)}
              </ul>
            )}
            <h2 style={{ marginTop: 14 }}>Ryhmän viikoittain (min)</h2>
            <BarChart items={weeklyMinutes(raw.workouts, 8, wk).map((w) => ({ label: dm(w.day), value: w.minutes }))} highlight={7} />
          </section>
          {minsRank.length > 0 && (
            <section className="card">
              <h2>Liikuntakärki</h2>
              <ol className="rank">
                {minsRank.slice(0, 10).map((b, i) => (
                  <li key={b.id} className={b.mine ? 'me' : ''}><span className="pos">{i + 1}</span><span className="nm"><span>{b.name}<small>{b.workouts} kertaa</small></span></span><span className="pt">{fi(b.mins)} min</span></li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
      <p className="muted" style={{ textAlign: 'center' }}>Matka = askeleet × 0,75 m (arvio).</p>
    </>
  );
}
