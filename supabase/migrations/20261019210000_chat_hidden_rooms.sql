begin;
create table public.chat_hidden_rooms (
  username text not null,
  chat_id uuid not null references public."Chats"(id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (username, chat_id)
);
alter table public.chat_hidden_rooms enable row level security;
revoke all on public.chat_hidden_rooms from public, anon, authenticated;

create function public.chat_list_hidden(p_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user text;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode = '28000'; end if;
  return (select coalesce(jsonb_agg(chat_id), '[]') from public.chat_hidden_rooms where username = v_user);
end;
$$;

create function public.chat_set_hidden(p_token uuid, p_chat_id uuid, p_hidden boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user text;
begin
  v_user := public.pixel_art_session_user(p_token);
  if v_user is null then raise exception 'Login required' using errcode = '28000'; end if;
  if not exists(select 1 from public."Chats" c where c.id = p_chat_id and public.chat_has_member(c.users, v_user)) then
    raise exception 'Chat unavailable' using errcode = '42501';
  end if;
  if p_hidden then
    insert into public.chat_hidden_rooms(username,chat_id) values(v_user,p_chat_id) on conflict do nothing;
  else
    delete from public.chat_hidden_rooms where username = v_user and chat_id = p_chat_id;
  end if;
end;
$$;
revoke all on function public.chat_list_hidden(uuid), public.chat_set_hidden(uuid,uuid,boolean) from public;
grant execute on function public.chat_list_hidden(uuid), public.chat_set_hidden(uuid,uuid,boolean) to anon, authenticated;
commit;
