'use client';
import { useRef, useState } from 'react';

type Spark = { id: number; x: number; y: number; e: string };

/** Puutarhan kuori: napautus sirottaa keijupölyä, keijua napauttamalla se puhuu. */
export default function GardenFx({ phase, lines, children }: { phase: string; lines: string[]; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [say, setSay] = useState<string | null>(null);
  const idRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  return (
    <div
      ref={ref}
      className={`garden ${phase}`}
      onPointerDown={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const bits = ['✨', '🌸', '💖', '⭐', '🦋'];
        const batch = Array.from({ length: 6 }, (_, i) => ({
          id: ++idRef.current, x: e.clientX - r.left + (i - 3) * 6, y: e.clientY - r.top, e: bits[(idRef.current + i) % bits.length],
        }));
        setSparks((s) => [...s.slice(-18), ...batch]);
        setTimeout(() => setSparks((s) => s.filter((x) => !batch.includes(x))), 1100);
        if ((e.target as HTMLElement).closest('.fairy') && lines.length) {
          setSay(lines[Math.floor(Math.random() * lines.length)]);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setSay(null), 3500);
        }
      }}
    >
      {children}
      {sparks.map((s, i) => (
        <span key={s.id} className="spark" style={{ left: s.x, top: s.y, ['--dx' as string]: `${(i % 6 - 2.5) * 16}px` }}>{s.e}</span>
      ))}
      {say && <div className="bubble">{say}</div>}
    </div>
  );
}
