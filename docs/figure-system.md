# Agent Tea Figure System v1

## Goals
- Keep mascot and type figures stylistically consistent across landing, intake, results, and share cards.
- Map every one of the 16 type codes to a deterministic figure spec.
- Preserve playful tone while keeping readable contrast and reusable assets.

## Source of Truth
- Type manifest: `src/lib/figures/manifest.ts`
- Type figure renderer: `src/components/figures/TypeFigure.tsx`
- Lobster renderer + variants: `src/components/landing/LobsterMascot.tsx`

## Asset Model
- Type figures are config-driven (palette, mood, accessory) rather than static image files.
- Lobster supports three variants:
  - `hero` for landing/result primary art
  - `card` for intake cards and share card
  - `bubble` for reasoning chat bubbles

## Naming Rules
- Type keys must use strict four-letter uppercase codes (`CKVD`, `XBTH`, etc).
- New type figure metadata must be added to `TYPE_FIGURE_MANIFEST` with:
  - `nickname`
  - `mood`
  - `accessory`
  - `palette.primary`
  - `palette.secondary`
  - `palette.accent`
  - `palette.background`
- New lobster variants must be added to `LOBSTER_VARIANTS` with:
  - `shellFrom`
  - `shellTo`
  - `claw`
  - `blush`

## Contribution Checklist
1. Update manifest entry and keep fallback behavior intact (`getTypeFigureSpec`).
2. Run unit tests:
   - `npm run test -- src/lib/figures/manifest.test.ts`
3. Run project verification:
   - `npm run lint`
   - `npm run test`
   - `npm run build` (with required env vars)
4. Verify visual usage in these locations:
   - Landing hero and entry cards
   - Results header and reasoning bubbles
   - Share card endpoint (`/api/share-card/:sessionId`)
