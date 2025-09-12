-- == Tables ==
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  created_at timestamptz default now()
);

create table if not exists public.channel_members (
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','member')),
  joined_at timestamptz default now(),
  primary key (channel_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  author_id uuid not null,
  content text not null,
  created_at timestamptz default now()
);

-- == Enable RLS ==
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages enable row level security;

-- == RLS policies (basic draft, adjust as needed) ==
create policy "channels: select for members"
  on public.channels for select
  using (exists (select 1 from public.channel_members m where m.channel_id = id and m.user_id = auth.uid()));

create policy "channels: insert for owner"
  on public.channels for insert
  with check (owner_id = auth.uid());

create policy "members: select for members"
  on public.channel_members for select
  using (exists (select 1 from public.channel_members mm where mm.channel_id = channel_id and mm.user_id = auth.uid()));

create policy "members: insert by owner or self-join"
  on public.channel_members for insert
  with check (
    exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
    or user_id = auth.uid()
  );

create policy "members: delete by owner or self-leave"
  on public.channel_members for delete
  using (
    exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
    or user_id = auth.uid()
  );

create policy "messages: select for members"
  on public.messages for select
  using (exists (select 1 from public.channel_members m where m.channel_id = channel_id and m.user_id = auth.uid()));

create policy "messages: insert by members"
  on public.messages for insert
  with check (exists (select 1 from public.channel_members m where m.channel_id = channel_id and m.user_id = auth.uid()));

create index if not exists messages_channel_created_at_idx on public.messages(channel_id, created_at desc);
