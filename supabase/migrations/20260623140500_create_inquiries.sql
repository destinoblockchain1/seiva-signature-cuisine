-- Create inquiries table
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  company text,
  email text not null,
  date date,
  location text,
  guests integer,
  vision text
);

-- Enable Row Level Security
alter table public.inquiries enable row level security;

-- Policy: Allow anonymous users to submit inquiries
create policy "Anyone can insert inquiries" on public.inquiries
  for insert with check (true);

-- Policy: Allow authenticated admin users to read inquiries
create policy "Only authenticated users can view inquiries" on public.inquiries
  for select using (auth.role() = 'authenticated');
