-- Create or replace a function to transfer sats between profiles
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
