'use client';
import { useEffect, useState } from 'react';

export default function SecretCountdown({ at }: { at: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, Date.parse(at) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [at]);
  if (left === null) return null;
  const d = Math.floor(left / 86_400_000), h = Math.floor(left / 3_600_000) % 24, m = Math.floor(left / 60_000) % 60, s = Math.floor(left / 1000) % 60;
  return (
    <div className="secret-count">
      {[['pv', d], ['t', h], ['min', m], ['s', s]].map(([l, v]) => (
        <div key={l as string}><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>
      ))}
    </div>
  );
}
