import { lookupDimensions, PPF_FINISHES, VINYL_FINISHES } from './carData.js'

// ── Coverage options ──────────────────────────────────────────────────────────
export const COVERAGE_OPTIONS = {
  full:               { label: 'Full Vehicle',                    components: ['hood','roof','trunk','sides','frontBump','rearBump'] },
  front_full:         { label: 'Full Front Package',              components: ['hood','frontBump','sides_front'] },
  hood_roof:          { label: 'Hood & Roof',                     components: ['hood','roof'] },
  hood:               { label: 'Hood Only',                       components: ['hood'] },
  roof:               { label: 'Roof Only',                       components: ['roof'] },
  fenders:            { label: 'Fenders / Doors (Sides)',         components: ['sides'] },
  front_bumper:       { label: 'Front Bumper Only',               components: ['frontBump'] },
  rear_bumper:        { label: 'Rear Bumper Only',                components: ['rearBump'] },
  front_rear_bumpers: { label: 'Both Bumpers',                    components: ['frontBump','rearBump'] },
}

function calcSurfaceArea(dimensions, coverage = 'full') {
  const L = dimensions.length_mm / 1000
  const W = dimensions.width_mm  / 1000
  const H = dimensions.height_mm / 1000

  const all = {
    hood:        Math.round(W * (L * 0.27) * 100) / 100,
    roof:        Math.round(W * (L * 0.33) * 100) / 100,
    trunk:       Math.round(W * (L * 0.20) * 100) / 100,
    sides:       Math.round(2 * (L * H * 0.72) * 100) / 100,
    sides_front: Math.round(2 * (L * H * 0.72) * 0.45 * 100) / 100,
    frontBump:   Math.round(W * (H * 0.22) * 100) / 100,
    rearBump:    Math.round(W * (H * 0.22) * 100) / 100,
  }

  const cfg = COVERAGE_OPTIONS[coverage] || COVERAGE_OPTIONS.full
  const selected = {}
  let total = 0
  for (const k of cfg.components) {
    if (all[k] !== undefined) { selected[k] = all[k]; total += all[k] }
  }

  return {
    baseArea_m2: Math.round(total * 100) / 100,
    components: selected,
    allComponents: all,
    coverageLabel: cfg.label,
  }
}

// ── Packages ──────────────────────────────────────────────────────────────────
const PACKAGES = [
  { id: 'vinyl_economy', category: 'Vinyl Wrap',                  name: 'Economy Vinyl',      description: 'Calendared vinyl — solid colors, budget-friendly everyday protection', type: 'vinyl', wasteFactor: 1.20, materialRate: 120, laborRate: 60,  warranty: '2–3 years', recommended: false },
  { id: 'vinyl_cast',    category: 'Vinyl Wrap',                  name: 'Cast Vinyl',         description: 'Premium cast vinyl — superior conformability, rich color depth',        type: 'vinyl', wasteFactor: 1.20, materialRate: 180, laborRate: 70,  warranty: '5–7 years', recommended: true  },
  { id: 'vinyl_premium', category: 'Vinyl Wrap',                  name: 'Specialty Vinyl',    description: 'Color-shift, metallic, and designer finishes — for the bold build',      type: 'vinyl', wasteFactor: 1.20, materialRate: 280, laborRate: 80,  warranty: '5–7 years', recommended: false },
  { id: 'ppf_3m',        category: 'PPF (Paint Protection Film)', name: '3M Scotchgard Pro',  description: 'Trusted 3M formula — reliable impact resistance and crystal clarity',    type: 'ppf',   wasteFactor: 1.15, materialRate: 280, laborRate: 100, warranty: '5 years',   recommended: false },
  { id: 'ppf_stek',      category: 'PPF (Paint Protection Film)', name: 'STEK DYNOshield',    description: 'High-performance TPU — exceptional hydrophobic surface, gloss retention', type: 'ppf',   wasteFactor: 1.15, materialRate: 380, laborRate: 125, warranty: '7 years',   recommended: false },
  { id: 'ppf_xpel',      category: 'PPF (Paint Protection Film)', name: 'XPEL Ultimate Plus', description: 'Industry gold standard — self-healing TPU with unmatched optical clarity', type: 'ppf',   wasteFactor: 1.15, materialRate: 480, laborRate: 150, warranty: '10 years',  recommended: true  },
  { id: 'ceramic_basic',    category: 'Ceramic Coating', name: 'Entry Ceramic',       description: 'Single-layer SiO₂ — hydrophobic barrier, easy maintenance',                     type: 'ceramic', flatPrice: 1800, warranty: '1–2 years', recommended: false },
  { id: 'ceramic_standard', category: 'Ceramic Coating', name: 'Pro Ceramic',         description: 'Multi-layer nano ceramic — deep gloss, UV and heat protection',                  type: 'ceramic', flatPrice: 3500, warranty: '5 years',   recommended: true  },
  { id: 'ceramic_premium',  category: 'Ceramic Coating', name: 'Elite Nano Ceramic',  description: 'Professional-grade graphene-infused coating — showroom finish, max durability', type: 'ceramic', flatPrice: 6000, warranty: '7–10 years', recommended: false },
]

function calcPricing(baseArea_m2, serviceType, finish) {
  const finishLists = { ppf: PPF_FINISHES, vinyl: VINYL_FINISHES }
  return PACKAGES
    .filter(p => p.type === serviceType)
    .map(pkg => {
      if (pkg.type === 'ceramic') {
        return { ...pkg, materialArea_m2: null, totalPrice_aed: pkg.flatPrice, wastage: '0% (liquid applied)' }
      }
      const list = finishLists[pkg.type] || []
      const entry = list.find(f => f.value === finish) || list[0]
      const mult = entry?.multiplier ?? 1
      const materialArea_m2 = Math.round(baseArea_m2 * pkg.wasteFactor * 100) / 100
      const materialCost = Math.round(materialArea_m2 * pkg.materialRate * mult)
      const laborCost = Math.round(baseArea_m2 * pkg.laborRate)
      return {
        ...pkg,
        materialArea_m2,
        materialCost,
        laborCost,
        totalPrice_aed: materialCost + laborCost,
        wastage: `${Math.round((pkg.wasteFactor - 1) * 100)}%`,
        finish: finish || 'gloss',
      }
    })
}

// ── Main calculate function ───────────────────────────────────────────────────
export function calculate({ make, model, year, manualDimensions, coverage = 'full', serviceType = 'vinyl', finish = null }) {
  let dimensions = null
  let source = 'database'

  if (manualDimensions?.length_mm && manualDimensions?.width_mm && manualDimensions?.height_mm) {
    dimensions = manualDimensions
    source = 'manual'
  } else {
    dimensions = lookupDimensions(make, model, year)
    if (dimensions) source = dimensions.source || 'database'
  }

  if (!dimensions) {
    return { notFound: true, make, model, year }
  }

  const surfaceArea = calcSurfaceArea(dimensions, coverage)
  const packages    = calcPricing(surfaceArea.baseArea_m2, serviceType, finish)

  return {
    car: { make, model, year },
    dimensions,
    surfaceArea,
    packages,
    source,
    coverage,
    serviceType,
  }
}
