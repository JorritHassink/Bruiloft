-- Beveiliging: alleen admins mogen bij invitations/rsvps; gasten werken via RPC's op basis van hun token.

-- ── Admins ──────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
-- Geen policies: alleen via is_admin() (security definer) uit te lezen.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ── RLS op invitations / rsvps ──────────────────────────────────────────
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;

-- Bestaande (mogelijk te ruime) policies opruimen
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('invitations', 'rsvps')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

revoke all on public.invitations, public.rsvps from anon;

create policy "admins beheren invitations" on public.invitations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins beheren rsvps" on public.rsvps
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Constraints ─────────────────────────────────────────────────────────
-- Eén RSVP per uitnodiging (faalt als er al dubbele rsvps bestaan: ruim die eerst op)
alter table public.rsvps drop constraint if exists rsvps_invitation_id_key;
alter table public.rsvps add constraint rsvps_invitation_id_key unique (invitation_id);

alter table public.rsvps drop constraint if exists rsvps_guest_count_check;
alter table public.rsvps add constraint rsvps_guest_count_check check (guest_count between 0 and 10);

-- FK opnieuw aanmaken met on delete cascade
do $$
declare c record;
begin
  for c in
    select con.conname from pg_constraint con
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
    where con.conrelid = 'public.rsvps'::regclass and con.contype = 'f' and att.attname = 'invitation_id'
  loop
    execute format('alter table public.rsvps drop constraint %I', c.conname);
  end loop;
end $$;
alter table public.rsvps add constraint rsvps_invitation_id_fkey
  foreign key (invitation_id) references public.invitations (id) on delete cascade;

-- ── Gast-RPC's ──────────────────────────────────────────────────────────
create or replace function public.get_invitation(p_token text)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'name', i.name,
    'type', i.type,
    'max_guests', i.max_guests,
    'rsvp', (
      select json_build_object(
        'attending', r.attending,
        'guest_count', r.guest_count,
        'dietary_notes', r.dietary_notes
      )
      from public.rsvps r where r.invitation_id = i.id
    )
  )
  from public.invitations i
  where i.token::text = p_token;
$$;

create or replace function public.submit_rsvp(
  p_token text,
  p_attending boolean,
  p_guest_count int,
  p_guest_names text,
  p_dietary_notes text,
  p_remarks text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitation public.invitations%rowtype;
begin
  select * into v_invitation from public.invitations where token::text = p_token;
  if not found then
    raise exception 'invitation_not_found';
  end if;

  if p_attending and (p_guest_count is null or p_guest_count < 1 or p_guest_count > v_invitation.max_guests) then
    raise exception 'invalid_guest_count';
  end if;

  if length(coalesce(p_guest_names, '')) > 500
     or length(coalesce(p_dietary_notes, '')) > 1000
     or length(coalesce(p_remarks, '')) > 2000 then
    raise exception 'input_too_long';
  end if;

  insert into public.rsvps (invitation_id, attending, guest_count, guest_names, dietary_notes, remarks)
  values (
    v_invitation.id,
    p_attending,
    case when p_attending then p_guest_count else 0 end,
    case when p_attending then nullif(trim(p_guest_names), '') end,
    case when p_attending then nullif(trim(p_dietary_notes), '') end,
    nullif(trim(p_remarks), '')
  )
  on conflict (invitation_id) do nothing;

  if not found then
    raise exception 'already_responded';
  end if;
end;
$$;

revoke execute on function public.get_invitation(text) from public;
revoke execute on function public.submit_rsvp(text, boolean, int, text, text, text) from public;
grant execute on function public.get_invitation(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, boolean, int, text, text, text) to anon, authenticated;

-- ── Admin toevoegen (handmatig, pas e-mailadres aan) ────────────────────
-- insert into public.admins (user_id)
--   select id from auth.users where email = 'jouw@email.nl'
--   on conflict do nothing;
