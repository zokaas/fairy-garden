'use client';
import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark' | 'auto';
const OPTIONS: [Mode, string][] = [['light', 'Vaalea'], ['dark', 'Tumma'], ['auto', 'Laitteen mukaan']];
const KEY = 'fg_theme';

function apply(mode: Mode) {
  if (mode === 'light') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', mode);
}

/** Ulkoasu: vaalea (oletus), tumma tai laitteen asetuksen mukaan. Tallennetaan laitteelle. */
export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('light');
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'dark' || v === 'auto') setMode(v);
    } catch { /* ei tallennusta */ }
  }, []);
  function pick(m: Mode) {
    setMode(m);
    apply(m);
    try { m === 'light' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, m); } catch { /* ei tallennusta */ }
  }
  return (
    <div className="seg" role="radiogroup" aria-label="Ulkoasu">
      {OPTIONS.map(([k, label]) => (
        <a key={k} role="radio" aria-checked={mode === k} className={mode === k ? 'on' : ''} onClick={() => pick(k)}>{label}</a>
      ))}
    </div>
  );
}
