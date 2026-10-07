-- Verzendstatus per uitnodiging: aangemaakt → save_the_date (verzonden) → uitgenodigd (wacht op reactie).
-- "Komt" / "Komt niet" volgt uit de rsvps-tabel. Bestaande rijen krijgen via de default 'aangemaakt'.
alter table public.invitations
  add column if not exists invite_status text not null default 'aangemaakt',
  add column if not exists save_the_date_at timestamptz,
  add column if not exists save_the_date_via text,
  add column if not exists invited_at timestamptz,
  add column if not exists invited_via text;

alter table public.invitations drop constraint if exists invitations_invite_status_check;
alter table public.invitations add constraint invitations_invite_status_check
  check (invite_status in ('aangemaakt', 'save_the_date', 'uitgenodigd'));

alter table public.invitations drop constraint if exists invitations_via_check;
alter table public.invitations add constraint invitations_via_check
  check (coalesce(save_the_date_via, 'whatsapp') in ('whatsapp', 'email')
     and coalesce(invited_via, 'whatsapp') in ('whatsapp', 'email'));
