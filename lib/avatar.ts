/** 'fig' = piirretty keiju, jonka asu kehittyy tason mukana. */
export const AVATAR_EMOJIS = ['fig', '🧚🏻‍♀️', '🧚🏼‍♀️', '🧚🏽‍♀️', '🧚🏾‍♀️', '🧚🏿‍♀️', '🧚🏼‍♂️', '🦋', '🐰', '🦄', '🍄', '🌸', '🦊', '🐸', '🐝', '🦉', '🐞', '🌙'];
export const AVATAR_BGS = [
  '#f8d7ec', '#d7f2e3', '#e4d9fb', '#fde8c4', '#d4ecfb', '#ffd9d2', '#f3f0b8', '#ffe0f4',
  'linear-gradient(135deg,#ff4d94,#8b5cf6)', 'linear-gradient(135deg,#8b5cf6,#38bdf8)', 'linear-gradient(135deg,#fbbf24,#fb7185)', 'linear-gradient(135deg,#34d399,#38bdf8)',
  'linear-gradient(135deg,#fde68a,#f9a8d4)', 'linear-gradient(135deg,#a78bfa,#f472b6)', 'linear-gradient(135deg,#1e1b4b,#7c3aed)', 'radial-gradient(circle,#ffffff,#f9a8d4)',
];

export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
}
