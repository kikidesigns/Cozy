-- Drop existing table if it exists
drop table if exists public.profiles;

-- Create the profiles table
create table public.profiles (
  id uuid primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,
  bitcoin_balance bigint default 0,
  lnbits_wallet_id text,
  lnbits_admin_key text,
  lnbits_invoice_key text,
  is_npc boolean not null default false,
  constraint username_length check (char_length(username) >= 3)
);

-- Create a trigger to enforce the foreign key constraint only for non-NPC profiles
create or replace function check_auth_user_exists()
returns trigger as $$
begin
  if not new.is_npc then
    if not exists (select 1 from auth.users where id = new.id) then
      raise exception 'User ID not found in auth.users';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_auth_user_link
  before insert or update on public.profiles
  for each row
  execute function check_auth_user_exists();

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( (auth.uid() = id and not is_npc) or is_npc );

create policy "Users can update own profile."
  on profiles for update
  using ( (auth.uid() = id and not is_npc) or is_npc );

-- Create a trigger to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- Create the transfer_sats function
create or replace function public.transfer_sats(
  sender_id uuid,
  recipient_id uuid,
  amount bigint
)
returns void as $$
begin
  -- Deduct from sender only if they have enough balance
  update public.profiles
  set bitcoin_balance = bitcoin_balance - amount
  where id = sender_id and bitcoin_balance >= amount;

  if not found then
    raise exception 'Insufficient balance or sender not found';
  end if;

  -- Credit recipient's account
  update public.profiles
  set bitcoin_balance = bitcoin_balance + amount
  where id = recipient_id;
end;
$$ language plpgsql;
