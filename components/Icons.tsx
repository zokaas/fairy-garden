const p = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconGarden = () => (
  <svg {...p}><circle cx="12" cy="9" r="2.2" /><path d="M12 6.8c-.8-2.6 1-4 0-4.8M12 11.2c.8 2.6-1 4 0 4.8M9.8 9c-2.6-.8-4 1-4.8 0M14.2 9c2.6.8 4-1 4.8 0M10.4 7.4C8.8 5.4 6.6 5.6 6 6.2M13.6 10.6c1.6 2 3.8 1.8 4.4 1.2" /><path d="M12 16v6M12 19c-2.5 0-3.6-1.4-4-2.6M12 20c2.2 0 3.4-1.2 3.8-2.4" /></svg>
);
export const IconLog = () => (
  <svg {...p}><path d="M5 19l1-4 9.6-9.6a1.8 1.8 0 012.6 0l.4.4a1.8 1.8 0 010 2.6L9 18l-4 1z" /><path d="M13.5 7.5l3 3M4 22h16" /></svg>
);
export const IconTrophy = () => (
  <svg {...p}><path d="M8 3h8v6a4 4 0 01-8 0V3z" /><path d="M8 5H4.5v1.5A3 3 0 007.5 9.5M16 5h3.5v1.5a3 3 0 01-3 3M12 13v4M8.5 21h7M9.5 17h5v4h-5z" /></svg>
);
export const IconStats = () => (
  <svg {...p}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /><circle cx="4" cy="8" r=".6" /><circle cx="10" cy="2.5" r=".6" /><circle cx="16" cy="10" r=".6" /></svg>
);
export const IconFlag = () => (
  <svg {...p}><path d="M5 22V3M5 4c4-2 7 2 11 0 1.4-.7 2.6-.6 3 0v8c-.4-.6-1.6-.7-3 0-4 2-7-2-11 0" /></svg>
);
