-- DEPLOYMENT ORDER: publish the new Login.jsx before applying this migration.
-- The old login queries Users.password directly and will stop working.
-- Required for trustworthy gallery ownership with the existing Users system.
begin;
revoke all on public."Users" from public, anon, authenticated;
-- Clear any pre-existing column privileges as well as table privileges.
do $$
declare c record;
begin
  for c in select column_name from information_schema.columns
    where table_schema = 'public' and table_name = 'Users'
  loop
    execute format('revoke all (%I) on public."Users" from public, anon, authenticated', c.column_name);
  end loop;
end $$;
grant select (id, name, last_name, "user", created_at, profile_image,
  show_image_border, color_image_border, show_image_shadow, color_image_shadow)
  on public."Users" to anon, authenticated;
grant insert (name, last_name, email, "user", password)
  on public."Users" to anon, authenticated;
grant update (profile_image, show_image_border, color_image_border,
  show_image_shadow, color_image_shadow)
  on public."Users" to anon, authenticated;
commit;
