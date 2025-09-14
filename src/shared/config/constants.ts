export const USERS_JSON_URL = import.meta.env.VITE_USERS_JSON_URL as string;

export const LS_KEYS = {
  profileUserJsonId: 'app.profile.userJsonId',
  profileSnapshot: 'app.profile.snapshot',
  profileVersion: 'app.profile.version',
  lastLoginAt: 'app.lastLoginAt',
  authUserId: 'app.auth.userId',
} as const
