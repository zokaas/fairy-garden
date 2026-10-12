export const AVATAR_EMOJIS = ['🧚🏻‍♀️', '🧚🏼‍♀️', '🧚🏽‍♀️', '🧚🏾‍♀️', '🧚🏿‍♀️', '🧚🏼‍♂️', '🦋', '🐰', '🦄', '🍄', '🌸', '🦊', '🐸', '🐝', '🦉', '🐞', '🌙', '⭐'];
export const AVATAR_BGS = ['#f8d7ec', '#d7f2e3', '#e4d9fb', '#fde8c4', '#d4ecfb', '#ffd9d2', '#f3f0b8', '#ffe0f4'];

export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
}

/** Asusteet aukeavat tasojen mukana. */
export const ACCESSORIES = [
  { id: 'none', emoji: '', name: 'Ei asustetta', stage: 0 },
  { id: 'sprout', emoji: '🌱', name: 'Taimi', stage: 1 },
  { id: 'sparkle', emoji: '✨', name: 'Kimallus', stage: 2 },
  { id: 'flowers', emoji: '🌸', name: 'Kukkaseppele', stage: 3 },
  { id: 'wings', emoji: '🪽', name: 'Siivet', stage: 4 },
  { id: 'crown', emoji: '👑', name: 'Kruunu', stage: 5 },
] as const;

export function accEmoji(id: string | null | undefined): string {
  return ACCESSORIES.find((a) => a.id === id)?.emoji ?? '';
}
