'use client';
import { useEffect, useState } from 'react';

/** Juhlii, kun taso nousee (verrattuna edelliseen käyntiin tällä laitteella). */
export default function Celebrate({ stageIdx, stageName, emoji, force }: { stageIdx: number; stageName: string; emoji: string; force?: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (force) {
      setShow(true);
      setTimeout(() => setShow(false), 5000);
      return;
    }
    try {
      const prev = Number(localStorage.getItem('fg_stage') ?? '-1');
      localStorage.setItem('fg_stage', String(stageIdx));
      if (prev >= 0 && stageIdx > prev) {
        setShow(true);
        setTimeout(() => setShow(false), 5000);
      }
    } catch {}
  }, [stageIdx, force]);
  if (!show) return null;
  const bits = ['🌸', '✨', '🦋', '🌷', '💖', '🌼'];
  return (
    <div className="celebrate" onClick={() => setShow(false)}>
      {Array.from({ length: 36 }, (_, i) => (
        <span key={i} className="confetti" style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 9) * 0.18}s`, fontSize: 18 + (i % 4) * 6 }}>
          {bits[i % bits.length]}
        </span>
      ))}
      <div className="celebrate-card">
        <div style={{ fontSize: 64 }}>{emoji}</div>
        <h2>Uusi taso!</h2>
        <p>Olet nyt <b>{stageName}</b> ✨</p>
      </div>
    </div>
  );
}
