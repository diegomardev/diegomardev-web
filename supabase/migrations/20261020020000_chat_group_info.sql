begin;
create function public.chat_group_info(p_token uuid, p_chat_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user text; v_chat public."Chats"%rowtype; v_members jsonb;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode='28000'; end if;
  select * into v_chat from public."Chats" where id=p_chat_id;
  if not found or not public.chat_has_member(v_chat.users,v_user)
    or exists(select 1 from public.chat_hidden_rooms where username=v_user and chat_id=p_chat_id and is_deleted)
    then raise exception 'Chat unavailable' using errcode='42501'; end if;
  select coalesce(jsonb_agg(x.username order by lower(x.username),x.username),'[]') into v_members from (
    select distinct u."user" as username from public."Users" u
    where public.chat_has_member(v_chat.users,u."user")
      and not exists(select 1 from public.chat_hidden_rooms h where h.username=u."user" and h.chat_id=p_chat_id and h.is_deleted)
  ) x;
  return jsonb_build_object('id',v_chat.id,'name',v_chat.name,'description',v_chat.description,
    'created_at',v_chat.created_at,'members',v_members);
end;
$$;
revoke all on function public.chat_group_info(uuid,uuid) from public;
grant execute on function public.chat_group_info(uuid,uuid) to anon, authenticated;
commit;
