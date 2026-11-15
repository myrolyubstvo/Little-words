# Little Worlds

A walkable canvas city with 1,200 wandering residents, 12 landmarks, enterable buildings, and five climate regions.

The compact map is 226 × 226 tiles at 48 pixels per tile (49.88% of the original 320 × 320 map area). Climate seeds, coastlines, river, landmarks, starting position and region shortcuts use the same design scale. Buildings and characters retain their original size.

Run locally with `python -m http.server 8000`, then open http://localhost:8000. No build step or dependencies are required. GitHub Pages publishes the root of `main`.

The illustrated edition uses 16 original building designs and 12 foliage/furniture designs in three local WebP atlases. `world-art.js` paints the terrain, approaches and characters; `world-render.js` caches the terrain, culls scenery and sorts it together with moving residents by ground position. This allows characters to walk behind buildings and trees. Artwork cutouts are cached at the current display resolution, including a detailed whole-world view. If artwork cannot load, procedural fallback art keeps the world playable.

The compact map contains 428 buildings and all 12 original landmarks. Every climate uses the same illustrated perspective: Mediterranean rooftop terraces, terracotta shops and citrus trees; spring gardens and timber houses; autumn woodwork; snowy lodges, pines and warm windows; and coastal cafés, palms and a harbour. Region shortcuts, zoom buttons, dragging, pinch zoom and two-finger rotation work without the retired SVG map underneath them.

Run the collision, region and landmark-route checks with `node --test tests/world-data.test.cjs`.
