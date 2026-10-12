'use client';
import { useEffect, useState } from 'react';

/** Laskee luvun ylös 0:sta. Teksti kuten "363,9 km" tai "485 157": numero animoidaan, loppuosa pysyy. Muuta tekstiä ei muuteta. */
export default function CountUp({ text }: { text: string }) {
  const raw = /^(\d(?:[\d\s ]*\d)?)(?:,(\d+))?(.*)$/.exec(text);
  const m = raw && !/^\.\d/.test(raw[3]) ? raw : null; // päivämääriä (3.10.) ei animoida
  const [v, setV] = useState<number | null>(null);
  const target = m ? Number(`${m[1].replace(/[\s ]/g, '')}${m[2] ? `.${m[2]}` : ''}`) : 0;
  const dec = m?.[2]?.length ?? 0;
  useEffect(() => {
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1000);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  if (!m || v === null) return <>{text}</>;
  return <>{v.toLocaleString('fi-FI', { minimumFractionDigits: dec, maximumFractionDigits: dec })}{m[3]}</>;
}
