export type Stats = { totalSteps: number; bestDay: number; bestStreak: number; workouts: number; mins: number; hasSteps: boolean; stageIdx: number };

export const BADGES: { id: string; emoji: string; name: string; desc: string; test: (s: Stats) => boolean }[] = [
  { id: 'eka', emoji: '🌱', name: 'Ensiaskeleet', desc: 'Ensimmäiset askeleet kirjattu', test: (s) => s.hasSteps },
  { id: '10k', emoji: '👟', name: 'Kymppitonni', desc: '10 000 askelta yhdessä päivässä', test: (s) => s.bestDay >= 10_000 },
  { id: '20k', emoji: '🚀', name: 'Supervaeltaja', desc: '20 000 askelta yhdessä päivässä', test: (s) => s.bestDay >= 20_000 },
  { id: 's3', emoji: '🔥', name: 'Kolmen putki', desc: '3 aktiivista päivää peräkkäin', test: (s) => s.bestStreak >= 3 },
  { id: 's7', emoji: '🌈', name: 'Viikon putki', desc: '7 aktiivista päivää peräkkäin', test: (s) => s.bestStreak >= 7 },
  { id: 's14', emoji: '💎', name: 'Kahden viikon putki', desc: '14 aktiivista päivää peräkkäin', test: (s) => s.bestStreak >= 14 },
  { id: 'liikkuja', emoji: '💪', name: 'Liikkuja', desc: '5 liikuntakirjausta', test: (s) => s.workouts >= 5 },
  { id: 'hullu', emoji: '🏋️', name: 'Liikuntahullu', desc: '300 minuuttia liikuntaa', test: (s) => s.mins >= 300 },
  { id: 'sata', emoji: '💯', name: 'Sata tuhatta', desc: '100 000 askelta yhteensä', test: (s) => s.totalSteps >= 100_000 },
  { id: 'kukka', emoji: '🌸', name: 'Kukkaan puhjennut', desc: 'Taso Kukka', test: (s) => s.stageIdx >= 3 },
  { id: 'keiju', emoji: '🧚🏼‍♀️', name: 'Oikea keiju', desc: 'Taso Keiju', test: (s) => s.stageIdx >= 4 },
  { id: 'kunk', emoji: '👑', name: 'Keijukuningatar', desc: 'Korkein taso', test: (s) => s.stageIdx >= 5 },
];
