# Room Cleaner

A top down room tidying game built with React and Vite. Drag furniture onto its matching outline before the timer runs out.

## How to play

- Press Start, wait for the countdown, then drag each piece of furniture onto its dashed outline.
- Once a piece is close enough to its target, it snaps into place.
- Clear as many rooms as you can before the 60-second timer runs out.
- Your best score is saved locally and shown as your high score on future visits.

## Tech

- React + Vite
- CSS
- Game state lives in React state and `localStorage`

## Notable implementation details

- **Drag and drop** is built from scratch using the Pointer Events API rather than the browser's native drag and drop API, with `setPointerCapture` used so fast drags and releases outside the drop target are handled correctly.
- **Coordinate math** converts between viewport coordinates (from pointer events) and room local coordinates (for rendering), accounting for the room's border width via `clientLeft`/`clientTop`.
- **Layout data is separated from furniture data.** A furniture "catalog" (id, size, color, name) is combined at runtime with one of several handmade "layouts" (target positions only), so new room designs can be added without touching the game logic.
- **Random starting positions** are generated with simple rejection sampling: each item is placed at a random spot and rerolled if it overlaps anything already placed, guaranteeing no overlaps at spawn.
- **Game state** (idle, countdown, playing, ended) is modeled as a single state value rather than several booleans, to avoid states that could contradict each other.

## Running locally

```bash
npm install
npm run dev
```
