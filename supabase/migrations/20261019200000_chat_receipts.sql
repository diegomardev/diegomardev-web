begin;

create function public.chat_has_member(p_users text, p_user text)
returns boolean language sql immutable set search_path = '' as $$
  select p_user is not null and exists (
    select 1 from regexp_split_to_table(coalesce(p_users, ''), E'[,;\n]') value
    where btrim(value, E' \t\n\r[]{}"''') in ('all', p_user)
  );
$$;
revoke all on function public.chat_has_member(text,text) from public, anon, authenticated;

-- Recipients are frozen when the message is sent. New accounts do not reset
-- the delivery/read state of earlier messages in public rooms.
create table public.chat_message_receipts (
  message_id text not null,
  recipient text not null,
  delivered_at timestamptz,
  read_at timestamptz,
  primary key (message_id, recipient),
  check (read_at is null or delivered_at is not null)
);
create index chat_receipts_pending on public.chat_message_receipts(recipient) where delivered_at is null;
alter table public.chat_message_receipts enable row level security;
revoke all on public.chat_message_receipts from public, anon, authenticated;

create function public.chat_snapshot_recipients()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'DELETE' then
    delete from public.chat_message_receipts where message_id = old.message_id::text;
    return old;
  end if;
  insert into public.chat_message_receipts(message_id, recipient)
    select distinct new.message_id::text, u."user" from public."Users" u
    join public."Chats" c on c.id::text = new.chat_id
    where u."user" <> new."user" and public.chat_has_member(c.users, u."user")
    on conflict do nothing;
  return new;
end;
$$;
revoke all on function public.chat_snapshot_recipients() from public, anon, authenticated;
create trigger chat_message_recipients after insert or delete on public."Messages"
  for each row execute function public.chat_snapshot_recipients();

-- No receipt is inferred for historical messages: clients must confirm them.
insert into public.chat_message_receipts(message_id, recipient)
  select distinct m.message_id::text, u."user" from public."Messages" m
  join public."Chats" c on c.id::text = m.chat_id
  join public."Users" u on u."user" <> m."user" and public.chat_has_member(c.users, u."user")
  on conflict do nothing;

create function public.chat_sync_receipts(p_token uuid, p_chat_id uuid default null,
  p_received text[] default '{}', p_read text[] default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user text; v_inbox jsonb; v_status jsonb;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode = '28000'; end if;
  if coalesce(cardinality(p_received), 0) > 1000 or coalesce(cardinality(p_read), 0) > 1000 then
    raise exception 'Too many receipts';
  end if;
  update public.chat_message_receipts r
    set delivered_at = coalesce(r.delivered_at, now()),
        read_at = case when r.message_id = any(coalesce(p_read, '{}')) then coalesce(r.read_at, now()) else r.read_at end
    from public."Messages" m join public."Chats" c on c.id::text = m.chat_id
    where r.message_id = m.message_id::text and r.recipient = v_user
      and public.chat_has_member(c.users, v_user)
      and (r.message_id = any(coalesce(p_received, '{}')) or r.message_id = any(coalesce(p_read, '{}')));

  -- Receiving this payload does not mark delivery. A subsequent client ACK does.
  select coalesce(jsonb_agg(to_jsonb(inbox)), '[]') into v_inbox from (
    select m.* from public.chat_message_receipts r
    join public."Messages" m on m.message_id::text = r.message_id
    join public."Chats" c on c.id::text = m.chat_id
    where r.recipient = v_user and r.delivered_at is null and public.chat_has_member(c.users, v_user)
    order by m.created_at, m.message_id limit 200
  ) inbox;
  select coalesce(jsonb_object_agg(s.message_id, s.status), '{}') into v_status from (
    select m.message_id::text as message_id,
      case when count(r.recipient) > 0 and bool_and(r.read_at is not null) then 'read'
           when count(r.recipient) > 0 and bool_and(r.delivered_at is not null) then 'delivered'
           else 'sent' end as status
    from public."Messages" m join public."Chats" c on c.id::text = m.chat_id
    left join public.chat_message_receipts r on r.message_id = m.message_id::text
    where m."user" = v_user and m.chat_id = p_chat_id::text and public.chat_has_member(c.users, v_user)
    group by m.message_id
  ) s;
  return jsonb_build_object('inbox', v_inbox, 'statuses', v_status);
end;
$$;
revoke all on function public.chat_sync_receipts(uuid,uuid,text[],text[]) from public;
grant execute on function public.chat_sync_receipts(uuid,uuid,text[],text[]) to anon, authenticated;
commit;
