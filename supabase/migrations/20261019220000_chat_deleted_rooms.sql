begin;
alter table public.chat_hidden_rooms add column is_deleted boolean not null default false;

create function public.chat_list_room_states(p_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user text;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode = '28000'; end if;
  return (select coalesce(jsonb_object_agg(chat_id::text, case when is_deleted then 'deleted' else 'archived' end), '{}') from public.chat_hidden_rooms where username = v_user);
end;
$$;

create function public.chat_set_room_state(p_token uuid, p_chat_id uuid, p_state text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user text;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode = '28000'; end if;
  if p_state is null or p_state not in ('active','archived','deleted') then raise exception 'Invalid state'; end if;
  if not exists(select 1 from public."Chats" c where c.id = p_chat_id and public.chat_has_member(c.users, v_user)) then
    raise exception 'Chat unavailable' using errcode = '42501';
  end if;
  if p_state = 'active' then
    delete from public.chat_hidden_rooms where username = v_user and chat_id = p_chat_id;
  else
    insert into public.chat_hidden_rooms(username,chat_id,is_deleted) values(v_user,p_chat_id,p_state = 'deleted')
      on conflict(username,chat_id) do update set is_deleted = excluded.is_deleted, hidden_at = now();
  end if;
end;
$$;
revoke all on function public.chat_list_room_states(uuid), public.chat_set_room_state(uuid,uuid,text) from public;
grant execute on function public.chat_list_room_states(uuid), public.chat_set_room_state(uuid,uuid,text) to anon, authenticated;
commit;
