import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import { AVATAR_BGS, AVATAR_EMOJIS } from '@/lib/avatar';
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
        <button className="btn">{uusi ? 'Valmis, puutarhaan 🌸' : 'Tallenna'}</button>
      </form>
    </>
  );
}
