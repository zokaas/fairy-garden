import Link from 'next/link';
import { loadGarden, loadRaw } from '@/lib/data';
import { dayBefore, inContest, helsinkiDay, kindOf, GROWTH, UNLOCKS, fp, stepPoints, ago, phaseOf, type Phase } from '@/lib/garden';
import type { Fairy } from '@/lib/data';
import Journey from '@/components/Journey';
import { AutoSyncEnable } from '@/components/AutoSync';
import { forecast } from '@/lib/forecast';
import Ticker from '@/components/Ticker';
import Avatar from '@/components/Avatar';
import { WEEK_BONUS, WEEK_GOAL } from '@/lib/weekly';
import NameDice from '@/components/NameDice';
import { BADGES } from '@/lib/badges';
import { addManualSteps, join, login } from './actions';
import { MANUAL_STEPS_MAX } from '@/lib/manual';
import Countdown from '@/components/Countdown';
import { getContest } from '@/lib/contest';
import Garden from '@/components/Garden';
import Ring from '@/components/Ring';
import Celebrate from '@/components/Celebrate';
import SyncButton from '@/components/SyncButton';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { ok?: string; virhe?: string; synkattu?: string; kirjaudu?: string; d?: string; taso?: string; aika?: string; juhla?: string; tyhja?: string } }) {
  const [{ board, me: realMe, myRank }, raw, contest] = await Promise.all([loadGarden(), loadRaw(), getContest()]);
  const rawToday = realMe?.hasSteps ? raw : null;
  // Ylläpitäjän esikatselu: ?taso=0..5, ?aika=night|dawn|day|dusk, ?juhla=1, ?tyhja=1 (uuden käyttäjän näkymä)
  const admin = !!realMe?.isAdmin;
  let me: Fairy | null = admin && searchParams.tyhja ? { ...realMe!, hasSteps: false, today: 0, yesterday: 0, totalSteps: 0, pts: 0, stageIdx: 0, badges: [], streak: 0, workouts: 0, flowers: 0, avatarEmoji: null } : realMe;
  if (me && admin && searchParams.taso !== undefined) {
    const idx = Math.max(0, Math.min(5, Number(searchParams.taso) || 0));
    me = { ...me, stageIdx: idx, flowers: GROWTH[idx] + (idx > 0 ? 2 : 0), hasSteps: true };
  }
  const phase: Phase = admin && ['night', 'dawn', 'day', 'dusk'].includes(searchParams.aika ?? '') ? (searchParams.aika as Phase) : phaseOf();
  const errs: Record<string, string> = {
    nimi: 'Kirjoita keijun nimi.',
    salasana: 'Salasanassa pitää olla vähintään 4 merkkiä.',
    olemassa: 'Tämä nimi on jo käytössä. Jos se on sinun, kirjaudu sisään alta.',
    eiloydy: 'Tällä nimellä ei löytynyt keijua.',
    vaara: 'Väärä salasana.',
    tallennus: 'Jokin meni pieleen, yritä uudelleen.',
  };
  const errMsg = searchParams.virhe ? errs[searchParams.virhe] ?? errs.tallennus : null;
  const showLogin = !!searchParams.kirjaudu || searchParams.virhe === 'olemassa';

  if (!me) {
    return (
      <>
        <Garden flowers={Math.min(14, board.length * 3)} stageIdx={4} phase={phase} lines={['Tervetuloa puutarhaan ✨', 'Istuta siemen niin kasvamme yhdessä 🌱', 'Kimalle! 🦋']} />
        <h1>Fairy Garden</h1>
        <p className="sub">Kävele kukkaan, kasva keijuksi ja ole reippain keiju!</p>
        <Countdown to={contest.end} />
        {errMsg && <p className="err">{errMsg}{searchParams.d && <><br /><small>{searchParams.d}</small></>}</p>}
        {!showLogin ? (
          <form action={join} className="card">
            <h2>Liity puutarhaan</h2>
            <input id="nm" name="name" placeholder="Keijun nimi" maxLength={30} required autoComplete="username" />
            <NameDice inputId="nm" />
            <input name="pin" type="password" placeholder="Salasana (väh. 4 merkkiä)" minLength={4} required autoComplete="new-password" />
            <p className="muted">Salasanalla pääset sisään myös toiselta puhelimelta tai kotinäytön sovelluksesta.</p>
            <button className="btn">Istuta siemen </button>
            <p className="muted" style={{ textAlign: 'center' }}><Link href="/?kirjaudu=1">Minulla on jo keiju →</Link></p>
          </form>
        ) : (
          <form action={login} className="card">
            <h2>Kirjaudu sisään</h2>
            <input name="name" placeholder="Keijun nimi" maxLength={30} required autoComplete="username" />
            <input name="pin" type="password" placeholder="Salasana" minLength={4} required autoComplete="current-password" />
            <p className="muted">Vanha tunnus ilman salasanaa? Kirjoita nimi ja keksi uusi salasana, niin se tallentuu.</p>
            <button className="btn">Kirjaudu</button>
            <p className="muted" style={{ textAlign: 'center' }}><Link href="/">Uusi keiju →</Link></p>
          </form>
        )}
        <section className="card how">
          <h2>Näin se toimii</h2>
          <ol>
            <li><b>Liity</b> nimellä, joka näkyy kärkilistalla.</li>
            <li><b>Yhdistä askeleet</b> iPhonen Terveydestä (5 min, kerran).</li>
            <li><b>Kerää pisteitä</b> kävelemällä ja liikkumalla. Säännöt: <Link href="/ohje">Näin kisa toimii →</Link></li>
          </ol>
        </section>
      </>
    );
  }

  const stageIdx = me.stageIdx;
  const todo = [
    { done: me.hasSteps, label: 'Yhdistä askeleet', hint: 'Kerran, noin 5 min. Sen jälkeen askeleet tulevat itsestään.', href: '/shortcut' },
    { done: !!me.avatarEmoji, label: 'Valitse oma keiju', hint: 'Hahmo, väri tai oma kuva.', href: '/profiili' },
    { done: me.workouts > 0, label: 'Kirjaa ensimmäinen urheilu tai luova hetki', hint: '1 piste / 30 min.', href: '/kirjaa' },
  ];
  const doneCount = todo.filter((t) => t.done).length;
  const onboarding = doneCount < todo.length ? (
    <section className={`card ${me.hasSteps ? '' : 'setup'}`}>
      <h2>Näin pääset alkuun ({doneCount}/{todo.length})</h2>
      <ol className="onboard">
        {todo.map((t) => (
          <li key={t.label} className={t.done ? 'done' : ''}>
            <span className="ob-check">{t.done ? '✓' : ''}</span>
            <span className="ob-txt">{t.done ? <b>{t.label}</b> : <Link href={t.href}><b>{t.label}</b></Link>}<small>{t.hint}</small></span>
          </li>
        ))}
      </ol>
      {!me.hasSteps && <Link className="btn" href="/shortcut">Yhdistä askeleet nyt</Link>}
      <p className="muted">Pisteet ja säännöt: <Link href="/ohje">Näin kisa toimii →</Link></p>
    </section>
  ) : null;

  return (
    <>
      <AutoSyncEnable hasSteps={me.hasSteps} />
      {contest.over && <Link className="btn" href="/loppu">🏆 Kisa on ohi: katso loppukatsaus</Link>}
      <Celebrate flowers={me.flowers} force={admin && !!searchParams.juhla} />
      <Garden
        flowers={me.flowers}
        stageIdx={stageIdx}
        phase={phase}
        name={me.name}
        href="/profiili"
        progress={me.hasSteps ? Math.max(0, Math.min(1, me.today / Math.max(1, me.goal.todayTarget))) : 0}
        avatar={me}
        lines={[
          me.today < me.goal.todayTarget ? `Vielä ${(me.goal.todayTarget - me.today).toLocaleString('fi-FI')} askelta päivän tavoitteeseen! 👟` : 'Päivän tavoite täynnä, mahtavaa! ✨',
          'Muista juoda vettä, keiju 💧',
          `${me.name}, sinä loistat! 🌸`,
        ]}
      />
      <p className="muted" style={{ textAlign: 'center', marginTop: -6 }}>
        {me.hasSteps ? (
          <>🌸 {me.flowers} {me.flowers === 1 ? 'kukka' : 'kukkaa'} puutarhassa{me.today >= me.goal.todayTarget && <><br />Tämän päivän kukka on puhjennut ✓</>}{(() => { const n = UNLOCKS.find((u) => me.flowers < u.at); return n ? <><br /><Link href={`/keiju/${me.id}#palkinnot`}>Seuraava palkinto: {n.text} ({n.at - me.flowers} kukan päästä) →</Link></> : null; })()}</>
        ) : 'Jokainen päivä, jolloin saavutat askeltavoitteen, kasvattaa puutarhaasi kukan.'}
      </p>
      {!me.hasSteps ? (
        onboarding
      ) : (() => {
        const dSteps = stepPoints(me.today);
        const dMins = me.minsPtsToday;
        return (
          <section className="card center">
            <Ring value={me.today} goal={me.goal.todayTarget} />
            <p className="todaypts"><b>Pisteet tänään: +{fp(dSteps + dMins)} p</b><span>askelista {fp(dSteps)} p · urheilusta ja luovasta {fp(dMins)} p</span></p>
            <div className="chips" style={{ justifyContent: 'center' }}>
              <span className="chip">Yhteensä {fp(me.pts)} p</span>
              <span className="chip">Sija {myRank} / {board.length}</span>
              {me.streak > 0 && <span className="chip">Putki {me.streak} pv</span>}
            </div>
            <p className="muted">{searchParams.synkattu ? '✓ Synkkaus tehty. ' : ''}Askeleet synkattu: <b>{ago(me.lastSync)}</b></p>
            <SyncButton site={process.env.NEXT_PUBLIC_SITE_URL ?? ''} />
            <p className="muted" style={{ margin: '4px 0 0' }}><Link href="/paivat">Päivät →</Link> · <Link href="/ohje">Näin kisa toimii →</Link></p>
          </section>
        );
      })()}

      {me.hasSteps && onboarding}

      {searchParams.ok && <p className="toast">{({ askeleet: 'Askeleet tallennettu ✏️', 'askeleet-pienempi': 'Päivällä on jo askelia, joten mitään ei muutettu.', 'askeleet-virhe': 'Tarkista askelmäärä.' } as Record<string, string>)[searchParams.ok] ?? ''}</p>}

      {me.yesterday === 0 && inContest(dayBefore(helsinkiDay())) && (() => {
        const y = dayBefore(helsinkiDay());
        const lbl = `${['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'][new Date(`${y}T12:00:00Z`).getUTCDay()]} ${Number(y.slice(8))}.${Number(y.slice(5, 7))}.`;
        return (
          <section className="card nudge">
            <p><b>Eilisen ({lbl}) askeleet puuttuvat.</b> Paljonko askelia kertyi? Katso luku Terveys-sovelluksesta.</p>
            <form action={addManualSteps} className="row" style={{ alignItems: 'stretch' }}>
              <input type="hidden" name="day" value={y} />
              <input type="hidden" name="back" value="etusivu" />
              <input name="steps" type="number" inputMode="numeric" min={1} max={MANUAL_STEPS_MAX} placeholder="eilisen askeleet" aria-label="Eilisen askeleet" required />
              <button className="btn">Tallenna</button>
            </form>
            <p className="muted">Merkitään ✏️ (käsin kirjattu). Tai paina <b>Synkkaa askeleet</b>, niin ne tulevat itsestään. Viimeksi synkattu: {ago(me.lastSync)}</p>
          </section>
        );
      })()}

      {me.hasSteps && rawToday && (() => {
        const t = helsinkiDay();
        const rows = board.map((b) => {
          const w = rawToday.workouts.filter((x) => x.fairy_id === b.id && x.day === t);
          const part = (kind: 'urheilu' | 'luova') => {
            const m = new Map<string, number>();
            for (const x of w) if (kindOf(x.sport) === kind) m.set(x.sport, (m.get(x.sport) ?? 0) + x.minutes);
            return [...m.entries()].map(([sp, min]) => `${sp} ${min} min`).join(', ');
          };
          return { b, sport: part('urheilu'), creative: part('luova') };
        }).sort((a, c) => c.b.today - a.b.today);
        return (
          <section className="card">
            <h2>Tänään kaikilla</h2>
            <ul className="plain todaylist">
              {rows.map(({ b, sport, creative }) => (
                <li key={b.id} className={b.mine ? 'me' : ''}>
                  <Link href={`/keiju/${b.id}`} className="tl-av" aria-label={`Avaa ${b.name}`}><Avatar a={b} size={32} stage={b.stageIdx} /></Link>
                  <span className="tl-n"><Link href={`/keiju/${b.id}`}><b>{b.name}{b.mine ? ' (sinä)' : ''}</b></Link>
                    {sport && <small>💪 {sport}</small>}
                    {creative && <small>🎨 {creative}</small>}
                    {!sport && !creative && <small className="muted">ei liikuntaa vielä</small>}
                  </span>
                  <span className="tl-s">{b.today.toLocaleString('fi-FI')}<small>{b.today >= b.goal.todayTarget ? ' 🌸' : ' 👟'}</small></span>
                </li>
              ))}
            </ul>
            <p className="muted" style={{ margin: '8px 0 0' }}><Link href="/paivat?nakyma=kaikki">Kaikkien tekemiset →</Link></p>
          </section>
        );
      })()}

      {me.hasSteps && (() => {
        const g = me.goal;
        const rows = [
          { label: 'Askelpäivät', val: Math.min(g.stepDaysOk, WEEK_GOAL.stepDays), max: WEEK_GOAL.stepDays, hint: `päivää tavoitteessa (yksi lepopäivä sallittu). Tänään ${g.todayTarget.toLocaleString('fi-FI')} (${g.todayIsSport ? 'urheilupäivä' : 'ilman urheilua'})`, ok: g.stepsDone },
          { label: 'Urheilupäivät', val: g.sportDays, max: WEEK_GOAL.sportDays, hint: 'päivää, joina kirjasit urheilua. Esim. sali, juoksu, jooga, tanssi, tennis, hiihto…', ok: g.sportDone },
          { label: 'Luovat päivät', val: g.creativeDays, max: WEEK_GOAL.creativeDays, hint: 'päivä, jona kirjasit luovaa. Esim. piirtäminen, lukeminen, sudoku, virkkaaminen, soittaminen…', ok: g.creativeDone },
        ];
        const n = board.length;
        const nDone = board.filter((b) => b.goal.done).length;
        return (
          <section className={`card ${g.done ? 'quests all' : ''}`}>
            <h2>Viikon tavoite <small className="muted">(ma–su, +10 p)</small></h2>
            <div className="goalmini">
              {rows.map((r) => (
                <div key={r.label} className={r.ok ? 'ok' : ''}>
                  <b>{r.val}<small> / {r.max}</small></b>
                  <span>{r.label}{r.ok ? ' ✓' : ''}</span>
                  <div className="bar"><i style={{ width: `${Math.min(100, (r.val / r.max) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
            {g.done ? <p className="toast">Viikon tavoite täynnä! +{WEEK_BONUS} pistettä</p> : <p className="muted">Täytä kaikki kolme, niin saat +{WEEK_BONUS} pistettä. {nDone} / {n} keijua on jo täyttänyt viikon tavoitteen.</p>}
            <p className="muted" style={{ margin: '4px 0 0' }}>Mitä tavoite tarkoittaa? <Link href="/ohje">Näin kisa toimii →</Link></p>
          </section>
        );
      })()}


      {me.hasSteps && <Journey steps={me.totalSteps} avatar={me} stageIdx={stageIdx} note={forecast(me.totalSteps, helsinkiDay(), new Date(contest.end).toLocaleDateString('sv-SE', { timeZone: 'Europe/Helsinki' }))?.text} />}

      <section className="card">
        <h2>Merkit {me.badges.length}/{BADGES.length}</h2>
        <div className="badges small">
          {BADGES.filter((b) => me.badges.includes(b.id)).map((b) => <span key={b.id} title={b.name}>{b.emoji}</span>)}
        </div>
        {me.badges.length === 0 && <p className="muted">Ensimmäinen merkki tulee ensimmäisistä askelista.</p>}
        <p className="muted"><Link href={`/keiju/${me.id}#merkit`}>Kaikki merkit →</Link></p>
      </section>
      {me.hasSteps && (
          <div style={{ marginTop: 12 }}>
            <Ticker items={[
        `Ryhmä tänään ${board.reduce((a, b) => a + b.today, 0).toLocaleString('fi-FI')} askelta`,
        board[0] ? `Johtaa ${board[0].name} ${fp(board[0].pts)} p` : '',
        board.some((b) => b.streak > 1) ? `Pisin putki ${Math.max(...board.map((b) => b.streak))} pv` : '',
        `Viikon tavoite: 3× urheilu, 1× luova`,
        `${board.filter((b) => b.today >= b.goal.todayTarget).length} / ${board.length} on täyttänyt päivän tavoitteen`,
      ].filter(Boolean)} />

          </div>
      )}
      {admin && <p className="muted" style={{ textAlign: 'center' }}><Link href="/yllapito">Ylläpito ja esikatselut</Link></p>}
    </>
  );
}
