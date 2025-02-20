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

-- Add indexes for performance
create index chat_messages_channel_idx on public.chat_messages(channel);
create index chat_messages_sender_id_idx on public.chat_messages(sender_id);
create index chat_messages_recipient_id_idx on public.chat_messages(recipient_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at desc);

-- RLS policies
alter table public.chat_messages enable row level security;

-- Anyone can read world/party/guild messages
create policy "Anyone can read world/party/guild messages"
  on public.chat_messages for select
  using (channel in ('World', 'Party', 'Guild'));

-- Users can read their private messages
create policy "Users can read their private messages"
  on public.chat_messages for select
  using (channel = 'Private' and (auth.uid() = sender_id or auth.uid() = recipient_id));

-- Users can insert messages
create policy "Users can insert messages"
  on public.chat_messages for insert
  with check (auth.uid() = sender_id);

-- Add trigger to clean up old messages (keep last 1000 per channel)
create or replace function clean_old_messages()
returns trigger as $$
begin
  delete from public.chat_messages
  where id in (
    select id from (
      select id,
        row_number() over (partition by channel order by created_at desc) as rn
      from public.chat_messages
    ) ranked
    where rn > 1000
  );
  return null;
end;
$$ language plpgsql;

create trigger clean_messages_trigger
  after insert on public.chat_messages
  execute function clean_old_messages();