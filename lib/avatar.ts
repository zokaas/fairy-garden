export const AVATAR_EMOJIS = ['🧚🏻‍♀️', '🧚🏼‍♀️', '🧚🏽‍♀️', '🧚🏾‍♀️', '🧚🏿‍♀️', '🧚🏼‍♂️', '🦋', '🐰', '🦄', '🍄', '🌸', '🦊', '🐸', '🐝', '🦉', '🐞', '🌙', '⭐'];
export const AVATAR_BGS = ['#f8d7ec', '#d7f2e3', '#e4d9fb', '#fde8c4', '#d4ecfb', '#ffd9d2', '#f3f0b8', '#ffe0f4'];

export function avatarUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
}
