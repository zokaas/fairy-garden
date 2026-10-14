import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden, loadRaw } from '@/lib/data';
import { ago, fp, helsinkiDay, kindOf, weekStart } from '@/lib/garden';
import { LISTS, isList, type ListKey } from '@/lib/lists';
import Avatar from '@/components/Avatar';

export const dynamic = 'force-dynamic';

const fi = (n: number, d = 0) => n.toLocaleString('fi-FI', { maximumFractionDigits: d });

const key0IsActivity = (l?: string) => l === 'urheilu' || l === 'luova';

export default async function Karki({ searchParams }: { searchParams: { lista?: string; nayta?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const { board: all, me } = await loadGarden();
  const raw = key0IsActivity(searchParams.lista) ? await loadRaw() : null;
  const key: ListKey = isList(searchParams.lista) ? searchParams.lista : 'kaikki';
  const week = searchParams.nayta === 'viikko';
  const L = LISTS[key];
  const score = (b: (typeof all)[number]) => (week || key === 'nousu' || key === 'tanaan' ? L.week(b) : L.total(b));
  const board = [...all].sort((a, b) => score(b) - score(a));
  const medal = ['🥇', '🥈', '🥉'];
  // lajit nimen alle (Urheilu / Luova): valitun jakson kirjaukset lajeittain
  const since = week ? weekStart(helsinkiDay()) : '0000-00-00';
  const wantKind = key === 'luova' ? 'luova' : 'urheilu';
  const acts = (id: string): string => {
    if (!raw) return '';
    const m = new Map<string, number>();
    for (const w of raw.workouts) if (w.fairy_id === id && w.day >= since && kindOf(w.sport) === wantKind) m.set(w.sport, (m.get(w.sport) ?? 0) + w.minutes);
    const list = [...m.entries()].sort((a, b) => b[1] - a[1]);
    if (list.length === 0) return '';
    const shown = list.slice(0, 3).map(([sp, min]) => `${sp} ${min} min`).join(' · ');
    return list.length > 3 ? `${shown} · +${list.length - 3} muuta` : shown;
  };
  const href = (l: ListKey, w: boolean) => `/karki?lista=${l}${w ? '&nayta=viikko' : ''}`;

  const vals = all.map(score);
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const best = Math.max(0, ...vals);
  const mine = me ? score(me) : 0;

  const sub = (b: (typeof all)[number]) => {
    if (key === 'kaikki') return `${fp(b.stepPts)} p askelista · ${fp(b.sportOnlyPts)} p urheilusta · ${fp(b.creativePts)} p luovasta${b.bonusPts ? ` · ${b.bonusPts} p viikkotavoitteista` : ''}`;
    if (key === 'tanaan') return `${b.today >= b.goal.todayTarget ? '✓ päivän tavoite täynnä' : `tavoite ${fi(b.goal.todayTarget)}`} · synkattu ${ago(b.lastSync)}`;
    if (key === 'askeleet') return week ? `${b.week.activeDays} hyvää päivää` : `ka. ${fi(b.avgSteps)} / pv · paras ${fi(b.bestDay)}`;
    if (key === 'nousu') return `tällä viikolla ${fi(b.week.steps)} · viime viikon samaan aikaan ${fi(b.lastWeek.steps)}${b.lastWeek.steps > 0 ? ` (${b.week.steps >= b.lastWeek.steps ? '+' : '−'}${Math.abs(Math.round(((b.week.steps - b.lastWeek.steps) / b.lastWeek.steps) * 100))} %)` : ''}`;
    if (key === 'luova') return `${b.goal.creativeDays} luovaa päivää tällä viikolla`;
    return week ? `${b.goal.sportDays} urheilupäivää` : `${b.goal.sportDays} / ${3} urheilupäivää tällä viikolla`;
  };

  return (
    <>
      <h1>Kärki</h1>
      <div className="seg six">
        {(Object.keys(LISTS) as ListKey[]).map((k) => <Link key={k} href={href(k, week)} className={k === key ? 'on' : ''}>{LISTS[k].label}</Link>)}
      </div>
      {key !== 'nousu' && key !== 'tanaan' && (
        <div className="seg">
          <Link href={href(key, false)} className={!week ? 'on' : ''}>Koko kausi</Link>
          <Link href={href(key, true)} className={week ? 'on' : ''}>Tämä viikko</Link>
        </div>
      )}
      {key !== 'tanaan' && key !== 'nousu' && <p className="muted" style={{ margin: '-6px 0 12px' }}>{{
        kaikki: 'Kaikki pisteet yhteensä: askeleet, urheilu, luova ja viikkobonukset.',
        askeleet: 'Kisan askeleet yhteensä. Valitse Tämä viikko nähdäksesi viikon askeleet.',
        urheilu: 'Urheilun minuutit. Pieni teksti kertoo urheilupäivät tällä viikolla (tavoite 3).',
        luova: 'Luovien harrastusten minuutit. Pisteitä luovasta saa enintään 2 h viikossa.',
      }[key]}{(key === 'urheilu' || key === 'luova') && <> <Link href="/tekemiset">Katso kaikkien kirjaukset (kuka teki mitä) →</Link></>}</p>}
      {key === 'tanaan' && <p className="muted" style={{ margin: '-6px 0 12px' }}>Askeleet tänään. Luvut päivittyvät, kun keiju synkkaa askeleensa.</p>}
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
        <h2>{key === 'nousu' ? 'Nousu viime viikkoon verrattuna' : key === 'tanaan' ? 'Askeleet tänään' : `${L.label}${week ? ' · viikko' : ' · kausi'}`}</h2>
        {board.length === 0 ? <p className="muted">Ei vielä keijuja.</p> : (
          <ol className="rank">
            {board.map((b, i) => {
              const diff = me && !b.mine ? score(b) - mine : null;
              return (
                <li key={b.id} className={b.mine ? 'me' : ''}>
                  <span className="pos">{medal[i] ?? i + 1}</span>
                  <Link href={`/keiju/${b.id}`} className="nm"><Avatar a={b} size={38} stage={b.stageIdx} />
                    <span>{b.name}<small>{sub(b)}</small>{(key === 'urheilu' || key === 'luova') && (acts(b.id) ? <small>{key === 'luova' ? '🎨' : '💪'} {acts(b.id)}</small> : <small>ei kirjauksia</small>)}{key === 'askeleet' && <small>synkattu {ago(b.lastSync)}</small>}</span>
                  </Link>
                  <span className="pt">{L.fmt(score(b))}{diff !== null && <small className={diff > 0 ? 'neg' : 'pos2'}>{diff > 0 ? '+' : diff < 0 ? '−' : ''}{fi(Math.abs(diff))}</small>}</span>
                </li>
              );
            })}
          </ol>
        )}
        <p className="muted">Pienet luvut oikealla: ero sinuun (+ = edellä sinua). Pisteiden säännöt: <Link href="/ohje">Näin kisa toimii →</Link></p>
      </section>
    </>
  );
}
