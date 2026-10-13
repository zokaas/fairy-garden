import Link from 'next/link';
import { loadGarden } from '@/lib/data';
import { helsinkiDay, GROWTH, STEPS_PER_POINT, UNLOCKS, fp, stepPoints, ago, phaseOf, type Phase } from '@/lib/garden';
import type { Fairy } from '@/lib/data';
import { dailyQuests } from '@/lib/quests';
import Journey from '@/components/Journey';
import { AutoSyncEnable } from '@/components/AutoSync';
import { forecast } from '@/lib/forecast';
import Ticker from '@/components/Ticker';
import Avatar from '@/components/Avatar';
import { WEEK_BONUS, WEEK_GOAL } from '@/lib/weekly';
import NameDice from '@/components/NameDice';
import { BADGES } from '@/lib/badges';
import { join, login } from './actions';
import Countdown from '@/components/Countdown';
import { getContest } from '@/lib/contest';
import Garden from '@/components/Garden';
import Ring from '@/components/Ring';
import Celebrate from '@/components/Celebrate';
import SyncButton from '@/components/SyncButton';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { virhe?: string; synkattu?: string; kirjaudu?: string; d?: string; taso?: string; aika?: string; juhla?: string; tyhja?: string } }) {
  const { board, me: realMe, myRank } = await loadGarden();
  // Ylläpitäjän esikatselu: ?taso=0..5, ?aika=night|dawn|day|dusk, ?juhla=1, ?tyhja=1 (uuden käyttäjän näkymä)
  const admin = !!realMe?.isAdmin;
  let me: Fairy | null = admin && searchParams.tyhja ? { ...realMe!, hasSteps: false, today: 0, yesterday: 0, totalSteps: 0, pts: 0, stageIdx: 0, badges: [], streak: 0, workouts: 0, flowers: 0, avatarEmoji: null } : realMe;
  if (me && admin && searchParams.taso !== undefined) {
    const idx = Math.max(0, Math.min(5, Number(searchParams.taso) || 0));
    me = { ...me, stageIdx: idx, flowers: GROWTH[idx] + (idx > 0 ? 2 : 0), hasSteps: true };
  }
  const contest = await getContest();
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
            <li><b>Kävele</b>: jokainen 2 500 askelta on 1 piste. Urheilu ja luova harrastus 1 p / 30 min (0,5 p / 15 min). Luovasta enintään 2 h viikossa.</li>
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
      <p className="muted">Pisteet: 1 p / 2 500 askelta, 1 p / 30 min urheilua, 1 p / 30 min luovaa (max 2 h / vko; 0,5 p / 15 min), +10 p täydestä viikosta.</p>
    </section>
  ) : null;

  return (
    <>
      <AutoSyncEnable hasSteps={me.hasSteps} />
      <Celebrate flowers={me.flowers} force={admin && !!searchParams.juhla} />
      <Garden
        flowers={me.flowers}
        stageIdx={stageIdx}
        phase={phase}
        name={me.name}
        href="/profiili"
        avatar={me}
        lines={[
          me.today < me.goal.todayTarget ? `Vielä ${(me.goal.todayTarget - me.today).toLocaleString('fi-FI')} askelta päivän tavoitteeseen! 👟` : 'Päivän tavoite täynnä, mahtavaa! ✨',
          'Jokainen tavoitepäivä kasvattaa yhden kukan 🌷',
          'Muista juoda vettä, keiju 💧',
          `${me.name}, sinä loistat! 🌸`,
        ]}
      />
      <p className="muted" style={{ textAlign: 'center', marginTop: -6 }}>
        {me.hasSteps ? (
          <>{me.flowers} {me.flowers === 1 ? 'kukka' : 'kukkaa'} · {me.today >= me.goal.todayTarget ? 'tämän päivän kukka on puhjennut ✓' : `tämän päivän kukkaan ${(me.goal.todayTarget - me.today).toLocaleString('fi-FI')} askelta`}</>
        ) : 'Jokainen päivä, jolloin saavutat askeltavoitteen, kasvattaa puutarhaasi kukan.'}
      </p>
      <Countdown to={contest.end} />

      {!me.hasSteps ? (
        onboarding
      ) : (() => {
        const dSteps = stepPoints(me.totalSteps) - stepPoints(Math.max(0, me.totalSteps - me.today));
        const dMins = me.minsPtsToday;
        return (
          <section className="card center">
            <Ring value={me.today} goal={me.goal.todayTarget} />
            <p className="todaypts"><b>Pisteet tänään: +{fp(dSteps + dMins)} p</b><span>askelista {fp(dSteps)} p · urheilusta ja luovasta {fp(dMins)} p</span></p>
            <p className="muted">Seuraavaan pisteeseen <b>{(STEPS_PER_POINT - (me.totalSteps % STEPS_PER_POINT)).toLocaleString('fi-FI')} askelta</b> (1 p / 2 500 askelta)</p>
            <div className="chips" style={{ justifyContent: 'center' }}>
              <span className="chip">{fp(me.pts)} p yhteensä</span>
              <span className="chip">sija {myRank} / {board.length}</span>
              {me.streak > 0 && <span className="chip">putki {me.streak} pv</span>}
            </div>
            <p className="muted">{searchParams.synkattu ? '✓ Synkkaus tehty. ' : ''}Askeleet synkattu: <b>{ago(me.lastSync)}</b></p>
            <SyncButton site={process.env.NEXT_PUBLIC_SITE_URL ?? ''} />
            <details className="how">
              <summary>Miten pisteet lasketaan? (<Link href="/ohje">koko ohje</Link>)</summary>
              <ul>
                <li><b>Kukka</b> jokaisesta päivästä, jolloin saavutat askeltavoitteen (10 000, tai 7 000 jos urheilet).</li>
                <li><b>1 piste</b> jokaisesta 2 500 askeleesta (pisteet kertyvät kisan kaikista askeleista, ei vain tämän päivän).</li>
                <li><b>1 piste</b> jokaisesta 30 minuutista urheilua (ei rajaa) tai luovaa harrastusta (pisteitä enintään 2 h viikossa). Puolikas piste jokaisesta 15 minuutista.</li>
                <li><b>Putki</b>: peräkkäisten päivien määrä, joina kävelit vähintään 5 000 askelta.</li>
                <li><b>+{WEEK_BONUS} pistettä</b> jokaisesta viikosta, jolloin täytät koko viikon tavoitteen.</li>
              </ul>
            </details>
          </section>
        );
      })()}

      {me.hasSteps && onboarding}

      {me.hasSteps && me.yesterday === 0 && (
        <section className="card nudge">
          <p>Eilisen askeleet puuttuvat. Paina Synkkaa askeleet nyt, niin ne tulevat mukaan.</p>
          <p className="muted">Viimeksi synkattu: {ago(me.lastSync)}</p>
        </section>
      )}

      {me.hasSteps && (() => {
        const g = me.goal;
        const rows = [
          { label: 'Askeleet', val: Math.min(g.stepDaysOk, WEEK_GOAL.stepDays), max: WEEK_GOAL.stepDays, hint: `päivää tavoitteessa (yksi lepopäivä sallittu). Tänään ${g.todayTarget.toLocaleString('fi-FI')} (${g.todayIsSport ? 'urheilupäivä' : 'ilman urheilua'})`, ok: g.stepsDone },
          { label: 'Urheilu', val: g.sportDays, max: WEEK_GOAL.sportDays, hint: 'päivää. Sali, lenkki, laskettelu, hiihto, lentopallo, tribe, pilates, tennis…', ok: g.sportDone },
          { label: 'Luova', val: g.creativeDays, max: WEEK_GOAL.creativeDays, hint: 'päivä. Piirtäminen, virkkaaminen, lukeminen, soittaminen, ompelu…', ok: g.creativeDone },
        ];
        const n = board.length;
        const nDone = board.filter((b) => b.goal.done).length;
        return (
          <section className={`card ${g.done ? 'quests all' : ''}`}>
            <h2>Viikon tavoite</h2>
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
            <details className="how">
              <summary>Mitä tavoite tarkoittaa?</summary>
              <ul>
                {rows.map((r) => <li key={r.label}><b>{r.label}:</b> {r.max} {r.hint}</li>)}
              </ul>
            </details>
          </section>
        );
      })()}


      {me.hasSteps && (
        <details className="more">
          <summary>Lisää: taistelu, päivän taika, polku ja merkit</summary>
      {me.hasSteps && board.length > 1 && (() => {
        const above = myRank > 1 ? board[myRank - 2] : null;
        const below = myRank < board.length ? board[myRank] : null;
        const rows = [above, me, below].filter(Boolean) as typeof board;
        const hint = above
          ? `Noin ${((above.pts - me.pts + 1) * STEPS_PER_POINT).toLocaleString('fi-FI')} askelta, niin ohitat keijun ${above.name}.`
          : below ? `Johdat! Keiju ${below.name} on ${fp(me.pts - below.pts)} pisteen päässä.` : '';
        return (
          <section className="card duel">
            <h2>Taistelu kärjestä</h2>
            <ol className="rank">
              {rows.map((b) => (
                <li key={b.id} className={b.mine ? 'me' : ''}>
                  <span className="pos">{board.indexOf(b) + 1}</span>
                  <span className="nm"><Avatar a={b} size={34} stage={b.stageIdx} /><span>{b.name}<small>{b.mine ? 'sinä' : b.pts > me.pts ? `+${fp(b.pts - me.pts)} p edellä` : `${fp(me.pts - b.pts)} p perässä`}</small></span></span>
                  <span className="pt">{fp(b.pts)} p</span>
                </li>
              ))}
            </ol>
            <p className="muted">{hint}</p>
          </section>
        );
      })()}

      {me.hasSteps && (() => {
        const quests = dailyQuests({ today: me.today, yesterday: me.yesterday, sportToday: me.sportToday, creativeToday: me.creativeToday, sportDays: me.goal.sportDays, creativeDays: me.goal.creativeDays });
        const all = quests.every((x) => x.done);
        return (
          <section className={`card quests ${all ? 'all' : ''}`}>
            <h2>{all ? 'Taikapäivä täynnä!' : 'Päivän taika'}</h2>
            <ul className="plain">
              {quests.map((x) => (
                <li key={x.id} className={x.done ? 'done' : ''}>
                  <span className="check">{x.done ? '✓' : x.emoji}</span>
                  <span>{x.text}<small>{x.progress}</small></span>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}



      <section className="card">
        <h2>Puutarhan palkinnot</h2>
        <ul className="plain unlocks">
          {UNLOCKS.map((u) => (
            <li key={u.at} className={me.flowers >= u.at ? 'done' : ''}>
              <span className="ob-check">{me.flowers >= u.at ? '✓' : ''}</span>
              <span><b>{u.at} kukkaa</b><small>{u.text}</small></span>
            </li>
          ))}
        </ul>
        <p className="muted">Jokainen päivä, jolloin saavutat askeltavoitteen, on yksi kukka. Sinulla on nyt {me.flowers}.</p>
      </section>
      {me.hasSteps && <Journey steps={me.totalSteps} avatar={me} stageIdx={stageIdx} note={forecast(me.totalSteps, helsinkiDay(), new Date(contest.end).toLocaleDateString('sv-SE', { timeZone: 'Europe/Helsinki' }))?.text} />}

      <section className="card">
        <h2>Merkit {me.badges.length}/{BADGES.length}</h2>
        <div className="badges small">
          {BADGES.filter((b) => me.badges.includes(b.id)).map((b) => <span key={b.id} title={b.name}>{b.emoji}</span>)}
        </div>
        {me.badges.length === 0 && <p className="muted">Ensimmäinen merkki tulee ensimmäisistä askelista.</p>}
        <p className="muted"><Link href="/kisa">Kaikki merkit ja kisan tilanne →</Link></p>
      </section>
          <div style={{ marginTop: 12 }}>
            <Ticker items={[
        `Ryhmä tänään ${board.reduce((a, b) => a + b.today, 0).toLocaleString('fi-FI')} askelta`,
        board[0] ? `Johtaa ${board[0].name} ${fp(board[0].pts)} p` : '',
        board.some((b) => b.streak > 1) ? `Pisin putki ${Math.max(...board.map((b) => b.streak))} pv` : '',
        `Viikon tavoite: 3× urheilu, 1× luova`,
        `${board.filter((b) => b.today >= b.goal.todayTarget).length} / ${board.length} on täyttänyt päivän tavoitteen`,
      ].filter(Boolean)} />

          </div>
        </details>
      )}
      {admin && <p className="muted" style={{ textAlign: 'center' }}><Link href="/yllapito">Ylläpito ja esikatselut</Link></p>}
    </>
  );
}
