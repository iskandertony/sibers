# Realtime Chat (React + Vite + TS + AntD + SCSS + Zustand + Supabase)

**Goal:** a production-minded skeleton for a real-time chat using **Supabase** (Anonymous Auth + Realtime + Postgres Changes) and a users catalog from `users.json`.

> Comments and docs are short and human-readable.

## Stack

- React 18, Vite, TypeScript
- Ant Design 5, SCSS modules
- Zustand (global store)
- Supabase JS v2 (auth + realtime + DB)
- Axios, Zod, Dayjs

## Features

- Auto sign-in: on the first visit, a **random** user from `users.json` is picked, saved to `localStorage`, and shown via toast.
- Channels: create, list your channels, select one.
- Messages: real-time via Postgres Changes; optimistic send.
- Users catalog: fetched from `users.json` through a Vite proxy (dev).

> Presence and kicking are feasible next steps — DB and Realtime policies are prepared in `supabase.sql`.

## Setup

1. Copy `.env.example` to `.env.local` and fill values (or use the ready `.env.local` in this zip you provided to me):
   ```sh
   VITE_SUPABASE_URL=<your URL>
   VITE_SUPABASE_ANON_KEY=<your anon key>
   ```
2. Install and run:
   ```sh
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

## Supabase schema & RLS

Apply `supabase.sql` in your Supabase SQL editor. It creates tables and basic RLS policies.

## Notes

- ESLint and tests are intentionally omitted (as requested). Use **Prettier** and your editor's formatting.
- The code is structured with a light **FSD** split: `entities`, `features`, `widgets`, `pages`, etc.
- All UI strings and comments are in English.
