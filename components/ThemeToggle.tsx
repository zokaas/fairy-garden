'use client';
import { useEffect, useState } from 'react';

type Mode = 'auto' | 'light' | 'dark';
const OPTIONS: [Mode, string][] = [['auto', 'Automaattinen'], ['light', 'Vaalea'], ['dark', 'Tumma']];
const KEY = 'fg_theme';

function apply(mode: Mode) {
  if (mode === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', mode);
}

/** Valitsee ulkoasun: automaattinen (laitteen asetus), vaalea tai tumma. Tallennetaan laitteelle. */
export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('auto');
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'light' || v === 'dark') setMode(v);
    } catch { /* ei tallennusta */ }
  }, []);
  function pick(m: Mode) {
    setMode(m);
    apply(m);
    try { m === 'auto' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, m); } catch { /* ei tallennusta */ }
  }
  return (
    <div className="seg" role="radiogroup" aria-label="Ulkoasu">
      {OPTIONS.map(([k, label]) => (
        <a key={k} role="radio" aria-checked={mode === k} className={mode === k ? 'on' : ''} onClick={() => pick(k)}>{label}</a>
      ))}
    </div>
  );
}
