export const PPF_FINISHES = [
  { value: 'gloss',   label: 'Gloss',          multiplier: 1.00 },
  { value: 'satin',   label: 'Satin',           multiplier: 1.20 },
  { value: 'stealth', label: 'Stealth (Matte)', multiplier: 1.35 },
];

export const VINYL_FINISHES = [
  { value: 'gloss',  label: 'Gloss',   multiplier: 1.00 },
  { value: 'matte',  label: 'Matte',   multiplier: 1.10 },
  { value: 'satin',  label: 'Satin',   multiplier: 1.08 },
  { value: 'chrome', label: 'Chrome',  multiplier: 1.70 },
];

const PACKAGES = [
  // Vinyl Wraps
  {
    id: 'vinyl_economy',
    category: 'Vinyl Wrap',
    name: 'Economy Vinyl',
    description: 'Calendared vinyl — solid colors, budget-friendly everyday protection',
    type: 'vinyl',
    wasteFactor: 1.20,
    materialRate: 120,
    laborRate: 60,
    warranty: '2–3 years',
    recommended: false,
  },
  {
    id: 'vinyl_cast',
    category: 'Vinyl Wrap',
    name: 'Cast Vinyl',
    description: 'Premium cast vinyl — superior conformability, rich color depth',
    type: 'vinyl',
    wasteFactor: 1.20,
    materialRate: 180,
    laborRate: 70,
    warranty: '5–7 years',
    recommended: true,
  },
  {
    id: 'vinyl_premium',
    category: 'Vinyl Wrap',
    name: 'Specialty Vinyl',
    description: 'Color-shift, metallic, and designer finishes — for the bold build',
    type: 'vinyl',
    wasteFactor: 1.20,
    materialRate: 280,
    laborRate: 80,
    warranty: '5–7 years',
    recommended: false,
  },
  // PPF — Real brands
  {
    id: 'ppf_3m',
    category: 'PPF (Paint Protection Film)',
    name: '3M Scotchgard Pro',
    description: 'Trusted 3M formula — reliable impact resistance and crystal clarity',
    type: 'ppf',
    wasteFactor: 1.15,
    materialRate: 280,
    laborRate: 100,
    warranty: '5 years',
    recommended: false,
  },
  {
    id: 'ppf_stek',
    category: 'PPF (Paint Protection Film)',
    name: 'STEK DYNOshield',
    description: 'High-performance TPU — exceptional hydrophobic surface, gloss retention',
    type: 'ppf',
    wasteFactor: 1.15,
    materialRate: 380,
    laborRate: 125,
    warranty: '7 years',
    recommended: false,
  },
  {
    id: 'ppf_xpel',
    category: 'PPF (Paint Protection Film)',
    name: 'XPEL Ultimate Plus',
    description: 'Industry gold standard — self-healing TPU with unmatched optical clarity',
    type: 'ppf',
    wasteFactor: 1.15,
    materialRate: 480,
    laborRate: 150,
    warranty: '10 years',
    recommended: true,
  },
  // Ceramic Coating — flat pricing
  {
    id: 'ceramic_basic',
    category: 'Ceramic Coating',
    name: 'Entry Ceramic',
    description: 'Single-layer SiO₂ — hydrophobic barrier, easy maintenance',
    type: 'ceramic',
    flatPrice: 1800,
    warranty: '1–2 years',
    recommended: false,
  },
  {
    id: 'ceramic_standard',
    category: 'Ceramic Coating',
    name: 'Pro Ceramic',
    description: 'Multi-layer nano ceramic — deep gloss, UV and heat protection',
    type: 'ceramic',
    flatPrice: 3500,
    warranty: '5 years',
    recommended: true,
  },
  {
    id: 'ceramic_premium',
    category: 'Ceramic Coating',
    name: 'Elite Nano Ceramic',
    description: 'Professional-grade graphene-infused coating — showroom finish, maximum durability',
    type: 'ceramic',
    flatPrice: 6000,
    warranty: '7–10 years',
    recommended: false,
  },
];

export function getPricing(baseArea_m2, serviceType = 'vinyl', finish = null) {
  const filtered = PACKAGES.filter(pkg => pkg.type === serviceType);
  return filtered.map(pkg => {
    if (pkg.type === 'ceramic') {
      return {
        ...pkg,
        materialArea_m2: null,
        totalPrice_aed: pkg.flatPrice,
        wastage: '0% (liquid applied)',
      };
    }

    const finishList = pkg.type === 'ppf' ? PPF_FINISHES : VINYL_FINISHES;
    const finishEntry = finishList.find(f => f.value === finish) || finishList[0];
    const finishMultiplier = finishEntry ? finishEntry.multiplier : 1.0;

    const materialArea_m2 = Math.round(baseArea_m2 * pkg.wasteFactor * 100) / 100;
    const materialCost = materialArea_m2 * pkg.materialRate * finishMultiplier;
    const laborCost = baseArea_m2 * pkg.laborRate;
    const totalPrice_aed = Math.round(materialCost + laborCost);

    return {
      ...pkg,
      materialArea_m2,
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      totalPrice_aed,
      wastage: `${Math.round((pkg.wasteFactor - 1) * 100)}%`,
      finish: finish || 'gloss',
    };
  });
}
