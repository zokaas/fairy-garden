'use client';
import { useMemo, useState } from 'react';
import Avatar from './Avatar';
import FairyFigure from './FairyFigure';
import PhotoPicker from './PhotoPicker';
import { AVATAR_BGS, AVATAR_EMOJIS, AVATAR_GROUPS } from '@/lib/avatar';

type Mode = 'hahmo' | 'kuva';

/** Avatarin muokkaus: valitse ensin keiju-hahmo (hahmo ja tausta) tai oma kuva. Elävä esikatselu pysyy näkyvissä. */
export default function AvatarEditor({ initial, stage, photoPath, photoVer, isNew, saveAction, removeAction }: {
  initial: { name: string; emoji: string; bg: string };
  stage: number;
  photoPath: string | null;
  photoVer: string | null;
  isNew: boolean;
  saveAction: (fd: FormData) => void | Promise<void>;
  removeAction: (fd: FormData) => void | Promise<void>;
}) {
  const [name, setName] = useState(initial.name);
  const [emoji, setEmoji] = useState(initial.emoji);
  const [bg, setBg] = useState(initial.bg);
  const [mode, setMode] = useState<Mode>(photoPath ? 'kuva' : 'hahmo');
  const initialMode: Mode = photoPath ? 'kuva' : 'hahmo';

  const dirty = isNew || mode !== initialMode || name !== initial.name || emoji !== initial.emoji || bg !== initial.bg;
  const preview = useMemo(() => ({ avatarEmoji: emoji, avatarBg: bg, avatarPath: mode === 'kuva' ? photoPath : null, avatarVer: photoVer }), [emoji, bg, mode, photoPath, photoVer]);

  function randomize() {
    const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
    setEmoji(pick(AVATAR_EMOJIS));
    setBg(pick(AVATAR_BGS));
  }

  return (
    <form action={saveAction} className="card editor">
      {isNew && <input type="hidden" name="uusi" value="1" />}
      <input type="hidden" name="emoji" value={emoji} />
      <input type="hidden" name="bg" value={bg} />
      <input type="hidden" name="mode" value={mode} />

      <div className="ed-preview">
        <div className="ed-big"><Avatar a={preview} size={124} stage={stage} /></div>
        <div className="ed-small">
          <div><Avatar a={preview} size={40} stage={stage} /><small>listassa</small></div>
          <div><Avatar a={preview} size={64} stage={stage} /><small>puutarhassa</small></div>
        </div>
        <div className="ed-actions">
          <button type="button" className="btn ghost ed-rand" onClick={randomize}>Yllätä minut</button>
          {dirty && !isNew && <button type="button" className="btn ghost ed-rand" onClick={() => { setName(initial.name); setEmoji(initial.emoji); setBg(initial.bg); }}>Peru muutokset</button>}
        </div>
      </div>

      <label className="ed-label" htmlFor="ed-name">Nimi</label>
      <input id="ed-name" name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required />

      <p className="ed-label">Avatarin tyyppi</p>
      <div className="seg ed-mode" role="radiogroup" aria-label="Avatarin tyyppi">
        <a role="radio" aria-checked={mode === 'hahmo'} className={mode === 'hahmo' ? 'on' : ''} onClick={() => setMode('hahmo')}>🧚 Keiju-hahmo</a>
        <a role="radio" aria-checked={mode === 'kuva'} className={mode === 'kuva' ? 'on' : ''} onClick={() => setMode('kuva')}>📷 Oma kuva</a>
      </div>

      {mode === 'hahmo' && (
        <>
          <p className="ed-label ed-sec">1. Hahmo</p>
          {AVATAR_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="ed-label ed-grp">{g.title}</p>
              <div className="picker" role="radiogroup" aria-label={g.title}>
                {g.items.map((e) => (
                  <button type="button" key={e} role="radio" aria-checked={emoji === e} className={`pick ${emoji === e ? 'sel' : ''}`} onClick={() => setEmoji(e)} title={e === 'fig' ? 'Piirretty keiju' : e}>
                    {e === 'fig' ? <FairyFigure stage={stage} size={36} /> : e}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <p className="ed-label ed-sec">2. Taustaväri</p>
          <div className="picker colors" role="radiogroup" aria-label="Taustaväri">
            {AVATAR_BGS.map((c) => (
              <button type="button" key={c} role="radio" aria-checked={bg === c} aria-label="Taustaväri" className={`pick ${bg === c ? 'sel' : ''}`} onClick={() => setBg(c)}><i style={{ background: c }} /></button>
            ))}
          </div>
        </>
      )}

      {mode === 'kuva' && (
        <>
          <PhotoPicker hasPhoto={!!photoPath} />
          <p className="muted">Oma kuva korvaa hahmon ja näkyy kaikille. Kuva rajataan neliöksi keskeltä. Kuva tallentuu heti, kun valitset sen.</p>
          {photoPath && <button type="submit" formAction={removeAction} formNoValidate className="btn ghost">Poista kuva ja käytä keiju-hahmoa</button>}
        </>
      )}

      <div className={`ed-save ${dirty ? 'dirty' : ''}`}>
        <button className="btn" disabled={!dirty}>{isNew ? 'Valmis, puutarhaan' : dirty ? 'Tallenna muutokset' : 'Ei tallennettavaa'}</button>
      </div>
    </form>
  );
}
