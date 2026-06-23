-- Link saved proposals back to the inquiry/lead they were created from.
alter table public.proposals
  add column if not exists inquiry_id uuid references public.inquiries(id) on delete set null;

create index if not exists proposals_inquiry_id_idx on public.proposals(inquiry_id);
