'use client';
import { useEffect, useRef, useState } from 'react';

/** Laskee luvun ylös 0:sta. Teksti kuten "363,9 km" tai "485 157": numero animoidaan, loppuosa pysyy. Muuta tekstiä ei muuteta. */
export default function CountUp({ text }: { text: string }) {
  const raw = /^(\d(?:[\d\s ]*\d)?)(?:,(\d+))?(.*)$/.exec(text);
  const m = raw && !/^\.\d/.test(raw[3]) ? raw : null; // päivämääriä (3.10.) ei animoida
  const [v, setV] = useState<number | null>(null);
  const box = useRef<HTMLSpanElement>(null);
  const target = m ? Number(`${m[1].replace(/[\s ]/g, '')}${m[2] ? `.${m[2]}` : ''}`) : 0;
  const dec = m?.[2]?.length ?? 0;
  useEffect(() => {
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1100);
        setV(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.4 });
    if (box.current) io.observe(box.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  if (!m || v === null) return <span ref={box}>{text}</span>;
  return <span ref={box}>{v.toLocaleString('fi-FI', { minimumFractionDigits: dec, maximumFractionDigits: dec })}{m[3]}</span>;
}
