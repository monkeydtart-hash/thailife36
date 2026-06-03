-- ============================================
-- THAI LIFE DIGITAL OFFICE — Supabase Schema
-- ============================================

-- 1. AGENTS TABLE
create table public.agents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  slug          text not null unique,              -- URL path เช่น "thart"
  full_name     text not null,
  agent_code    text,                              -- รหัสตัวแทน
  branch        text,                              -- สาขา
  experience_years int default 0,
  bio           text,
  avatar_url    text,
  video_url     text,                              -- YouTube embed หรือ direct URL
  phone         text,
  line_id       text,
  facebook_url  text,
  booking_url   text,                              -- ลิงก์นัดหมาย
  profile_url   text generated always as
                  ('https://thailife36.com/' || slug) stored,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. INSURANCE PRODUCTS (ของแต่ละตัวแทน)
create table public.agent_products (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid references public.agents(id) on delete cascade not null,
  name        text not null,
  description text,
  category    text,      -- 'life' | 'health' | 'saving' | 'accident'
  icon        text,      -- emoji หรือ icon name
  is_featured boolean default false,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- 3. AWARDS / HISTORY
create table public.agent_awards (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid references public.agents(id) on delete cascade not null,
  title       text not null,
  subtitle    text,
  year        text,
  icon        text default '🏆',
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index on public.agents(slug);
create index on public.agents(user_id);
create index on public.agent_products(agent_id);
create index on public.agent_awards(agent_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table public.agents enable row level security;
alter table public.agent_products enable row level security;
alter table public.agent_awards enable row level security;

-- Public: ทุกคนดูได้ (สำหรับหน้า profile สาธารณะ)
create policy "Public read agents"
  on public.agents for select using (is_active = true);

create policy "Public read products"
  on public.agent_products for select using (true);

create policy "Public read awards"
  on public.agent_awards for select using (true);

-- Owner: แก้ไขได้เฉพาะของตัวเอง
create policy "Owner manages own agent"
  on public.agents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner manages own products"
  on public.agent_products for all
  using (
    agent_id in (
      select id from public.agents where user_id = auth.uid()
    )
  );

create policy "Owner manages own awards"
  on public.agent_awards for all
  using (
    agent_id in (
      select id from public.agents where user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGER: updated_at อัตโนมัติ
-- ============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_agents_updated
  before update on public.agents
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- STORAGE BUCKET สำหรับรูปโปรไฟล์
-- ============================================
-- รันใน Supabase Dashboard > Storage > New Bucket
-- Bucket name: avatars
-- Public: true
--
-- Policy สำหรับ avatars bucket:
-- insert/update: auth.uid()::text = (storage.foldername(name))[1]
-- select: true (public)
