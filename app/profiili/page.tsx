import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import { ACCESSORIES, AVATAR_BGS, AVATAR_EMOJIS } from '@/lib/avatar';
import { STAGES } from '@/lib/garden';
import Avatar from '@/components/Avatar';
import PhotoPicker from '@/components/PhotoPicker';
import { removePhoto, saveAvatar } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Profiili({ searchParams }: { searchParams: { uusi?: string; ok?: string } }) {
  const { me } = await loadGarden();
  if (!me) redirect('/');
  const uusi = !!searchParams.uusi;
  return (
    <>
      <h1>{uusi ? 'Valitse oma keijusi ✨' : '🧚🏼‍♀️ Oma avatar'}</h1>
      <p className="sub">{uusi ? 'Voit vaihtaa tämän myöhemmin.' : 'Näkyy puutarhassa ja kärkilistalla.'}</p>
      {searchParams.ok && <p className="toast">Tallennettu 🌸</p>}

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
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
    </>
  );
}
