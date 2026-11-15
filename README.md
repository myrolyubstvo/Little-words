# Little Worlds — Cozy Pocket World

A compact, walkable illustrated island with 240 residents, 70 roaming animals, 12 landmarks and five climate regions.

The map is now **80 × 80 tiles** at 48 pixels per tile. Both width and height are exactly half the previous 160 × 160 world: 3,840 × 3,840 world pixels, or one quarter of its former area. Coastlines, winding roads, river branches, fields, districts and navigation anchors share the same layout scale. Ordinary buildings and characters keep their readable size.

## Fifty new designs

All 50 original new designs in `world-buildings.js` have distinct artwork and their own plot. They are placed before filler buildings, with clear entrances and routes from the starting neighbourhood. The finished island has 87 buildings in total, including the original landmarks and selected older homes and businesses.

The catalogue includes a hospital, clinics, an apothecary, firehouse, school, college, post office, library, town hall, two cinemas, a theatre, cafés, bakery, gelateria, tea house, bookshop, florist, hotel, station, workshops, four planted residential towers, and countryside buildings. Homes draw on Norwegian timber, Swiss chalet, English Tudor, Japanese machiya, Catalan, Dutch, Provençal, Greek Cycladic, Craftsman and Chinese courtyard architecture.

Five new local WebP atlases contain these 50 designs. `assets/atlas.json` records each source rectangle. The **Find one of 50 new places** selector takes the camera to any design. Cinemas/theatres, medical buildings and libraries/bookshops have purpose-built interiors.

## Cozy streets

Flower beds, flowering pots, warm garden lamps, hanging bulbs and planted balconies replace industrial frontage clutter. Tall trees are kept clear of facades and approaches. The smaller population reduces crowding: 240 residents instead of 1,200. Wildlife is scaled to the island: 12 dogs, 16 cats, 28 pigeons, 8 hens, 4 sheep and 2 cows. All six species retain collision-aware movement and interactions; farm animals stay in the countryside.

## Runtime

- `world-buildings.js`: the 50 new designs and architectural metadata.
- `world-data.js`: scaled geography, roads, placement, collision and pathfinding.
- `world-art.js`: local artwork loading, terrain and sprite cutout caches.
- `world-detail.js`: continuous surfaces, crop fields and base scenery.
- `world-cozy.js`: new building artwork, flowers, lights and dedicated interiors.
- `world-wildlife.js`: animal habitats and movement.
- `world-render.js`: terrain caches, depth sorting, weather and camera controls.
- `world-play.js`: walking, place finder, interactions, interiors and saved progress.

No external art service is called by the game. Artwork failure falls back to procedural drawings. Resident friendship and quest progress stay separate from wildlife and geography.

Run locally with `python -m http.server 8000`, then open http://localhost:8000. GitHub Pages publishes the root of `main`.

Run geography, landmark, design-placement, collision and wildlife checks with `node --test tests/world-data.test.cjs`.
