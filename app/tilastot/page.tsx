import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden, loadRaw } from '@/lib/data';
import { ACTIVE_DAY, DAILY_GOAL, creativePointsOf, fp, helsinkiDay, kindOf, sportPoints, stepPoints, weekStart, workoutPoints } from '@/lib/garden';
import { goalHistory, WEEK_GOAL } from '@/lib/weekly';
import { timeOfDay } from '@/lib/stats';
import { byDay, daysBetween, km, series, sportStats, sum, trend, weekdayAvg, weeklyMinutes, weeklySteps, bestOf, cumulative, heatCells, monthly, movingAvg, pointsOverTime, stepBuckets, weekdayVsWeekend, weeklyTotals } from '@/lib/stats';
import BarChart from '@/components/BarChart';
import CountUp from '@/components/CountUp';
import LineChart from '@/components/LineChart';
import Heatmap from '@/components/Heatmap';
import Donut from '@/components/Donut';
import Avatar from '@/components/Avatar';

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

type Who = 'me' | 'group' | 'mix';
const SCOPE: Record<Who, string> = { me: 'Sinä', group: 'Ryhmä', mix: 'Sinä vs ryhmä' };
function Scope({ who }: { who: Who }) {
  return <span className={`scope ${who}`}>{SCOPE[who]}</span>;
}

