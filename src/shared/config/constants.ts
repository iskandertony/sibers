export const USERS_JSON_URL = import.meta.env.VITE_USERS_JSON_PROXY ?? "/__users/test/frontend/users.json";

export const LS_KEYS = {
  profileUserJsonId: "app.profile.userJsonId",
  profileSnapshot: "app.profile.snapshot",
  profileVersion: "app.profile.version",
  lastLoginAt: "app.lastLoginAt"
} as const;
