# Pixel Art gallery

The shared realtime canvas stays in `Pixel_Art`, row `id = 1`. The gallery
stores immutable 16×16 color snapshots separately, six records per page.
Cards show an optional creation name above the image, with a permanent number
(`#0001`) on the left and `by username` on the right below it. The compact save
control accepts an optional name; an empty name defaults to Pixel Art. Dates
stay stored but are not displayed.
Public metadata is limited to number, username and colors; per-pixel contributor
names are not copied. The UI uses the same column orientation as the canvas.

## Deployment status and order

1. `20261019120000_pixel_art_gallery.sql` has already been applied to project
   `stgaykmgpmglfnygmjfx` through its SQL editor.
2. Publish the new frontend, including `Login.jsx`, `src/lib/pixelArtSession.js`
   and the gallery. `npm run build` creates the deployable `dist/`.
3. Apply **`20261019120100_protect_legacy_login.sql` immediately afterward**.
   It is prepared but has NOT been applied to production. The old deployed
   login requires public reads of `Users.password`; applying this first
   would stop the old login from working. Coordinate the two steps.
4. `20261019120200_gallery_numbers.sql` has also been applied to Supabase.
   It adds a unique, automatically generated `artwork_number`; do not rerun it.
5. Sign in again. Old `user_logged` localStorage entries aren't sessions.

**Do not treat login enforcement as secure until step 3 is complete.** Existing
Users policies allow public reads, updates and deletes, including passwords.
The second migration removes password/email reads, identity/password changes
and deletion from the public API. Registration and current profile appearance
updates remain available. The old credential lookup must never be restored.

## Sessions

This is a compatibility bridge for the existing `Users` login, not Supabase
Auth. The login RPC validates credentials server-side and returns a random UUID
session token plus profile data without a password. Tokens expire after seven
days and are revoked at logout; password changes invalidate them. The token
and credential fingerprint table has no public read/write access. Direct
writes to the gallery are denied; only `save_pixel_art` can insert after
validating the token. The RPC sets the author itself, validates the title and
256 hexadecimal colors, and serializes saves with a ten-second cooldown.

The existing Users system still stores plaintext passwords. Migrating those
accounts to Supabase Auth, adding login throttling, and securing unrelated
profile/storage operations are separate improvements; this change does not
claim to replace the site's entire authentication system.

## Verification

- Production build passes (existing bundle-size and output.css warnings remain).
- Supabase transactional checks passed for login, save, author and colors,
  invalid credentials, invalid grids, cooldown, revoked sessions, public read,
  denied anonymous direct inserts, and private session storage. All fixture
  records were rolled back.
- Browser checks against an isolated local mock covered six-item pagination,
  last page controls, enlarged previews, login, save and immediate refresh.
  Mock artwork was not inserted into production.
- The pending permissions migration was verified within a rolled-back
  transaction: password/email reads, identity/password changes and deletes
  are blocked, while registration, login and profile appearance still work.
