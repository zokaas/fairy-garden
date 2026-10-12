'use client';
import { useEffect, useState } from 'react';

/** Päivälaskuri: "N päivää jäljellä". to = ISO-aika. */
export default function Countdown({ to, label = 'päivää kisaa jäljellä', doneText = 'Kisa on päättynyt 🏁' }: { to: string; label?: string; doneText?: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const ms = Date.parse(to) - Date.now();
    if (ms <= 0) return setText(doneText);
    const d = Math.floor(ms / 86_400_000);
    setText(d === 0 ? `Kisa päättyy tänään! ${Math.max(1, Math.ceil(ms / 3_600_000))} t jäljellä` : `${d} ${label}`);
  }, [to, label, doneText]);
  return <p className="countdown">✨ {text ?? ''} ✨</p>;
}
