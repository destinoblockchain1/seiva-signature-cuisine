-- Add status column to inquiries table
alter table public.inquiries add column if not exists status text not null default 'new';

-- Policy: Allow authenticated users to update inquiries (e.g. change status)
drop policy if exists "Only authenticated users can update inquiries" on public.inquiries;

create policy "Only authenticated users can update inquiries" on public.inquiries
  for update using (auth.role() = 'authenticated');
