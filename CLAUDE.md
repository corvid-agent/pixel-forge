# pixel-forge

Browser-based pixel art editor built with Angular 21 and the Canvas API.

## Features

- Drawing tools: pen, eraser, flood fill, eyedropper
- Color palette presets: Default (16-color), Game Boy, Pico-8
- Undo/redo history
- Configurable canvas size (8x8 to 64x64)
- Grid overlay toggle
- Local gallery with localStorage persistence
- PNG export via offscreen canvas rendering

## Architecture

```
src/app/
  core/
    models/       — PixelArtwork interface, ToolType, palette presets
    services/     — CanvasService (signal state), HistoryService (undo/redo), GalleryService (localStorage)
  features/
    editor/       — EditorComponent (canvas drawing workspace)
    gallery/      — GalleryComponent (saved artwork grid)
```

## Tech Stack

- **Framework:** Angular 21 (standalone components, signals)
- **Rendering:** HTML Canvas API
- **Storage:** localStorage
- **Deployment:** GitHub Pages via GitHub Actions

## Development

```bash
npm start          # Dev server at localhost:4200
npx ng build       # Production build
```

## Verification

```bash
npx ng build --base-href /pixel-forge/
```

Build must pass before committing.
