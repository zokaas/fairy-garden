export const TEAMS = [
  { id: 'sienet', emoji: '🍄', name: 'Sienet' },
  { id: 'perhoset', emoji: '🦋', name: 'Perhoset' },
  { id: 'kukat', emoji: '🌸', name: 'Kukat' },
  { id: 'tahdet', emoji: '⭐', name: 'Tähdet' },
] as const;

export function teamOf(id: string | null | undefined) {
  return TEAMS.find((t) => t.id === id) ?? null;
}
