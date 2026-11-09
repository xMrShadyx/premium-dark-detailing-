-- ============================================================================
-- Admin panel: inquiries + schedule, gallery, single admin.
-- Run once in Supabase → SQL Editor (or `supabase db push`).
-- Security model:
--   • anon (website visitors) may ONLY insert new inquiries and read published gallery items.
--   • the admin (a row in public.admins) may read/update everything.
--   • Disable public sign-ups: Authentication → Sign In / Providers → "Allow new users to sign up" OFF.
-- ============================================================================

-- ---------- admins ----------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- inquiries (also the schedule) ----------------------------------
do $$ begin
  create type public.inquiry_status as enum ('new', 'scheduled', 'done', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.inquiries (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  name             text not null check (char_length(name) between 2 and 100),
  phone            text not null check (phone ~ '^\+?[0-9 ()-]{6,20}$'),
  email            text check (email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  service_id       text not null check (char_length(service_id) between 1 and 64),
  vehicle          text check (vehicle is null or char_length(vehicle) <= 100),
  preferred_date   date,
  message          text not null check (char_length(message) between 10 and 2000),
  lang             text not null default 'bg' check (lang in ('bg', 'en')),
  consent          boolean not null check (consent),
  website          text not null default '' check (website = ''),   -- honeypot: bots fill it, insert fails
  status           public.inquiry_status not null default 'new',
  scheduled_at     timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes between 15 and 1440),
  admin_note       text check (admin_note is null or char_length(admin_note) <= 2000),
  check (status <> 'scheduled' or scheduled_at is not null)
);
create index if not exists inquiries_created_idx   on public.inquiries (created_at desc);
create index if not exists inquiries_scheduled_idx on public.inquiries (scheduled_at) where status = 'scheduled';
create index if not exists inquiries_phone_idx     on public.inquiries (phone, created_at desc);

alter table public.inquiries enable row level security;

drop policy if exists "inquiries: public submit" on public.inquiries;
create policy "inquiries: public submit" on public.inquiries
  for insert to anon, authenticated
  with check (status = 'new' and scheduled_at is null and duration_minutes is null and admin_note is null);

drop policy if exists "inquiries: admin read" on public.inquiries;
create policy "inquiries: admin read" on public.inquiries
  for select to authenticated using (public.is_admin());

drop policy if exists "inquiries: admin update" on public.inquiries;
create policy "inquiries: admin update" on public.inquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries: admin delete" on public.inquiries;
create policy "inquiries: admin delete" on public.inquiries
  for delete to authenticated using (public.is_admin());

-- Server-side rate limit + server-owned fields on insert.
create or replace function public.inquiries_before_insert()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if (select count(*) from public.inquiries
        where phone = new.phone and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if (select count(*) from public.inquiries
        where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  new.created_at := now();
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists inquiries_before_insert on public.inquiries;
create trigger inquiries_before_insert
  before insert on public.inquiries
  for each row execute function public.inquiries_before_insert();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists inquiries_touch on public.inquiries;
create trigger inquiries_touch
  before update on public.inquiries
  for each row execute function public.touch_updated_at();

-- ---------- gallery ---------------------------------------------------------
create table if not exists public.gallery_items (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  service_id     text not null check (char_length(service_id) between 1 and 64),
  title_bg       text not null check (char_length(title_bg) between 1 and 120),
  title_en       text not null check (char_length(title_en) between 1 and 120),
  description_bg text check (description_bg is null or char_length(description_bg) <= 400),
  description_en text check (description_en is null or char_length(description_en) <= 400),
  before_path    text not null,
  after_path     text not null,
  published      boolean not null default false,
  sort_order     integer not null default 0
);
create index if not exists gallery_sort_idx on public.gallery_items (sort_order, created_at);

alter table public.gallery_items enable row level security;

drop policy if exists "gallery: read published" on public.gallery_items;
create policy "gallery: read published" on public.gallery_items
  for select to anon, authenticated using (published or public.is_admin());

drop policy if exists "gallery: admin write" on public.gallery_items;
create policy "gallery: admin write" on public.gallery_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- storage: public-read bucket, admin-only writes -----------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gallery files: admin insert" on storage.objects;
create policy "gallery files: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery files: admin update" on storage.objects;
create policy "gallery files: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery files: admin delete" on storage.objects;
create policy "gallery files: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery' and public.is_admin());

-- ---------- after creating your user (Authentication → Users → Add user) ----
-- insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR-EMAIL@example.com';
