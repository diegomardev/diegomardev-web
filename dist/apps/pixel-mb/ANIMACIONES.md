# Pixel-MB animation attribution

The gallery renders and downloads the JSON files in `animations/`. No PNG, WebP,
GIF or AWX assets are required. The React interface is in
`src/pages/Apps/PixelMB`; `catalog.json` indexes the available JSON files.

## AWTRIX effects

- `aw1_fire`: FireApp.cpp, AWTRIX v1, Blueforcer. Adapted to a finite looping
  sequence with a reproducible seed and RGB channels limited to 255.
  Source: https://github.com/awtrix/awtrix1.0/blob/master/lib/Applications/FireApp.cpp
- `aw1_life`: GolApp.cpp, AWTRIX v1, Blueforcer. Toroidal rules and original
  colors, with 85 deterministic starting cells and 48 generations.
  Source: https://github.com/awtrix/awtrix1.0/blob/master/lib/Applications/GolApp.cpp
- `aw2_matrix`: Matrix.bas, AWTRIX v2, Stephan Mühl / Blueforcer. The original
  35 RGB565 frames converted to JSON.
  Source: https://github.com/awtrix/AWTRIX2.0-Apps/blob/master/Matrix/Matrix.bas
- `aw2_eyes`: LookingEyes.bas, AWTRIX v2, Stephan Mühl / Blueforcer. Original
  sprites with gaze and blink behavior adapted to a finite looping sequence.
  Source: https://github.com/awtrix/AWTRIX2.0-Apps/blob/master/LookingEyes/LookingEyes.bas

These adaptations were made for this project in October 2026. AWTRIX v1 pieces
use CC BY 4.0 (`licenses/AWTRIX-v1.txt`); AWTRIX v2 pieces use BSD-2-Clause
(`licenses/AWTRIX-v2.txt`).

## Other animations

AWTRIX Hub entries were converted from public previews, not authenticated original
downloads. Their source URLs and available attribution remain in the catalog and
individual JSON files. No general redistribution license is asserted for those
works; consult their authors and source terms. The historical AWTRIX animation
archive was unavailable and its original files are not included.

The Adquio logo was supplied by the project owner; no AWTRIX license is assigned
to it. Other local examples retain their source metadata in their JSON files.
