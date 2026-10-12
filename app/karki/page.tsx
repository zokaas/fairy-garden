import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { ago, stageFor } from '@/lib/garden';
import { LISTS, isList, type ListKey } from '@/lib/lists';
import Avatar from '@/components/Avatar';
import { leave, sendCheer } from '../actions';

export const dynamic = 'force-dynamic';

const fi = (n: number, d = 0) => n.toLocaleString('fi-FI', { maximumFractionDigits: d });

export default async function Karki({ searchParams }: { searchParams: { lista?: string; nayta?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const { board: all, me, sentToday } = await loadGarden();
  const key: ListKey = isList(searchParams.lista) ? searchParams.lista : 'kaikki';
  const week = searchParams.nayta === 'viikko';
  const L = LISTS[key];
  const score = (b: (typeof all)[number]) => (week || key === 'nousu' ? L.week(b) : L.total(b));
  const board = [...all].sort((a, b) => score(b) - score(a));
  const medal = ['🥇', '🥈', '🥉'];
  const href = (l: ListKey, w: boolean) => `/karki?lista=${l}${w ? '&nayta=viikko' : ''}`;

  const vals = all.map(score);
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const best = Math.max(0, ...vals);
  const mine = me ? score(me) : 0;

  const sub = (b: (typeof all)[number]) => {
    if (key === 'kaikki') return `${b.stepPts} p askelista · ${b.sportPts} p liikunnasta${b.bonusPts ? ` · ${b.bonusPts} p viikkotavoitteista` : ''}`;
    if (key === 'askeleet') return week ? `${b.week.activeDays} hyvää päivää` : `ka. ${fi(b.avgSteps)} / pv · paras ${fi(b.bestDay)}`;
    if (key === 'nousu') return `tällä viikolla ${fi(b.week.steps)} · viime viikon samaan aikaan ${fi(b.lastWeek.steps)}${b.lastWeek.steps > 0 ? ` (${b.week.steps >= b.lastWeek.steps ? '+' : '−'}${Math.abs(Math.round(((b.week.steps - b.lastWeek.steps) / b.lastWeek.steps) * 100))} %)` : ''}`;
    if (key === 'luova') return `${b.goal.creativeDays} luovaa päivää tällä viikolla`;
    return week ? `${b.goal.sportDays} urheilupäivää` : `${b.goal.sportDays} / ${3} urheilupäivää tällä viikolla`;
  };

  return (
    <>
      <h1>Kärki</h1>
      <div className="seg five">
        {(Object.keys(LISTS) as ListKey[]).map((k) => <Link key={k} href={href(k, week)} className={k === key ? 'on' : ''}>{LISTS[k].label}</Link>)}
      </div>
      {key !== 'nousu' && (
        <div className="seg">
          <Link href={href(key, false)} className={!week ? 'on' : ''}>Koko kausi</Link>
          <Link href={href(key, true)} className={week ? 'on' : ''}>Tämä viikko</Link>
        </div>
      )}
      {key === 'nousu' && <p className="muted" style={{ margin: '-6px 0 12px' }}>Kuka on kasvattanut askeleitaan eniten: tämä viikko verrattuna viime viikon samaan ajankohtaan. Tässä voi voittaa kuka tahansa.</p>}

      <section className="card">
        <h2>Vertailu</h2>
        <div className="tiles">
          <div><b>{L.fmt(best)}</b><span>Paras</span></div>
          <div><b>{L.fmt(Math.round(avg))}</b><span>Ryhmän keskiarvo</span></div>
          <div><b>{L.fmt(mine)}</b><span>Sinä</span><small>{avg > 0 ? `${mine >= avg ? '+' : '−'}${fi(Math.abs(Math.round(((mine - avg) / avg) * 100)))} % keskiarvoon` : ''}</small></div>
        </div>
      </section>

      <section className="card">
        <h2>{key === 'nousu' ? 'Nousu viime viikkoon verrattuna' : `${L.label}${week ? ' · viikko' : ' · kausi'}`}</h2>
        {board.length === 0 ? <p className="muted">Ei vielä keijuja.</p> : (
          <ol className="rank">
            {board.map((b, i) => {
              const diff = me && !b.mine ? score(b) - mine : null;
              return (
                <li key={b.id} className={b.mine ? 'me' : ''}>
                  <span className="pos">{medal[i] ?? i + 1}</span>
                  <span className="nm"><Avatar a={b} size={38} badge={stageFor(b.pts).stage.emoji} stage={b.stageIdx} />
                    <span>{b.name}<small>{sub(b)}</small>{key === 'askeleet' && <small>synkattu {ago(b.lastSync)}</small>}</span>
                  </span>
                  <span className="pt">{L.fmt(score(b))}{diff !== null && <small className={diff > 0 ? 'neg' : 'pos2'}>{diff > 0 ? '+' : diff < 0 ? '−' : ''}{fi(Math.abs(diff))}</small>}</span>
                  {me && !b.mine && (
                    <form action={sendCheer}>
                      <input type="hidden" name="to" value={b.id} />
                      <button className={`cheer ${sentToday.includes(b.id) ? 'sent' : ''}`} disabled={sentToday.includes(b.id)} title="Lähetä kimalle">{sentToday.includes(b.id) ? '💌' : '✨'}</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        <p className="muted">Pienet luvut oikealla: ero sinuun (+ = edellä sinua). Napauta ✨ ja lähetä kimalle. Pisteet: 1 p / 2 500 askelta, 1 p / 30 min urheilua ja 1 p / 30 min luovaa harrastusta.</p>
      </section>
      <form action={leave}><button className="btn ghost">Poistu tältä laitteelta</button></form>
    </>
  );
}
