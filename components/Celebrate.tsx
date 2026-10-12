'use client';
import { useEffect, useState } from 'react';

/** Juhlii, kun puutarhaan puhkeaa uusi kukka (verrattuna edelliseen käyntiin tällä laitteella). */
export default function Celebrate({ flowers, force }: { flowers: number; force?: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (force) {
      setShow(true);
      setTimeout(() => setShow(false), 5000);
      return;
    }
    try {
      const prev = Number(localStorage.getItem('fg_flowers') ?? '-1');
      localStorage.setItem('fg_flowers', String(flowers));
      if (prev >= 0 && flowers > prev) {
        setShow(true);
        setTimeout(() => setShow(false), 5000);
      }
    } catch {}
  }, [flowers, force]);
  if (!show) return null;
  return (
    <div className="celebrate" onClick={() => setShow(false)}>
      {Array.from({ length: 36 }, (_, i) => (
        <span key={i} className={`confetti c${i % 5}`} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 9) * 0.18}s`, ['--s' as string]: `${0.8 + (i % 4) * 0.25}` }} />
      ))}
      <div className="celebrate-card">
        <div style={{ fontSize: 64 }}>🌸</div>
        <h2>Uusi kukka puhkesi!</h2>
        <p>Puutarhassasi on nyt <b>{flowers}</b> {flowers === 1 ? 'kukka' : 'kukkaa'}.</p>
      </div>
    </div>
  );
}
