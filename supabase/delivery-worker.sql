create extension if not exists pgcrypto;

alter table public.delivery_events
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists trigger_type text,
  add column if not exists trigger_id text,
  add column if not exists idempotency_key text,
  add column if not exists recipient_email text,
  add column if not exists recipient_name text,
  add column if not exists attempted_at timestamptz,
  add column if not exists failed_at timestamptz,
  add column if not exists error_message text,
  add column if not exists email_provider text,
  add column if not exists email_provider_id text,
  add column if not exists updated_at timestamptz default now();

create unique index if not exists delivery_events_idempotency_key_uidx
  on public.delivery_events (idempotency_key)
  where idempotency_key is not null;

create or replace function public.claim_delivery_event(
  p_vault_entry_id uuid,
  p_recipient_id uuid,
  p_trigger_type text,
  p_trigger_id text,
  p_idempotency_key text,
  p_recipient_email text,
  p_recipient_name text
)
returns table(claimed boolean, existing_status text)
language plpgsql
security definer
as $$
declare
  v_status text;
begin
  insert into public.delivery_events (
    vault_entry_id,
    recipient_id,
    trigger_type,
    trigger_id,
    idempotency_key,
    recipient_email,
    recipient_name,
    attempted_at,
    status,
    updated_at
  )
  values (
    p_vault_entry_id,
    p_recipient_id,
    p_trigger_type,
    p_trigger_id,
    p_idempotency_key,
    p_recipient_email,
    p_recipient_name,
    now(),
    'sending',
    now()
  )
  on conflict do nothing
  returning status into v_status;

  if v_status is not null then
    return query select true, v_status;
    return;
  end if;

  return query
    select false, coalesce(
      (
        select delivery_events.status
        from public.delivery_events
        where delivery_events.idempotency_key = p_idempotency_key
        limit 1
      ),
      'unknown'
    );
end;
$$;

create or replace function public.mark_delivery_event_delivered(
  p_idempotency_key text,
  p_email_provider text,
  p_email_provider_id text
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_updated integer;
begin
  update public.delivery_events
  set
    status = 'delivered',
    delivered_at = now(),
    failed_at = null,
    error_message = null,
    email_provider = p_email_provider,
    email_provider_id = p_email_provider_id,
    updated_at = now()
  where idempotency_key = p_idempotency_key
    and status = 'sending';

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.mark_delivery_event_failed(
  p_idempotency_key text,
  p_error_message text
)
returns void
language plpgsql
security definer
as $$
begin
  update public.delivery_events
  set
    status = 'failed',
    failed_at = now(),
    error_message = p_error_message,
    updated_at = now()
  where idempotency_key = p_idempotency_key
    and status = 'sending';
end;
$$;

create or replace function public.finalize_delivery_if_complete(
  p_vault_entry_id uuid,
  p_trigger_type text,
  p_trigger_id text,
  p_milestone_id uuid default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_assigned_count integer;
  v_remaining_count integer;
begin
  select count(*)
  into v_assigned_count
  from public.vault_entry_recipients
  where vault_entry_id = p_vault_entry_id;

  if v_assigned_count = 0 then
    return false;
  end if;

  select count(*)
  into v_remaining_count
  from public.vault_entry_recipients ver
  where ver.vault_entry_id = p_vault_entry_id
    and not exists (
      select 1
      from public.delivery_events de
      where de.vault_entry_id = p_vault_entry_id
        and de.recipient_id = ver.recipient_id
        and de.trigger_type = p_trigger_type
        and de.trigger_id = p_trigger_id
        and de.status = 'delivered'
    );

  if v_remaining_count > 0 then
    return false;
  end if;

  if p_trigger_type = 'milestone' and p_milestone_id is not null then
    update public.milestone_deliveries
    set status = 'delivered',
        delivered_at = now()
    where id = p_milestone_id
      and status = 'scheduled';
  else
    update public.vault_entries
    set status = 'delivered'
    where id = p_vault_entry_id
      and status = 'active';
  end if;

  return true;
end;
$$;
