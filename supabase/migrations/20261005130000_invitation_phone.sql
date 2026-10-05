-- Mobiel nummer per uitnodiging, voor uitnodigen via WhatsApp
alter table public.invitations add column if not exists phone text;
