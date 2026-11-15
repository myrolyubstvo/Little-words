# Little Worlds

A walkable canvas city with 1,200 wandering residents, 12 landmarks, enterable buildings, and five climate regions.

The compact map is 226 × 226 tiles at 48 pixels per tile (49.88% of the original 320 × 320 map area). Climate seeds, coastlines, river, landmarks, starting position and region shortcuts use the same design scale. Buildings and characters retain their original size.

Run locally with `python -m http.server 8000`, then open http://localhost:8000. No build step or dependencies are required. GitHub Pages publishes the root of `main`.

Artwork is drawn procedurally and cached in terrain chunks. Regional details include snowy pines, icicles, winter footprints, Mediterranean mosaic paving, citrus trees, shop displays, balconies, gardens and café terraces. Decorative props do not alter pathfinding collision.