/** Vierekkäinen vertailu: sinun luku, ryhmän keskiarvo ja ero. */
function Compare({ rows }: { rows: { label: string; me: number; group: number; fmt?: (v: number) => string }[] }) {
  return (
    <table className="cmp">
      <thead><tr><th></th><th className="c-me">Sinä</th><th className="c-gr">Ryhmä ka.</th><th>Ero</th></tr></thead>
      <tbody>
        {rows.map((r) => {
          const f = r.fmt ?? ((v: number) => fi(v));
          const pct = r.group > 0 ? Math.round(((r.me - r.group) / r.group) * 100) : null;
          return (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className="c-me">{f(r.me)}</td>
              <td className="c-gr">{f(r.group)}</td>
              <td className={pct === null ? '' : pct >= 0 ? 'up' : 'down'}>{pct === null ? '–' : `${pct >= 0 ? '+' : '−'}${Math.abs(pct)} %`}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default async function Tilastot({ searchParams }: { searchParams: { nayta?: string; vs?: string; jakso?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const [{ board, me }, rawFull] = await Promise.all([loadGarden(), loadRaw()]);
  if (!me) redirect('/');
  // Aikajakso: 7 pv, 30 pv tai koko kausi (0). Rajaa kaikki laskettavat rivit; ennätykset ja vertailu käyttävät koko kautta.
  const jakso = searchParams.jakso === '7' ? 7 : searchParams.jakso === '30' ? 30 : 0;
  const cutoff = jakso ? series([], jakso, helsinkiDay())[0].day : '0000-00-00';
  const raw = { steps: rawFull.steps.filter((r) => r.day >= cutoff), workouts: rawFull.workouts.filter((r) => r.day >= cutoff), cheers: rawFull.cheers.filter((r) => r.day >= cutoff) };
  const J = jakso ? `&jakso=${jakso}` : '';
  const tab = ['mina', 'ryhma', 'urheilu', 'vertailu', 'ennatykset'].includes(searchParams.nayta ?? '') ? searchParams.nayta! : 'yhteenveto';
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

  const avgBoard = (get: (f: (typeof board)[number]) => number) => (board.length ? sum(board.map(get)) / board.length : 0);
  const cmpRows = [
    { label: 'Askelia / kävelypäivä', me: avgActive, group: perFairyDay },
    { label: 'Pisteet', me: me.pts, group: avgBoard((f) => f.pts), fmt: (v: number) => fp(v) },
    { label: 'Askeleet yhteensä', me: me.totalSteps, group: avgBoard((f) => f.totalSteps) },
    { label: 'Viikon askeleet', me: me.week.steps, group: avgBoard((f) => f.week.steps) },
    { label: 'Liikunta ja luova (min)', me: me.mins, group: avgBoard((f) => f.mins) },
  ];

  const tr = trend(mySteps, today);
  const trG = trend(raw.steps, today);
  const wdMe = weekdayAvg(mySteps);
  const wdG = weekdayAvg(raw.steps);
  const bestWd = (a: number[]) => (Math.max(...a) > 0 ? WD[a.indexOf(Math.max(...a))] : '–');

  const isCr = (w: { sport: string }) => kindOf(w.sport) === 'luova';
  const mySportW = myWork.filter((w) => !isCr(w));
  const myCreW = myWork.filter(isCr);
  const gSportW = raw.workouts.filter((w) => !isCr(w));
  const gCreW = raw.workouts.filter(isCr);
  const mySports = sportStats(mySportW);
  const gSports = sportStats(gSportW);
  const myMins = sum(mySportW.map((w) => w.minutes));
  const gMins = sum(gSportW.map((w) => w.minutes));
  const myCreMins = sum(myCreW.map((w) => w.minutes));
  const gCreMins = sum(gCreW.map((w) => w.minutes));
  const weeksSpan = first || myWork.length ? Math.max(1, Math.ceil(daysBetween(([first, ...myWork.map((w) => w.day)].filter(Boolean) as string[]).sort()[0], today) / 7)) : 1;
  const minsRank = [...board].sort((a, b) => b.sportMins - a.sportMins).filter((b) => b.sportMins > 0);
  const vsGroup = perFairyDay > 0 && avgActive > 0 ? Math.round(((avgActive - perFairyDay) / perFairyDay) * 100) : null;
  const trendTxt = (t: { pct: number | null }) => (t.pct === null ? '–' : `${t.pct > 0 ? '▲' : t.pct < 0 ? '▼' : '='} ${Math.abs(t.pct)} %`);


  // ===== Laajemmat laskelmat =====
  const MONTHS = ['tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä', 'heinä', 'elo', 'syys', 'loka', 'marras', 'joulu'];
  const nameOf: Record<string, string> = Object.fromEntries(board.map((b) => [b.id, b.name]));
  const wdIdx = (day: string) => (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
  const lastDays = (n: number, since?: string) => {
    const d = series([], n, today).map((x) => x.day).filter((x) => !since || x >= since);
    return d.length >= 2 ? d : series([], 2, today).map((x) => x.day);
  };
  const daily = (rows: { day: string; steps: number }[], days: string[]) => { const m = byDay(rows); return days.map((d) => m.get(d) ?? 0); };
  const dm2 = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
  const days60 = lastDays(60, first);
  const days45 = lastDays(45, first);
  const leader = [...board].sort((a, b) => b.totalSteps - a.totalSteps)[0];
  const wdwe = weekdayVsWeekend(mySteps);
  const myWeeks = weeklyTotals(mySteps);
  const bestWeek = bestOf(myWeeks);
  const avgWeek = myWeeks.size ? sum([...myWeeks.values()]) / myWeeks.size : 0;
  const myMonths = monthly(mySteps, myWork);
  const wdMinutes = (rows: { day: string; minutes: number }[]) => { const a = Array(7).fill(0); rows.forEach((r) => { a[wdIdx(r.day)] += r.minutes; }); return a as number[]; };
  const sportLeaders = gSports.map((sp) => {
    const per = new Map<string, number>();
    gSportW.filter((w) => w.sport === sp.sport).forEach((w) => per.set(w.fairy_id, (per.get(w.fairy_id) ?? 0) + w.minutes));
    const top = [...per.entries()].sort((a, b) => b[1] - a[1])[0];
    return { sport: sp.sport, who: top ? nameOf[top[0]] : '–', mins: top ? top[1] : 0, total: sp.minutes };
  });

  // ===== Viikkotavoitteen historia (koko kausi) =====
  const forFairy = (id: string) => goalHistory(rawFull.steps.filter((r) => r.fairy_id === id), rawFull.workouts.filter((r) => r.fairy_id === id), today);
  const histMe = forFairy(me.id);
  const histAll = board.map((b) => forFairy(b.id));
  const weekKeys = Array.from(new Set(histAll.flat().map((h) => h.week))).sort();
  const groupRate = (week: string) => { const have = histAll.filter((h) => h.some((x) => x.week === week)); const ok = have.filter((h) => h.find((x) => x.week === week)!.g.done).length; return have.length ? Math.round((ok / have.length) * 100) : 0; };
  const thisWeekKey = weekStart(today);
  const histCard = (
    <section className="card">
      <h2>Viikkotavoite viikko viikolta<Scope who="me" /></h2>
      {histMe.length === 0 ? <p className="muted">Historia ilmestyy, kun ensimmäinen viikko on kirjattu.</p> : (
        <ul className="hist">
          {[...histMe].reverse().slice(0, 10).map((h) => (
            <li key={h.week}>
              <span className="hk">vko {Number(h.week.slice(8))}.{Number(h.week.slice(5, 7))}.{h.week === thisWeekKey ? <small>käynnissä</small> : null}</span>
              <span className="pills">
                <i className={h.g.stepsDone ? 'ok' : ''}>askel {Math.min(h.g.stepDaysOk, WEEK_GOAL.stepDays)}/{WEEK_GOAL.stepDays}</i>
                <i className={h.g.sportDone ? 'ok' : ''}>urheilu {h.g.sportDays}/{WEEK_GOAL.sportDays}</i>
                <i className={h.g.creativeDone ? 'ok' : ''}>luova {h.g.creativeDays}/{WEEK_GOAL.creativeDays}</i>
              </span>
              <b className={h.g.done ? 'ok' : ''}>{h.g.done ? '✓' : h.week === thisWeekKey ? '…' : '✗'}</b>
              <small>ryhmä {groupRate(h.week)} %</small>
            </li>
          ))}
        </ul>
      )}
      {weekKeys.length > 1 && (
        <>
          <h2 style={{ marginTop: 14 }}>Ryhmän täyttöprosentti viikoittain<Scope who="group" /></h2>
          <BarChart height={100} unit=" %" items={weekKeys.slice(-10).map((w) => ({ label: `${Number(w.slice(8))}.${Number(w.slice(5, 7))}.`, value: groupRate(w) }))} highlight={weekKeys.slice(-10).length - 1} />
        </>
      )}
    </section>
  );

  return (
    <>
      <h1>Tilastot</h1>
      <div className="seg">
        <Link href={jakso ? `/tilastot?jakso=${jakso}` : '/tilastot'} className={tab === 'yhteenveto' ? 'on' : ''}>Yhteenveto</Link>
        <Link href={`/tilastot?nayta=mina${J}`} className={tab !== 'yhteenveto' ? 'on' : ''}>Lisää tilastoja</Link>
      </div>
      {tab !== 'yhteenveto' && (
        <div className="seg five">
          <Link href={`/tilastot?nayta=mina${J}`} className={tab === 'mina' ? 'on' : ''}>Minä</Link>
          <Link href={`/tilastot?nayta=ryhma${J}`} className={tab === 'ryhma' ? 'on' : ''}>Ryhmä</Link>
          <Link href={`/tilastot?nayta=urheilu${J}`} className={tab === 'urheilu' ? 'on' : ''}>Urheilu</Link>
          <Link href={`/tilastot?nayta=vertailu${J}`} className={tab === 'vertailu' ? 'on' : ''}>Vertailu</Link>
          <Link href={`/tilastot?nayta=ennatykset${J}`} className={tab === 'ennatykset' ? 'on' : ''}>Ennätys</Link>
        </div>
      )}

      {['yhteenveto', 'mina', 'ryhma', 'urheilu'].includes(tab) && (
        <div className="seg">
          {([[7, '7 pv'], [30, '30 pv'], [0, 'Koko kausi']] as [number, string][]).map(([v, label]) => (
            <Link key={v} href={`/tilastot?${tab !== 'yhteenveto' ? `nayta=${tab}&` : ''}${v ? `jakso=${v}` : ''}`.replace(/[?&]$/, '')} className={jakso === v ? 'on' : ''}>{label}</Link>
          ))}
        </div>
      )}
      {['yhteenveto', 'mina', 'ryhma', 'urheilu'].includes(tab) && (
        <p className="scope-legend"><Scope who="me" /> omat lukusi <Scope who="group" /> kaikkien yhteensä tai keskiarvo <Scope who="mix" /> vertailu</p>
      )}
      {tab === 'yhteenveto' && (
        <>
          <section className="card">
            <h2>Sinun kautesi<Scope who="me" /></h2>
            <Tiles items={[
              [jakso ? 'Pisteet (jakso)' : 'Pisteet', `${fp(jakso ? stepPoints(myTotal) + workoutPoints(myWork) : me.pts)} p`, `sija ${board.findIndex((b) => b.mine) + 1} / ${board.length}`],
              ['Askeleet yhteensä', fi(myTotal), `${fi(km(myTotal), 1)} km`],
              ['Paras päivä', best ? fi(best[1]) : '–', best ? dm(best[0]) : undefined],
              ['Putki nyt', `${me.streak} pv`, `ennätys ${me.bestRun} pv`],
              ['Urheilu ja luova', `${fi(sum(myWork.map((w) => w.minutes)))} min`, `${myWork.length} kertaa`],
              ['Kukkia puutarhassa', String(me.flowers), 'päivää, jolloin askeltavoite täyttyi'],
              ['Täysiä viikkoja', String(me.weeksDone), `+${me.bonusPts} p bonusta`],
            ]} />
          </section>
          <section className="card">
            <h2>Viimeiset 14 päivää<Scope who="me" /></h2>
            <BarChart items={series(mySteps, 14, today).map((d) => ({ label: String(Number(d.day.slice(8))), value: d.steps }))} highlight={13} />
            <p className="muted">{trendTxt(tr) === '–' ? 'Kerää lisää dataa nähdäksesi trendin.' : `Viimeiset 7 päivää ${fi(tr.last)} askelta, ${tr.pct !== null && tr.pct >= 0 ? 'enemmän' : 'vähemmän'} kuin edelliset 7 päivää (${trendTxt(tr)}).`}</p>
          </section>
          {histCard}
          <section className="card">
            <h2>Sinä ja ryhmä<Scope who="mix" /></h2>
            <Compare rows={cmpRows} />
            <Link className="btn ghost" href={`/tilastot?nayta=mina${J}`} style={{ marginTop: 12 }}>Lisää tilastoja</Link>
          </section>
        </>
      )}

      {tab === 'mina' && (
        <>
          <section className="card">
            <h2>Askeleesi<Scope who="me" /></h2>
            <Tiles items={[
              ['Yhteensä', fi(myTotal)],
              ['Keskiarvo kävelypäivältä', fi(avgActive), `${activeDays.length} päivää`],
              ['Keskiarvo / päivä alusta', fi(spanDays ? myTotal / spanDays : 0), `${spanDays} pv`],
              ['Paras päivä', best ? fi(best[1]) : '–', best ? dm(best[0]) : undefined],
              [`Tavoitepäivät (${fi(DAILY_GOAL)}+)`, String(goalDays), activeDays.length ? `${Math.round((goalDays / activeDays.length) * 100)} % päivistä` : undefined],
              ['Putki nyt / ennätys', `${me.streak} / ${me.bestRun}`, `hyvä päivä = ${fi(ACTIVE_DAY)}+`],
            ]} />
          </section>
          <section className="card">
            <h2>Viimeiset 14 päivää<Scope who="me" /></h2>
            <BarChart items={series(mySteps, 14, today).map((d) => ({ label: String(Number(d.day.slice(8))), value: d.steps }))} highlight={13} />
            <p className="muted">Viikkotrendi: viimeiset 7 pv <b>{fi(tr.last)}</b> askelta vs edelliset 7 pv <b>{fi(tr.prev)}</b> ({trendTxt(tr)}).</p>
          </section>
          <section className="card">
            <h2>Askelten kertymä (60 pv)<Scope who="mix" /></h2>
            <LineChart
              first={dm2(days60[0])} last={dm2(days60[days60.length - 1])}
              series={[
                { name: 'Minä', values: cumulative(daily(mySteps, days60)) },
                { name: 'Ryhmän ka.', values: cumulative(days60.map((d) => Math.round((allDays.get(d) ?? 0) / Math.max(1, board.length)))) },
                ...(leader && leader.id !== me.id ? [{ name: leader.name, values: cumulative(daily(raw.steps.filter((r) => r.fairy_id === leader.id), days60)) }] : []),
              ]}
            />
          </section>
          <section className="card">
            <h2>Viikon keskiarvo (liukuva)<Scope who="me" /></h2>
            <LineChart first={dm2(days45[0])} last={dm2(days45[days45.length - 1])} series={[{ name: 'Askelia / pv', values: movingAvg(daily(mySteps, days45), 7).map(Math.round), color: '#38bdf8' }]} />
            <p className="muted">Tasoittaa päivittäiset vaihtelut, joten näet onko suunta nouseva.</p>
          </section>
          <section className="card">
            <h2>Päiväkartta (12 viikkoa)<Scope who="me" /></h2>
            <Heatmap cols={heatCells(mySteps, 12, today)} />
          </section>
          <section className="card">
            <h2>Päivien jakauma<Scope who="me" /></h2>
            <BarChart items={stepBuckets(activeDays.map(([, v]) => v)).map((v, i) => ({ label: ['<5k', '5–10k', '10–15k', '15k+'][i], value: v }))} unit=" pv" height={100} />
            <Tiles items={[
              ['Arkipäivän ka.', fi(wdwe.weekday)],
              ['Viikonlopun ka.', fi(wdwe.weekend), wdwe.weekday ? `${wdwe.weekend >= wdwe.weekday ? '+' : '−'}${Math.abs(Math.round(((wdwe.weekend - wdwe.weekday) / wdwe.weekday) * 100))} % arkeen` : undefined],
              ['Paras viikko', bestWeek ? fi(bestWeek.value) : '–', bestWeek ? `vko ${dm2(bestWeek.key)}` : undefined],
              ['Viikon ka.', fi(avgWeek)],
            ]} />
          </section>
          <section className="card">
            <h2>Pisteiden jakauma<Scope who="me" /></h2>
            <Donut items={[{ label: 'Askeleet', value: stepPoints(myTotal) }, { label: 'Urheilu', value: sportPoints(myMins) }, { label: 'Luova', value: creativePointsOf(myCreW) }, { label: 'Viikkotavoite', value: me.bonusPts }]} center={`${fp(me.pts)} p`} unit=" p" />
          </section>
          {myMonths.length > 0 && (
            <section className="card">
              <h2>Kuukausittain<Scope who="me" /></h2>
              <table className="mon">
                <thead><tr><th>Kk</th><th>Askeleet</th><th>Ka / pv</th><th>Urheilu</th></tr></thead>
                <tbody>{myMonths.map((m) => <tr key={m.month}><td>{MONTHS[Number(m.month.slice(5)) - 1]}kuu</td><td>{fi(m.steps)}</td><td>{fi(m.days ? m.steps / m.days : 0)}</td><td>{fi(m.mins)} min</td></tr>)}</tbody>
              </table>
            </section>
          )}
          {histCard}
          <section className="card">
            <h2>Viikoittain, 8 viikkoa<Scope who="me" /></h2>
            <BarChart items={weeklySteps(mySteps, 8, wk).map((w) => ({ label: dm(w.day), value: w.steps }))} highlight={7} />
            <p className="muted">Palkki = viikon askeleet (viikko alkaa maanantaina).</p>
          </section>
          <section className="card">
            <h2>Viikonpäivät: keskiarvosi<Scope who="me" /></h2>
            <BarChart items={wdMe.map((v, i) => ({ label: WD[i], value: v }))} highlight={wdMe.indexOf(Math.max(...wdMe))} />
            <p className="muted">Paras päiväsi: <b>{bestWd(wdMe)}</b>.</p>
          </section>
          <section className="card">
            <h2>Sinä vs ryhmä<Scope who="mix" /></h2>
            <Compare rows={cmpRows} />
            <p className="muted">Sijasi (kaikki pisteet): <b>{board.findIndex((b) => b.mine) + 1} / {board.length}</b>. Ryhmä ka. = kaikkien keijujen keskiarvo.</p>
          </section>
        </>
      )}

      {tab === 'ryhma' && (
        <>
          <section className="card">
            <h2>Koko puutarha<Scope who="group" /></h2>
            <Tiles items={[
              ['Askeleet yhteensä', fi(groupTotal)],
              ['Keskiarvo / keiju-pv', fi(perFairyDay)],
              ['Keskiarvo / keiju yhteensä', fi(board.length ? groupTotal / board.length : 0)],
              ['Tyypillinen / keiju yhteensä', fi((() => { const v = board.map((b) => b.totalSteps).sort((a, b) => a - b); return v.length ? (v[Math.floor((v.length - 1) / 2)] + v[Math.ceil((v.length - 1) / 2)]) / 2 : 0; })())],
              ['Paras keiju (askeleet)', fi(Math.max(0, ...board.map((b) => b.totalSteps)))],
              ['Ennätyspäivä (ryhmä)', gBest ? fi(gBest[1]) : '–', gBest ? dm(gBest[0]) : undefined],
              ['Tänään yhteensä', fi(allDays.get(today) ?? 0)],
              [`${fi(ACTIVE_DAY)}+ askelta tänään`, `${board.filter((b) => b.today >= ACTIVE_DAY).length} / ${board.length}`],
              [`${fi(DAILY_GOAL)}+ päivät`, String(raw.steps.filter((r) => r.steps >= DAILY_GOAL).length)],
              ['Putkien keskiarvo', fi(board.length ? sum(board.map((b) => b.streak)) / board.length : 0, 1)],
              ['Päiviä alusta', String(gSpan)],
              ['Pisteet yhteensä', fi(sum(board.map((b) => b.pts)))],
            ]} />
          </section>
          <section className="card">
            <h2>Ryhmän askeleet, 14 pv<Scope who="group" /></h2>
            <BarChart items={series(raw.steps, 14, today).map((d) => ({ label: String(Number(d.day.slice(8))), value: d.steps }))} highlight={13} />
            <p className="muted">Viikkotrendi: {fi(trG.last)} vs {fi(trG.prev)} askelta ({trendTxt(trG)}).</p>
          </section>
          <section className="card">
            <h2>Kisan kulku: kärki 5<Scope who="group" /></h2>
            <LineChart first={dm2(lastDays(60, gFirst)[0])} last={dm2(today)} fmt={(v) => `${v} p`}
              series={board.slice(0, 5).map((f) => ({ name: f.name, values: pointsOverTime(raw.steps.filter((r) => r.fairy_id === f.id), raw.workouts.filter((r) => r.fairy_id === f.id), lastDays(60, gFirst)) }))} />
            <p className="muted">Kertyvät pisteet päivä päivältä: näet kuka on noussut ja kuka laskenut.</p>
          </section>
          <section className="card">
            <h2>Ryhmän päiväkartta (ka. / keiju)<Scope who="group" /></h2>
            <Heatmap cols={heatCells([...allDays.entries()].map(([day, v]) => ({ day, steps: v / Math.max(1, board.length) })), 12, today)} />
          </section>
          <section className="card">
            <h2>Osallistuminen, 30 pv<Scope who="group" /></h2>
            <BarChart height={100} unit=" %" items={lastDays(30).map((d) => ({ label: String(Number(d.slice(8))), value: Math.round((raw.steps.filter((r) => r.day === d && r.steps >= ACTIVE_DAY).length / Math.max(1, board.length)) * 100) }))} />
            <p className="muted">Kuinka monta prosenttia keijuista käveli vähintään {fi(ACTIVE_DAY)} askelta.</p>
          </section>
          <section className="card">
            <h2>Viikonpäivät: ryhmän keskiarvo<Scope who="group" /></h2>
            <BarChart items={wdG.map((v, i) => ({ label: WD[i], value: v }))} highlight={wdG.indexOf(Math.max(...wdG))} />
            <p className="muted">Ryhmän paras päivä: <b>{bestWd(wdG)}</b>.</p>
          </section>
        </>
      )}

      {tab === 'urheilu' && (
        <>
          <section className="card">
            <h2>Oma liikuntasi<Scope who="me" /></h2>
            <Tiles items={[
              ['Minuutit yhteensä', fi(myMins)],
              ['Kertoja', String(myWork.length)],
              ['Keskimäärin / kerta', `${fi(myWork.length ? myMins / myWork.length : 0)} min`],
              ['Keskimäärin / viikko', `${fi(myMins / weeksSpan)} min`],
              ['Lempilaji', mySports[0]?.sport ?? '–', mySports[0] ? `${mySports[0].minutes} min` : undefined],
              ['Pisteet urheilusta ja luovasta', `${fp(workoutPoints(myWork))} p`, `askelpisteet ${stepPoints(myTotal)} p`],
            ]} />
            {mySports.length > 0 && <BarChart items={mySports.slice(0, 6).map((s) => ({ label: s.sport, value: s.minutes }))} unit=" min" height={120} />}
            <h2 style={{ marginTop: 14 }}>Viikoittain (min), 8 viikkoa<Scope who="me" /></h2>
            <BarChart items={weeklyMinutes(mySportW, 8, wk).map((w) => ({ label: dm(w.day), value: w.minutes }))} highlight={7} />
          </section>
          <section className="card">
            <h2>Ryhmän liikunta<Scope who="group" /></h2>
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
            <h2 style={{ marginTop: 14 }}>Ryhmän viikoittain (min)<Scope who="group" /></h2>
            <BarChart items={weeklyMinutes(gSportW, 8, wk).map((w) => ({ label: dm(w.day), value: w.minutes }))} highlight={7} />
          </section>
          {gSports.length > 0 && (
            <>
              <section className="card">
                <h2>Lajijakauma (ryhmä)<Scope who="group" /></h2>
                <Donut items={gSports.slice(0, 6).map((x) => ({ label: x.sport, value: x.minutes }))} center={`${fi(gMins)} min`} unit=" min" />
              </section>
              <section className="card">
                <h2>Minuutit viikonpäivittäin<Scope who="group" /></h2>
                <BarChart items={wdMinutes(gSportW).map((v, i) => ({ label: WD[i], value: v }))} highlight={wdMinutes(gSportW).indexOf(Math.max(...wdMinutes(gSportW)))} />
                <p className="muted">Sinä: {wdMinutes(mySportW).map((v, i) => `${WD[i]} ${v}`).join(' · ')}</p>
              </section>
              <section className="card">
                <h2>Lajien kärki<Scope who="group" /></h2>
                <ul className="rec">
                  {sportLeaders.map((l) => <li key={l.sport}><span className="rl"><small>{l.sport}</small><b>{l.who}</b></span><span className="rv2">{fi(l.mins)} min<small>yhteensä {fi(l.total)}</small></span></li>)}
                </ul>
              </section>
            </>
          )}
          <section className="card">
            <h2>Omat lajisi<Scope who="me" /></h2>
            {myWork.length === 0 ? <p className="muted">Kirjaa ensimmäinen urheilu tai luova hetki, niin lajijakauma ilmestyy.</p> : (
              <>
                <Donut items={sportStats(myWork).slice(0, 6).map((x) => ({ label: x.sport, value: x.minutes }))} center={`${fi(sum(myWork.map((w) => w.minutes)))} min`} unit=" min" />
                <h2 style={{ marginTop: 14 }}>Milloin kirjaat liikuntasi<Scope who="me" /></h2>
                <BarChart height={90} unit=" min" items={timeOfDay(myWork).map((v, i) => ({ label: ['Aamu', 'Päivä', 'Ilta', 'Yö'][i], value: v }))} />
                <p className="muted">Kirjausajan mukaan (aamu 5–11, päivä 11–17, ilta 17–22, yö 22–5), ei varsinaisen treenin ajan.</p>
              </>
            )}
          </section>
          <section className="card">
            <h2>Luovat harrastukset<Scope who="mix" /></h2>
            <Tiles items={[
              ['Omat minuutit', `${fi(myCreMins)} min`, `${myCreW.length} kertaa`],
              ['Pisteitä vielä tällä viikolla', `${fi(me.creativeLeft)} min`, 'katto 120 min / viikko'],
              ['Ryhmän minuutit', `${fi(gCreMins)} min`, `${gCreW.length} kertaa`],
              ['Suosituin (ryhmä)', sportStats(gCreW)[0]?.sport ?? '–', sportStats(gCreW)[0] ? `${fi(sportStats(gCreW)[0].minutes)} min` : undefined],
              ['Luovia päiviä tällä viikolla', `${board.filter((b) => b.goal.creativeDone).length} / ${board.length}`, 'keijua täyttänyt tavoitteen'],
            ]} />
            {sportStats(gCreW).length > 0 && <BarChart items={sportStats(gCreW).slice(0, 6).map((x) => ({ label: x.sport, value: x.minutes }))} unit=" min" height={110} />}
          </section>
          {minsRank.length > 0 && (
            <section className="card">
              <h2>Liikuntakärki<Scope who="group" /></h2>
              <ol className="rank">
                {minsRank.slice(0, 10).map((b, i) => (
                  <li key={b.id} className={b.mine ? 'me' : ''}><span className="pos">{i + 1}</span><span className="nm"><span>{b.name}<small>{b.workouts} kertaa</small></span></span><span className="pt">{fi(b.sportMins)} min</span></li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      {tab === 'vertailu' && (() => {
        const myIdx = board.findIndex((b) => b.mine);
        const other = board.find((b) => b.id === searchParams.vs && !b.mine) ?? board[myIdx - 1] ?? board[myIdx + 1] ?? null;
        const metrics: { label: string; get: (f: (typeof board)[number]) => number; fmt?: (v: number) => string }[] = [
          { label: 'Pisteet', get: (f) => f.pts },
          { label: 'Askelpisteet', get: (f) => f.stepPts },
          { label: 'Urheilu- ja luovuuspisteet', get: (f) => f.sportPts },
          { label: 'Askeleet yhteensä', get: (f) => f.totalSteps },
          { label: 'Askelia kävelypäivänä', get: (f) => f.avgSteps },
          { label: 'Paras päivä', get: (f) => f.bestDay },
          { label: 'Kävelypäiviä', get: (f) => f.activeDays },
          { label: 'Putki nyt', get: (f) => f.streak },
          { label: 'Ennätysputki', get: (f) => f.bestRun },
          { label: 'Viikon askeleet', get: (f) => f.week.steps },
          { label: 'Urheilu (min)', get: (f) => f.sportMins },
          { label: 'Luova (min)', get: (f) => f.creativeMins },
          { label: 'Urheilukertoja', get: (f) => f.workouts },
          { label: 'Keskim. / kerta (min)', get: (f) => f.avgSession },
        ];
        const avgOf = (get: (f: (typeof board)[number]) => number) => (board.length ? board.reduce((a, f) => a + get(f), 0) / board.length : 0);
        return (
          <>
            <section className="card">
              <h2>Valitse vastustaja</h2>
              <div className="chips" style={{ margin: 0 }}>
                {board.filter((b) => !b.mine).map((b) => (
                  <Link key={b.id} className="chip" style={other?.id === b.id ? { background: 'var(--fg)', color: 'var(--bg)' } : undefined} href={`/tilastot?nayta=vertailu&vs=${b.id}`}>{b.name}</Link>
                ))}
              </div>
            </section>
            {other ? (
              <section className="card">
                <h2>Minä vs {other.name}</h2>
                <table className="vs">
                  <thead><tr><th></th><th>Minä</th><th>{other.name.length > 9 ? `${other.name.slice(0, 8)}…` : other.name}</th><th>Ryhmä ka.</th></tr></thead>
                  <tbody>
                    {metrics.map((m) => {
                      const a = m.get(me), b = m.get(other);
                      return (
                        <tr key={m.label}>
                          <td>{m.label}</td>
                          <td className={a > b ? 'win' : ''}>{fi(a)}</td>
                          <td className={b > a ? 'win' : ''}>{fi(b)}</td>
                          <td className="muted">{fi(avgOf(m.get), 1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="muted">Korostettu = suurempi arvo. Ryhmä ka. = kaikkien keijujen keskiarvo.</p>
              </section>
            ) : <p className="sub">Ei vertailtavia keijuja vielä.</p>}
          </>
        );
      })()}

      {tab === 'ennatykset' && (() => {
        const bestDayRow = [...raw.steps].sort((a, b) => b.steps - a.steps)[0];
        const weekBest = (() => { let best: { id: string; week: string; v: number } | null = null; for (const b of board) { const w = bestOf(weeklyTotals(raw.steps.filter((r) => r.fairy_id === b.id))); if (w && (!best || w.value > best.v)) best = { id: b.id, week: w.key, v: w.value }; } return best; })();
        const sportDay = (() => { const m = new Map<string, { id: string; day: string; v: number }>(); raw.workouts.forEach((w) => { const k = `${w.fairy_id}|${w.day}`; const c = m.get(k) ?? { id: w.fairy_id, day: w.day, v: 0 }; c.v += w.minutes; m.set(k, c); }); return [...m.values()].sort((a, b) => b.v - a.v)[0]; })();
        const longest = [...raw.workouts].sort((a, b) => b.minutes - a.minutes)[0];
        const maxBy = (get: (f: (typeof board)[number]) => number) => [...board].sort((a, b) => get(b) - get(a))[0];
        const rows: { label: string; who?: (typeof board)[number]; value: string; sub?: string }[] = [
          bestDayRow ? { label: 'Paras päivä (askeleet)', who: board.find((b) => b.id === bestDayRow.fairy_id), value: fi(bestDayRow.steps), sub: dm2(bestDayRow.day) } : null,
          weekBest ? { label: 'Paras viikko (askeleet)', who: board.find((b) => b.id === weekBest.id), value: fi(weekBest.v), sub: `vko ${dm2(weekBest.week)}` } : null,
          gBest ? { label: 'Ryhmän paras päivä', value: fi(gBest[1]), sub: dm2(gBest[0]) } : null,
          maxBy((f) => f.bestRun)?.bestRun ? { label: 'Pisin putki', who: maxBy((f) => f.bestRun), value: `${maxBy((f) => f.bestRun).bestRun} pv`, sub: `hyvä päivä = ${fi(ACTIVE_DAY)}+` } : null,
          maxBy((f) => f.activeDays)?.activeDays ? { label: 'Eniten hyviä päiviä', who: maxBy((f) => f.activeDays), value: String(maxBy((f) => f.activeDays).activeDays) } : null,
          maxBy((f) => f.avgSteps)?.avgSteps ? { label: 'Paras keskiarvo kävelypäivältä', who: maxBy((f) => f.avgSteps), value: fi(maxBy((f) => f.avgSteps).avgSteps) } : null,
          sportDay ? { label: 'Eniten urheilua yhtenä päivänä', who: board.find((b) => b.id === sportDay.id), value: `${fi(sportDay.v)} min`, sub: dm2(sportDay.day) } : null,
          longest ? { label: 'Pisin urheilukerta', who: board.find((b) => b.id === longest.fairy_id), value: `${longest.minutes} min`, sub: `${longest.sport} · ${dm2(longest.day)}` } : null,
          maxBy((f) => f.workouts)?.workouts ? { label: 'Eniten urheilukertoja', who: maxBy((f) => f.workouts), value: String(maxBy((f) => f.workouts).workouts) } : null,
        ].filter(Boolean) as { label: string; who?: (typeof board)[number]; value: string; sub?: string }[];
        return (
          <section className="card">
            <h2>Kauden ennätykset</h2>
            <ul className="rec">
              {rows.map((r) => (
                <li key={r.label}>
                  {r.who ? <Avatar a={r.who} size={38} stage={r.who.stageIdx} /> : <span className="avatar" style={{ width: 38, height: 38 }} />}
                  <span className="rl"><small>{r.label}</small><b>{r.who ? r.who.name : 'Koko ryhmä'}</b></span>
                  <span className="rv2">{r.value}{r.sub && <small>{r.sub}</small>}</span>
                </li>
              ))}
            </ul>
            {rows.length === 0 && <p className="muted">Ennätykset ilmestyvät, kun dataa on kertynyt.</p>}
          </section>
        );
      })()}
      <p className="muted" style={{ textAlign: 'center' }}>Matka = askeleet × 0,75 m (arvio).</p>
    </>
  );
}
