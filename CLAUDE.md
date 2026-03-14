# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (root + client + server)
npm run install:all

# Run both dev servers concurrently (client :5173, server :3001)
npm run dev

# Build static frontend for deployment
npm run build --prefix client
```

The server uses `node --watch` for auto-restart on file changes. No separate restart needed during dev.

## Architecture

This is a **monorepo** with two packages: `/client` (React/Vite) and `/server` (Express). Both use ES modules (`"type": "module"`).

### Key architectural decision: dual-mode calculation

All pricing logic lives in **two places** intentionally:

1. **`client/src/lib/`** — browser-side calculation (used for static deployment). `calculate.js` imports from `carData.js` and runs everything synchronously in the browser. This is the path used in production.

2. **`server/services/`** — identical logic as an Express API (`POST /api/calculate`, `GET /api/cars`). Used for local dev via the Vite proxy (`/api` → `localhost:3001`). Currently unused in the static build since `App.jsx` imports from `./lib/calculate.js` directly.

When making changes to pricing, coverage formulas, or the car database, **update both** `client/src/lib/` and `server/services/` to keep them in sync.

### Data flow

```
CarForm → App.handleCalculate(formData)
       → calculate(formData)          ← client/src/lib/calculate.js
           → lookupDimensions()       ← client/src/lib/carData.js (CAR_DB)
           → calcSurfaceArea()        ← coverage zones applied here
           → calcPricing()            ← finish multiplier × material rate
       → setResult(data)
       → PricingResults renders packages grouped by serviceType
```

### Pricing model

- **Vinyl / PPF**: `totalPrice = (baseArea × wasteFactor × materialRate × finishMultiplier) + (baseArea × laborRate)`
- **Ceramic**: flat price, unaffected by area or finish
- Finish multipliers live in `PPF_FINISHES` / `VINYL_FINISHES` in `carData.js` (client) and `pricing.js` (server)
- PPF packages are named by brand: 3M Scotchgard Pro, STEK DYNOshield, XPEL Ultimate Plus

### Car database

`client/src/lib/carData.js` contains `CAR_DB` — a nested object keyed by `make → model → year → [L, W, H]` in mm. `CAR_CATALOG` (the dropdown-friendly title-cased version) is derived from it at module load. When a make/model isn't found, `lookupDimensions` tries a fuzzy substring match, then falls back to the nearest year within ±3.

### Deployment

The frontend builds to a fully static site (`client/dist/`) with no backend dependency. Deploy by dragging `client/dist/` to Netlify Drop. The Express server is only needed for local development.

### Git workflow

Repository: `https://github.com/Hassankiii/cyara-vehicle-protection`
Branch: `master` — commit and push after every meaningful change.
