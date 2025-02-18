-- Add knowledge_base to profiles
alter table public.profiles
add column knowledge_base text;

-- Create chat_messages table
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  channel text not null check (channel in ('World', 'Party', 'Guild', 'Private')),
  sender_id uuid references public.profiles(id) not null,
  recipient_id uuid references public.profiles(id),
  text text not null,
  is_llm_response boolean default false,
  metadata jsonb default '{}'::jsonb
);

-- RLS policies
alter table public.chat_messages enable row level security;

create policy "Anyone can read world/party/guild messages"
  on public.chat_messages for select
  using (channel in ('World', 'Party', 'Guild'));

create policy "Users can read their private messages"
  on public.chat_messages for select
  using (channel = 'Private' and (auth.uid() = sender_id or auth.uid() = recipient_id));

create policy "Users can insert messages"
  on public.chat_messages for insert
  with check (auth.uid() = sender_id);