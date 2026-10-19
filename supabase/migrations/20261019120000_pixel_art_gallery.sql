begin;

-- Bridge for the site's existing Users login. Tokens, never passwords, are
-- persisted in the browser. This does not migrate the legacy Users table.
create table public.pixel_art_sessions (
  token uuid primary key default gen_random_uuid(),
  username text not null,
  credential_hash text not null,
  expires_at timestamptz not null default now() + interval '7 days'
);
alter table public.pixel_art_sessions enable row level security;
revoke all on public.pixel_art_sessions from public, anon, authenticated;

create table public.pixel_art_gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 60),
  author text not null,
  -- Only colors are public; individual contributors' names aren't copied.
  colors jsonb not null,
  created_at timestamptz not null default now()
);
create index pixel_art_gallery_latest on public.pixel_art_gallery (created_at desc, id desc);
alter table public.pixel_art_gallery enable row level security;
revoke all on public.pixel_art_gallery from public, anon, authenticated;
grant select on public.pixel_art_gallery to anon, authenticated;
create policy "Public gallery read" on public.pixel_art_gallery
  for select to anon, authenticated using (true);

create function public.pixel_art_login(p_identifier text, p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user public."Users"%rowtype; v_token uuid;
begin
  select * into v_user from public."Users"
  where ("user" = p_identifier or email = p_identifier) and password = p_password
  limit 1;
  if not found then raise exception 'Invalid credentials' using errcode = '28000'; end if;
  delete from public.pixel_art_sessions where expires_at < now();
  insert into public.pixel_art_sessions (username, credential_hash)
    values (v_user."user", md5(v_user.password)) returning token into v_token;
  return jsonb_build_object('token', v_token, 'profile', to_jsonb(v_user) - 'password');
end;
$$;

create function public.pixel_art_session_user(p_token uuid)
returns text language sql stable security definer set search_path = '' as $$
  select s.username from public.pixel_art_sessions s
  join public."Users" u on u."user" = s.username
  where s.token = p_token and s.expires_at > now()
    and s.credential_hash = md5(u.password)
  limit 1;
$$;

create function public.pixel_art_logout(p_token uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.pixel_art_sessions where token = p_token;
$$;

create function public.save_pixel_art(p_token uuid, p_title text, p_colors jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_author text; v_id uuid; v_column jsonb; v_color jsonb;
begin
  v_author := public.pixel_art_session_user(p_token);
  if v_author is null then raise exception 'Login required' using errcode = '28000'; end if;
  if p_title is null or char_length(btrim(p_title)) not between 1 and 60 then
    raise exception 'Title must contain 1 to 60 characters';
  end if;
  if p_colors is null or jsonb_typeof(p_colors) <> 'array' then raise exception 'Invalid grid'; end if;
  if jsonb_array_length(p_colors) <> 16 then raise exception 'Invalid grid'; end if;
  for v_column in select value from jsonb_array_elements(p_colors) loop
    if jsonb_typeof(v_column) <> 'array' then raise exception 'Invalid grid'; end if;
    if jsonb_array_length(v_column) <> 16 then raise exception 'Invalid grid'; end if;
    for v_color in select value from jsonb_array_elements(v_column) loop
      if jsonb_typeof(v_color) <> 'string' or (v_color #>> '{}') !~ '^#[0-9A-Fa-f]{6}$' then
        raise exception 'Invalid color';
      end if;
    end loop;
  end loop;
  -- Serialize saves by the same author, including concurrent requests.
  perform pg_advisory_xact_lock(hashtextextended(v_author, 0));
  if exists (select 1 from public.pixel_art_gallery where author = v_author and created_at > now() - interval '10 seconds') then
    raise exception 'Please wait 10 seconds before saving again' using errcode = 'P0001';
  end if;
  insert into public.pixel_art_gallery (title, author, colors)
    values (btrim(p_title), v_author, p_colors) returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.pixel_art_login(text,text), public.pixel_art_session_user(uuid), public.pixel_art_logout(uuid), public.save_pixel_art(uuid,text,jsonb) from public;
grant execute on function public.pixel_art_login(text,text), public.pixel_art_session_user(uuid), public.pixel_art_logout(uuid), public.save_pixel_art(uuid,text,jsonb) to anon, authenticated;
commit;
