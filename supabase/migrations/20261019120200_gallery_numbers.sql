-- Stable public catalog number; independent of pagination and timestamps.
-- Existing snapshots also receive a permanent number. Dates remain stored.
begin;
alter table public.pixel_art_gallery
  add column artwork_number bigint generated always as identity unique;
commit;
