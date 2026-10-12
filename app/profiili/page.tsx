import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import { ACCESSORIES, AVATAR_BGS, AVATAR_EMOJIS } from '@/lib/avatar';
import { STAGES } from '@/lib/garden';
import Avatar from '@/components/Avatar';
import PhotoPicker from '@/components/PhotoPicker';
import { TEAMS } from '@/lib/teams';
import PushToggle from '@/components/PushToggle';
import { deleteAccount, removePhoto, saveAvatar, saveTeam } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Profiili({ searchParams }: { searchParams: { uusi?: string; ok?: string; virhe?: string } }) {
  const { me, board } = await loadGarden();
  if (!me) redirect('/');
  const uusi = !!searchParams.uusi;
  return (
    <>
      <h1>{uusi ? 'Valitse oma keijusi ' : 'Oma avatar'}</h1>
      <p className="sub">{uusi ? 'Voit vaihtaa tämän myöhemmin.' : 'Näkyy puutarhassa ja kärkilistalla.'}</p>
      {searchParams.ok && <p className="toast">Tallennettu 🌸</p>}

      <div style={{ textAlign: 'center', margin: '30px 0 16px' }}>
        <Avatar a={me} size={120} />
      </div>

      <section className="card">
        <PhotoPicker hasPhoto={!!me.avatarPath} />
        {me.avatarPath && (
          <form action={removePhoto}><button className="btn ghost" style={{ marginTop: 8 }}>Poista kuva (käytä keijua)</button></form>
        )}
        <p className="muted">Oma kuva näkyy kaikille puutarhassa. Ilman kuvaa näkyy alla valittu hahmo.</p>
      </section>

      <form action={saveAvatar} className="card">
        {uusi && <input type="hidden" name="uusi" value="1" />}
        <h2>Nimi</h2>
        <input name="name" defaultValue={me.name} maxLength={30} required />
        <h2>Hahmo</h2>
        <div className="picker">
          {AVATAR_EMOJIS.map((e) => (
            <label key={e}>
              <input type="radio" name="emoji" value={e} defaultChecked={(me.avatarEmoji ?? AVATAR_EMOJIS[1]) === e} required />
              <span>{e}</span>
            </label>
          ))}
        </div>
        <h2>Taustaväri</h2>
        <div className="picker colors">
          {AVATAR_BGS.map((c) => (
            <label key={c}>
              <input type="radio" name="bg" value={c} defaultChecked={(me.avatarBg ?? AVATAR_BGS[0]) === c} required />
              <span style={{ background: c }} />
            </label>
          ))}
        </div>
        <h2>Asuste</h2>
        <div className="picker">
          {ACCESSORIES.map((a) => {
            const open = me.stageIdx >= a.stage;
            return (
              <label key={a.id} className={open ? '' : 'locked'} title={open ? a.name : `Aukeaa tasolla ${STAGES[a.stage].name}`}>
                <input type="radio" name="acc" value={a.id} disabled={!open} defaultChecked={(me.avatarAcc ?? 'none') === a.id} />
                <span>{a.emoji || '∅'}{!open && <small className="lock">🔒</small>}</span>
              </label>
            );
          })}
        </div>
        <p className="muted">Asusteet aukeavat tasojen mukana: Itu 🌱, Silmu ✨, Kukka 🌸, Keiju 🪽, Keijukuningatar 👑.</p>
        <button className="btn">{uusi ? 'Valmis, puutarhaan 🌸' : 'Tallenna'}</button>
      </form>
          {!uusi && (
        <>
          <form action={saveTeam} className="card">
            <h2>Joukkue</h2>
            <div className="teams">
              {TEAMS.map((t) => (
                <label key={t.id}>
                  <input type="radio" name="team" value={t.id} defaultChecked={me.team === t.id} required />
                  <span>{t.emoji}<b>{t.name}</b><small>{board.filter((f) => f.team === t.id).length} jäsentä</small></span>
                </label>
              ))}
            </div>
            <button className="btn ghost">Liity joukkueeseen</button>
          </form>
          <section className="card">
            <h2>Askelten synkka</h2>
            <p className="muted">Oikotie, jolla iPhone lähettää askeleesi automaattisesti.</p>
            <a className="btn ghost" href="/shortcut">Avaa Synkka-ohje</a>
          </section>
          <section className="card">
            <h2>Ilmoitukset</h2>
            <PushToggle />
          </section>
        </>
      )}

  {!uusi && (
        <details className="card danger">
          <summary>Poista tunnukseni</summary>
          <p className="muted">Poistaa nimesi, askeleesi, liikuntasi ja avatarisi pysyvästi. Esim. jos sinulla on vahingossa kaksi tunnusta.</p>
          {searchParams.virhe && <p className="err">Nimi ei täsmännyt, tunnusta ei poistettu.</p>}
          <form action={deleteAccount}>
            <input name="confirm" placeholder={`Kirjoita nimesi: ${me.name}`} required />
            <button className="btn ghost">Poista pysyvästi</button>
          </form>
        </details>
      )}
    </>
  );
}
