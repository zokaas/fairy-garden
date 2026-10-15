import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden, loadRaw } from '@/lib/data';
import { BADGES } from '@/lib/badges';
import { UNLOCKS, dayBefore, fp, helsinkiDay, kindOf, phaseOf } from '@/lib/garden';
import { WEEK_GOAL } from '@/lib/weekly';
import { byDay } from '@/lib/stats';
import Garden from '@/components/Garden';
import Journey from '@/components/Journey';
import { forecast } from '@/lib/forecast';
import { loadManualDays } from '@/lib/manual';
import { getContest } from '@/lib/contest';

export const dynamic = 'force-dynamic';

const WD = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
const fi = (n: number) => n.toLocaleString('fi-FI');
const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;

export default async function Keiju({ params }: { params: { id: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const [{ board, me }, raw, contest, manual] = await Promise.all([loadGarden(), loadRaw(), getContest(), loadManualDays()]);
  if (!me) redirect('/');
  const f = board.find((b) => b.id === params.id);
  if (!f) notFound();
  const rank = board.findIndex((b) => b.id === f.id) + 1;
  const steps = byDay(raw.steps.filter((r) => r.fairy_id === f.id));
  const work = raw.workouts.filter((r) => r.fairy_id === f.id);

  const today = helsinkiDay();
  const days: string[] = [];
  for (let d = today, i = 0; i < 7; d = dayBefore(d), i++) days.push(d);
  const recent = days.map((day) => {
    const w = work.filter((x) => x.day === day);
    const names = (k: 'urheilu' | 'luova') => {
      const m = new Map<string, number>();
      for (const x of w) if (kindOf(x.sport) === k) m.set(x.sport, (m.get(x.sport) ?? 0) + x.minutes);
      return [...m.entries()].map(([s, min]) => `${s} ${min} min`).join(', ');
    };
    return { day, steps: steps.get(day) ?? 0, sport: names('urheilu'), creative: names('luova') };
  });

  const bySport = new Map<string, number>();
  for (const w of work) bySport.set(w.sport, (bySport.get(w.sport) ?? 0) + w.minutes);
  const sports = [...bySport.entries()].sort((a, b) => b[1] - a[1]);
  const g = f.goal;
  const earned = BADGES.filter((b) => f.badges.includes(b.id));

  return (
    <>
      <p className="muted" style={{ margin: '0 0 6px' }}><Link href="/kisa">← Kisa</Link></p>
      <h1>{f.name}{f.mine ? ' (sinä)' : ''}</h1>
      <p className="sub">Sija {rank} / {board.length} · {fp(f.pts)} p · {f.flowers} {f.flowers === 1 ? 'kukka' : 'kukkaa'}{f.streak > 0 ? ` · putki ${f.streak} pv` : ''}</p>

      <Garden flowers={f.flowers} stageIdx={f.stageIdx} avatar={f} name={f.name} phase={phaseOf()} lines={[`${f.name} on tänään kävellyt ${fi(f.today)} askelta`, `${f.flowers} kukkaa puutarhassa 🌸`]} />

      {f.mine && <p style={{ textAlign: 'center', margin: '10px 0' }}><Link className="btn ghost" href="/profiili">Muokkaa avataria ja asetuksia</Link></p>}

      <section className="card">
        <h2>Tänään</h2>
        <div className="tiles">
          <div><b>{fi(f.today)}</b><span>askelta tänään</span><small>{f.today >= g.todayTarget ? 'päivän tavoite täynnä 🌸' : `tavoite ${fi(g.todayTarget)}`}</small></div>
          <div><b>{f.sportToday > 0 ? `${f.sportToday} min` : '–'}</b><span>urheilua tänään</span></div>
          <div><b>{f.creativeToday > 0 ? `${f.creativeToday} min` : '–'}</b><span>luovaa tänään</span></div>
        </div>
      </section>

      <Journey steps={f.totalSteps} avatar={f} stageIdx={f.stageIdx} note={!f.mine ? undefined : forecast(f.totalSteps, helsinkiDay(), new Date(contest.end).toLocaleDateString('sv-SE', { timeZone: 'Europe/Helsinki' }))?.text} />

      <section className="card">
        <h2>Viikon tavoite</h2>
        <div className="goalmini">
          <div className={g.stepsDone ? 'ok' : ''}><b>{Math.min(g.stepDaysOk, WEEK_GOAL.stepDays)}<small> / {WEEK_GOAL.stepDays}</small></b><span>Askelpäivät{g.stepsDone ? ' ✓' : ''}</span></div>
          <div className={g.sportDone ? 'ok' : ''}><b>{g.sportDays}<small> / {WEEK_GOAL.sportDays}</small></b><span>Urheilupäivät{g.sportDone ? ' ✓' : ''}</span></div>
          <div className={g.creativeDone ? 'ok' : ''}><b>{g.creativeDays}<small> / {WEEK_GOAL.creativeDays}</small></b><span>Luovat päivät{g.creativeDone ? ' ✓' : ''}</span></div>
        </div>
        <p className="muted">{g.done ? 'Viikon tavoite täynnä! 🎯' : `Viikon askeleet ${fi(f.week.steps)}`}</p>
      </section>

      <section className="card">
        <h2>Viimeiset 7 päivää</h2>
        <ul className="plain feed">
          {recent.map((r) => (
            <li key={r.day}>
              <span className="fd-t">
                <b>{WD[new Date(`${r.day}T12:00:00Z`).getUTCDay()]} {dm(r.day)}{r.day === today ? ' · tänään' : ''}</b>
                <small>{fi(r.steps)} askelta{manual.has(`${f.id}|${r.day}`) ? ' ✏️' : ''}{r.sport ? ` · 💪 ${r.sport}` : ''}{r.creative ? ` · 🎨 ${r.creative}` : ''}</small>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Pisteet</h2>
        <div className="tiles">
          <div><b>{fp(f.stepPts)}</b><span>askelista</span></div>
          <div><b>{fp(f.sportOnlyPts)}</b><span>urheilusta</span></div>
          <div><b>{fp(f.creativePts)}</b><span>luovasta</span></div>
          <div><b>{f.bonusPts}</b><span>viikkobonus</span></div>
        </div>
      </section>

      <section className="card">
        <h2>Kisa tähän asti</h2>
        <div className="tiles">
          <div><b>{fi(f.totalSteps)}</b><span>askelta yhteensä</span></div>
          <div><b>{fi(f.bestDay)}</b><span>paras päivä</span></div>
          <div><b>{f.activeDays}</b><span>kävelypäivää</span></div>
          <div><b>{f.workouts}</b><span>kirjausta</span></div>
        </div>
        {sports.length > 0 && (
          <ul className="plain" style={{ marginTop: 10 }}>
            {sports.slice(0, 8).map(([s, min]) => <li key={s}>{kindOf(s) === 'luova' ? '🎨' : '💪'} <b>{s}</b> · {fi(min)} min</li>)}
          </ul>
        )}
      </section>

      <section className="card" id="palkinnot">
        <h2>Puutarhan palkinnot</h2>
        <ul className="plain unlocks">
          {UNLOCKS.map((u) => (
            <li key={u.at} className={f.flowers >= u.at ? 'done' : ''}>
              <span className="ob-check">{f.flowers >= u.at ? '✓' : ''}</span>
              <span><b>{u.at} kukkaa</b><small>{u.text}</small></span>
            </li>
          ))}
        </ul>
        <p className="muted">Päivän askeltavoite on yksi kukka, ja jokainen täysi 10 000 askelta sen yli tuo lisäkukan. {f.mine ? "Sinulla on nyt" : `Puutarhassa on nyt`} {f.flowers} kukkaa.</p>
      </section>

      <section className="card" id="merkit">
        <h2>Merkit {earned.length}/{BADGES.length}</h2>
        <div className="badges">
          {BADGES.map((b) => {
            const got = f.badges.includes(b.id);
            return (
              <div key={b.id} className={got ? 'badge on' : 'badge'}>
                <span>{got ? b.emoji : '🔒'}</span>
                <b>{b.name}</b>
                <small>{b.desc}</small>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
