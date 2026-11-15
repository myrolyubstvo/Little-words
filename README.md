# Little Worlds

A walkable illustrated city and countryside with 1,200 residents, 280 roaming animals, 12 landmarks, enterable buildings and five climate regions.

The world keeps its compact 160 × 160 collision grid, but its playable shape is an irregular island with headlands, sheltered bays, a branching river and a farm pond. Catmull–Rom routes form an uneven connected network; the renderer paints continuous road and river surfaces instead of exposing the collision grid. Buildings are placed along those routes with varied footprints rather than on repeating rectangular blocks.

There are 236 buildings, including 68 cafés, 49 shops, five city towers, and 12 farmhouses/barns. Six irregular fields grow wheat, vegetables, lavender and orchard trees. The scenery includes 43 kinds of objects: posters, exterior stairs, vending machines, utility units, overhead cables, crates, bins, stone outcrops, reeds, wells, hay, fences and more. Countryside and station/skyline shortcuts sit alongside the original climate-region controls.

Animals have deterministic walking cycles, pauses and collision-aware routes. Dogs (48), cats (64) and pigeons (112) explore town; hens (32), sheep (16) and cows (8) stay in the countryside. Tap an animal to inspect it or say hello. Resident friendship and quest progress are preserved separately.

The game uses 24 illustrated building designs, 12 foliage/furniture designs, and animal animation frames in five local WebP atlases. `assets/atlas.json` records their source rectangles. No external art services are called by the game.

- `world-data.js`: land, climates, districts, roads, farms, buildings, collision and pathfinding.
- `world-art.js`: artwork loading, sprite cutout caches, base terrain and characters.
- `world-detail.js`: continuous surfaces, farm crops, frontage details, towers and animal artwork.
- `world-wildlife.js`: animal spawning, habitats and movement.
- `world-render.js`: cached ground, scenery culling, depth sorting, weather and camera controls.
- `world-play.js`: walking, interactions, interiors, gestures and saved progress.

Scenery and moving actors are sorted together by ground position so residents and animals can pass behind trees and buildings. Artwork failure falls back to procedural drawings. Ground and detail caches keep the rendering work bounded while exploring.

Run locally with `python -m http.server 8000`, then open http://localhost:8000. No build step is required. GitHub Pages publishes the root of `main`.

Run the geography, landmark, collision and wildlife simulation checks with `node --test tests/world-data.test.cjs`.
