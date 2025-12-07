export const PROJECT_AVATAR_KEYS = [
  "default",
  "purple",
  "purple_alt",
  "purple_alt2",
  "purple_alt3",
  "orange",
] as const;

export type ProjectAvatarKey = (typeof PROJECT_AVATAR_KEYS)[number];

export function isValidAvatarKey(key: string | null | undefined): key is ProjectAvatarKey {
  return !!key && PROJECT_AVATAR_KEYS.includes(key as ProjectAvatarKey);
}

export function randomAvatarKey(): ProjectAvatarKey {
  const idx = Math.floor(Math.random() * PROJECT_AVATAR_KEYS.length);
  return PROJECT_AVATAR_KEYS[idx];
}

export function deterministicAvatarKey(seed: string): ProjectAvatarKey {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PROJECT_AVATAR_KEYS[hash % PROJECT_AVATAR_KEYS.length];
}

