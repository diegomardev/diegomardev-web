begin;
-- Avoid converting any recoverable user deletion without its confirmation.
lock table public.chat_hidden_rooms in share row exclusive mode;
do $$ begin
  if exists(select 1 from public.chat_hidden_rooms where is_deleted) then
    raise exception 'Recoverable deletions exist: explicit confirmation required';
  end if;
end $$;

create or replace function public.chat_set_room_state(p_token uuid, p_chat_id uuid, p_state text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user text;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode = '28000'; end if;
  if p_state is null or p_state not in ('active','archived') then raise exception 'Permanent deletion requires confirmation'; end if;
  if not exists(select 1 from public."Chats" c where c.id=p_chat_id and public.chat_has_member(c.users,v_user)) then raise exception 'Chat unavailable' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user||':'||p_chat_id::text,0));
  if exists(select 1 from public.chat_hidden_rooms where username=v_user and chat_id=p_chat_id and is_deleted) then
    raise exception 'Chat permanently deleted' using errcode='42501';
  end if;
  if p_state='active' then
    delete from public.chat_hidden_rooms where username=v_user and chat_id=p_chat_id;
  else
    insert into public.chat_hidden_rooms(username,chat_id) values(v_user,p_chat_id) on conflict do nothing;
  end if;
end;
$$;

create function public.chat_delete_forever(p_token uuid, p_chat_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user text;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode='28000'; end if;
  if not exists(select 1 from public."Chats" c where c.id=p_chat_id and public.chat_has_member(c.users,v_user)) then raise exception 'Chat unavailable' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user||':'||p_chat_id::text,0));
  insert into public.chat_hidden_rooms(username,chat_id,is_deleted) values(v_user,p_chat_id,true)
    on conflict(username,chat_id) do update set is_deleted=true,hidden_at=now();
end;
$$;

-- Old deployed clients cannot restore permanent deletions through the old RPC.
create or replace function public.chat_set_hidden(p_token uuid, p_chat_id uuid, p_hidden boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.chat_set_room_state(p_token,p_chat_id,case when p_hidden then 'archived' else 'active' end);
end;
$$;
revoke all on function public.chat_delete_forever(uuid,uuid) from public;
grant execute on function public.chat_delete_forever(uuid,uuid) to anon, authenticated;
commit;
