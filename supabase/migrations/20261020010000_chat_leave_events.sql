begin;
create table public.chat_events (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public."Chats"(id) on delete cascade,
  username text not null,
  kind text not null check (kind = 'left'),
  created_at timestamptz not null default now(),
  unique(chat_id,username,kind)
);
alter table public.chat_events enable row level security;
revoke all on public.chat_events from public, anon, authenticated;
create index chat_events_history on public.chat_events(chat_id,created_at,id);

alter function public.chat_delete_forever(uuid,uuid) rename to chat_delete_forever_core;
revoke all on function public.chat_delete_forever_core(uuid,uuid) from public, anon, authenticated;
create function public.chat_delete_forever(p_token uuid, p_chat_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user text; v_deleted boolean;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode='28000'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user||':'||p_chat_id::text,0));
  select is_deleted into v_deleted from public.chat_hidden_rooms where username=v_user and chat_id=p_chat_id;
  perform public.chat_delete_forever_core(p_token,p_chat_id);
  if not coalesce(v_deleted,false) then
    insert into public.chat_events(chat_id,username,kind) values(p_chat_id,v_user,'left') on conflict do nothing;
  end if;
end;
$$;

create function public.chat_room_events(p_token uuid, p_chat_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user text;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode='28000'; end if;
  if not exists(select 1 from public."Chats" c where c.id=p_chat_id and public.chat_has_member(c.users,v_user))
    or exists(select 1 from public.chat_hidden_rooms where username=v_user and chat_id=p_chat_id and is_deleted)
    then raise exception 'Chat unavailable' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at,e.id),'[]') from public.chat_events e where e.chat_id=p_chat_id);
end;
$$;

create function public.chat_send_message(p_token uuid, p_chat_id uuid, p_text text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user text; v_message public."Messages"%rowtype;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode='28000'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user||':'||p_chat_id::text,0));
  if not exists(select 1 from public."Chats" c where c.id=p_chat_id and public.chat_has_member(c.users,v_user))
    or exists(select 1 from public.chat_hidden_rooms where username=v_user and chat_id=p_chat_id and is_deleted)
    then raise exception 'Chat unavailable' using errcode='42501'; end if;
  if p_text is null or btrim(p_text)='' then raise exception 'Empty message'; end if;
  insert into public."Messages"(chat_id,"user",text,created_at) values(p_chat_id::text,v_user,btrim(p_text),now()) returning * into v_message;
  return to_jsonb(v_message);
end;
$$;
revoke all on function public.chat_delete_forever(uuid,uuid), public.chat_room_events(uuid,uuid), public.chat_send_message(uuid,uuid,text) from public;
grant execute on function public.chat_delete_forever(uuid,uuid), public.chat_room_events(uuid,uuid), public.chat_send_message(uuid,uuid,text) to anon, authenticated;
create or replace function public.chat_snapshot_recipients()
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
      and not exists(select 1 from public.chat_hidden_rooms h where h.chat_id=c.id and h.username=u."user" and h.is_deleted)
    on conflict do nothing;
  return new;
end;
$$;

create or replace function public.chat_sync_receipts(p_token uuid, p_chat_id uuid default null,
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
      and public.chat_has_member(c.users, v_user) and not exists(select 1 from public.chat_hidden_rooms h where h.chat_id=c.id and h.username=v_user and h.is_deleted)
      and (r.message_id = any(coalesce(p_received, '{}')) or r.message_id = any(coalesce(p_read, '{}')));

  -- Receiving this payload does not mark delivery. A subsequent client ACK does.
  select coalesce(jsonb_agg(to_jsonb(inbox)), '[]') into v_inbox from (
    select m.* from public.chat_message_receipts r
    join public."Messages" m on m.message_id::text = r.message_id
    join public."Chats" c on c.id::text = m.chat_id
    where r.recipient = v_user and r.delivered_at is null and public.chat_has_member(c.users, v_user) and not exists(select 1 from public.chat_hidden_rooms h where h.chat_id=c.id and h.username=v_user and h.is_deleted)
    order by m.created_at, m.message_id limit 200
  ) inbox;
  select coalesce(jsonb_object_agg(s.message_id, s.status), '{}') into v_status from (
    select m.message_id::text as message_id,
      case when count(r.recipient) > 0 and bool_and(r.read_at is not null) then 'read'
           when count(r.recipient) > 0 and bool_and(r.delivered_at is not null) then 'delivered'
           else 'sent' end as status
    from public."Messages" m join public."Chats" c on c.id::text = m.chat_id
    left join public.chat_message_receipts r on r.message_id = m.message_id::text and not exists(select 1 from public.chat_hidden_rooms h where h.chat_id=c.id and h.username=r.recipient and h.is_deleted)
    where m."user" = v_user and m.chat_id = p_chat_id::text and public.chat_has_member(c.users, v_user) and not exists(select 1 from public.chat_hidden_rooms h where h.chat_id=c.id and h.username=v_user and h.is_deleted)
    group by m.message_id
  ) s;
  return jsonb_build_object('inbox', v_inbox, 'statuses', v_status);
end;
$$;

commit;
