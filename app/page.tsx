import Link from 'next/link';
import { loadGarden } from '@/lib/data';
import { DAILY_GOAL, STAGES, ago, phaseOf, stageFor, type Phase } from '@/lib/garden';
import type { Fairy } from '@/lib/data';
import { dailyQuests } from '@/lib/quests';
import Journey from '@/components/Journey';
import Ticker from '@/components/Ticker';
import Avatar from '@/components/Avatar';
import { challengeFor, groupTarget } from '@/lib/challenge';
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
  const { board, me: realMe, myRank, sentToday } = await loadGarden();
  // Ylläpitäjän esikatselu: ?taso=0..5, ?aika=night|dawn|day|dusk, ?juhla=1, ?tyhja=1 (uuden käyttäjän näkymä)
  const admin = !!realMe?.isAdmin;
  let me: Fairy | null = admin && searchParams.tyhja ? { ...realMe!, hasSteps: false, today: 0, yesterday: 0, totalSteps: 0, pts: 0, stageIdx: 0, badges: [], streak: 0 } : realMe;
  if (me && admin && searchParams.taso !== undefined) {
    const idx = Math.max(0, Math.min(5, Number(searchParams.taso) || 0));
    me = { ...me, stageIdx: idx, pts: STAGES[idx].min / 1000, hasSteps: true };
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
        <Garden pts={Math.min(12, board.length * 3)} stageIdx={4} phase={phase} lines={['Tervetuloa puutarhaan ✨', 'Istuta siemen niin kasvamme yhdessä 🌱', 'Kimalle! 🦋']} />
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
            <li><b>Kävele</b>: jokainen 1 000 askelta kasvattaa puutarhaasi. Urheilu antaa pienen lisän.</li>
          </ol>
        </section>
      </>
    );
  }

  const { stage, next, pct } = stageFor(me.pts);
  const stageIdx = me.stageIdx;

  return (
    <>
      <Celebrate stageIdx={stageIdx} stageName={stage.name} emoji={stage.emoji} force={admin && !!searchParams.juhla} />
      <Garden
        pts={me.pts}
        stageIdx={stageIdx}
        phase={phase}
        name={`${me.name} · ${stage.name}`}
        avatar={me}
        lines={[
          me.today < DAILY_GOAL ? `Vielä ${(DAILY_GOAL - me.today).toLocaleString('fi-FI')} askelta päivän tavoitteeseen! 👟` : 'Päivän tavoite täynnä, mahtavaa! ✨',
          next ? `${next.emoji} ${next.name} odottaa ${Math.max(1, Math.ceil(next.min / 1000 - me.pts))} pisteen päässä` : 'Olet puutarhan kuningatar 👑',
          'Kukat kasvavat jokaisesta tuhannesta askeleesta 🌷',
          'Muista juoda vettä, keiju 💧',
          `${me.name}, sinä loistat! 🌸`,
        ]}
      />
      <p className="muted" style={{ textAlign: 'center', marginTop: -6 }}><Link href="/profiili">Muokkaa avataria</Link></p>
      <Countdown to={contest.end} />
      <Ticker items={[
        `Ryhmä tänään ${board.reduce((a, b) => a + b.today, 0).toLocaleString('fi-FI')} askelta`,
        board[0] ? `Johtaa ${board[0].name} ${board[0].pts} p` : '',
        board.some((b) => b.streak > 1) ? `Pisin putki ${Math.max(...board.map((b) => b.streak))} pv` : '',
        `Viikon haaste: ${challengeFor().title}`,
        `${board.filter((b) => b.today >= DAILY_GOAL).length} / ${board.length} on täyttänyt päivän tavoitteen`,
      ].filter(Boolean)} />

      {!me.hasSteps ? (
        <section className="card setup">
          <h2>Aloita tästä</h2>
          <p>Puutarha kasvaa vasta, kun askeleet tulevat mukaan.</p>
          <Link className="btn" href="/shortcut">Yhdistä askeleet (5 min)</Link>
        </section>
      ) : (
        <section className="card center">
          <Ring value={me.today} goal={DAILY_GOAL} />
          <div className="chips">
            <span className="chip">{me.streak} pv putki</span>
            <span className="chip">sija {myRank}/{board.length}</span>
            <span className="chip">{me.pts} p</span>
          </div>
          {searchParams.synkattu && <p className="muted">Synkkaus tehty ✨</p>}
          <SyncButton site={process.env.NEXT_PUBLIC_SITE_URL ?? ''} />
        </section>
      )}

      {me.hasSteps && me.yesterday === 0 && (
        <section className="card nudge">
          <p>🌙 Eilisen askeleet puuttuvat. Paina Synkkaa askeleet nyt, niin ne tulevat mukaan.</p>
          <p className="muted">Viimeksi synkattu: {ago(me.lastSync)}</p>
        </section>
      )}

      <section className="card">
        <h2>{next ? `Matkalla: ${next.emoji} ${next.name}` : 'Olet huipulla '}</h2>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        {next && <p className="muted">Vielä {Math.max(0, Math.ceil(next.min / 1000 - me.pts))} pistettä seuraavaan tasoon.</p>}
      </section>
      {me.hasSteps && (() => {
        const quests = dailyQuests({ today: me.today, yesterday: me.yesterday, minsToday: me.minsToday, sentToday: sentToday.length });
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

      {me.cheersToday > 0 && (
        <section className="card cheers">
          <p>Sait tänään <b>{me.cheersToday}</b> {me.cheersToday === 1 ? 'kimallen' : 'kimallusta'}</p>
        </section>
      )}


      {me.hasSteps && board.length > 1 && (() => {
        const above = myRank > 1 ? board[myRank - 2] : null;
        const below = myRank < board.length ? board[myRank] : null;
        const rows = [above, me, below].filter(Boolean) as typeof board;
        const hint = above
          ? `Noin ${((above.pts - me.pts + 1) * 1000).toLocaleString('fi-FI')} askelta, niin ohitat keijun ${above.name}.`
          : below ? `Johdat! Keiju ${below.name} on ${me.pts - below.pts} pisteen päässä.` : '';
        return (
          <section className="card duel">
            <h2>Taistelu kärjestä</h2>
            <ol className="rank">
              {rows.map((b) => (
                <li key={b.id} className={b.mine ? 'me' : ''}>
                  <span className="pos">{board.indexOf(b) + 1}</span>
                  <span className="nm"><Avatar a={b} size={34} stage={b.stageIdx} /><span>{b.name}<small>{b.mine ? 'sinä' : b.pts > me.pts ? `+${b.pts - me.pts} p edellä` : `${me.pts - b.pts} p perässä`}</small></span></span>
                  <span className="pt">{b.pts} p</span>
                </li>
              ))}
            </ol>
            <p className="muted">{hint}</p>
          </section>
        );
      })()}

      {me.hasSteps && (() => {
        const ch = challengeFor();
        const val = ch.value(me.week);
        const done = val >= ch.target;
        const gt = groupTarget(board.length);
        const gv = board.reduce((a, b) => a + b.week.steps, 0);
        return (
          <section className={`card ${done ? 'quests all' : ''}`}>
            <h2>Viikon haaste: {ch.title}</h2>
            <p className="muted" style={{ margin: '0 0 4px' }}>{ch.desc}</p>
            <div className="bar"><i style={{ width: `${Math.min(100, (val / ch.target) * 100)}%` }} /></div>
            <p className="muted">{done ? 'Haaste suoritettu!' : `${val.toLocaleString('fi-FI')} / ${ch.target.toLocaleString('fi-FI')} ${ch.unit}`}</p>
            <h2 style={{ marginTop: 14 }}>Yhteinen tavoite</h2>
            <div className="bar"><i style={{ width: `${Math.min(100, (gv / gt) * 100)}%` }} /></div>
            <p className="muted">Ryhmä on kävellyt tällä viikolla {gv.toLocaleString('fi-FI')} / {gt.toLocaleString('fi-FI')} askelta.</p>
          </section>
        );
      })()}

      {me.hasSteps && <Journey steps={me.totalSteps} avatar={me} stageIdx={stageIdx} />}

      <section className="card">
        <h2>Merkit {me.badges.length}/{BADGES.length}</h2>
        <div className="badges small">
          {BADGES.filter((b) => me.badges.includes(b.id)).map((b) => <span key={b.id} title={b.name}>{b.emoji}</span>)}
        </div>
        {me.badges.length === 0 && <p className="muted">Ensimmäinen merkki tulee ensimmäisistä askelista.</p>}
        <p className="muted"><Link href="/kisa">Kaikki merkit ja kisan tilanne →</Link></p>
      </section>
      {admin && <p className="muted" style={{ textAlign: 'center' }}><Link href="/yllapito">Ylläpito ja esikatselut</Link></p>}
    </>
  );
}
