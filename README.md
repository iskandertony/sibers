круто, обновил README под текущий проект и наш стек. Можешь просто заменить содержимое файла.

```md
# Realtime Chat (React + Vite + TS + AntD + SCSS + Zustand + Supabase)

**Goal:** production-minded skeleton for a real-time chat using **Supabase** (Anonymous Auth + Realtime + Postgres Changes) and a users catalog from `users.json`.

> Comments and texts are short and human-readable. All UI is in English.

---

## Stack

- React 18, Vite, TypeScript
- Ant Design 5, SCSS modules
- Zustand (global store)
- Supabase JS v2 (auth + realtime + DB)
- Zod (runtime validation)
- Fetch API (no axios)

---

## Features

- **Auto sign-in:** on first visit a **random** user from `users.json` is picked, saved to `localStorage`, and shown via toast.
- **Channels:** create, list, discover (public), join, open.
- **Invites:** invite a catalog user into your channel; accept from “My invites”.
- **Members panel:** online badge via Realtime presence; owner can kick; sorted by online/owner/name.
- **Messages:** realtime via Postgres Changes; optimistic send; duplicate-safe; broadcast fallback if WAL delivery is late.
- **Dark UI:** customized via AntD `ConfigProvider` + CSS variables; notifications on the top-right.

> DB + RLS policies are set up for safe read/write from the browser with **Anonymous** role.

---

## Project structure (FSD-light)

```
src/
app/                 # app shell, theming, providers
pages/               # route-level pages (ChatPage, etc)
widgets/             # big composites (sidebar, members-panel, chat-input)
features/            # invite-user, create-channel, discover-channel, ...
entities/            # channel, message, member, user (api + model + ui)
shared/              # api (supabase), ui primitives, config, lib

## Local development

```bash
npm install
npm run dev
# open http://localhost:5173

```

## Theming

* Global tokens via `ConfigProvider` (`algorithm: dark`, `colorPrimary`, etc.).
* Component tokens for Button hover/active text color.
* Extra overrides live in SCSS modules; no inline styles except rare tokens.
