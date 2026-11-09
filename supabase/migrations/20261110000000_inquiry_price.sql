-- Price per booking (EUR), entered by the owner in the admin calendar. Used for statistics.
-- Safe to run more than once.

alter table public.inquiries
  add column if not exists price numeric(10, 2)
  check (price is null or (price >= 0 and price <= 1000000));

-- Website visitors must not be able to set a price: re-create the public insert policy with it.
drop policy if exists "inquiries: public submit" on public.inquiries;
create policy "inquiries: public submit" on public.inquiries
  for insert to anon, authenticated
  with check (
    source = 'website' and status = 'new' and consent is true
    and message is not null and char_length(message) >= 10
    and scheduled_at is null and duration_minutes is null and admin_note is null
    and price is null
  );
