'use client';
import { fairyName } from '@/lib/garden';

export default function NameDice({ inputId }: { inputId: string }) {
  return (
    <button type="button" className="btn ghost" style={{ marginBottom: 8 }} onClick={() => {
      const el = document.getElementById(inputId) as HTMLInputElement | null;
      if (el) { el.value = fairyName(); el.focus(); }
    }}>
      🎲 Arvo keijunimi
    </button>
  );
}
