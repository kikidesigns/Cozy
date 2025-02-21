-- Drop the existing insert policy
drop policy if exists "Users can insert messages" on public.chat_messages;

-- Create a new insert policy that allows both users and NPCs to insert messages
create policy "Users and NPCs can insert messages"
  on public.chat_messages for insert
  with check (
    -- Allow if sender is an authenticated user
    (auth.uid() = sender_id)
    -- OR if sender is an NPC (exists in profiles with is_npc = true)
    or exists (
      select 1 from public.profiles
      where id = sender_id
      and is_npc = true
    )
  );

-- Add policy to allow NPCs to read their messages
create policy "NPCs can read their messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = sender_id
      and is_npc = true
    )
    or
    exists (
      select 1 from public.profiles
      where id = recipient_id
      and is_npc = true
    )
  );
