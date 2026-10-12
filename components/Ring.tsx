'use client';
import { useEffect, useState } from 'react';

export default function Ring({ value, goal }: { value: number; goal: number }) {
  const [shown, setShown] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    setPct(Math.min(1, value / goal));
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1200);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, goal]);
  const r = 70, c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 170 170" aria-hidden="true">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff4d94" />
            <stop offset="0.55" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle cx="85" cy="85" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
        <circle cx="85" cy="85" r={r} fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 85 85)"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div className="ring-txt">
        <b style={{ fontSize: shown >= 100000 ? '1.8rem' : shown >= 10000 ? '2.3rem' : undefined }}>{shown.toLocaleString('fi-FI')}</b>
        <span>/ {goal.toLocaleString('fi-FI')} askelta</span>
        {value >= goal && <em>Tavoite täynnä</em>}
      </div>
    </div>
  );
}
