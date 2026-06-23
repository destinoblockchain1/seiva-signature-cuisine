-- Policy: Allow authenticated users to delete inquiries
create policy "Only authenticated users can delete inquiries" on public.inquiries
  for delete using (auth.role() = 'authenticated');
