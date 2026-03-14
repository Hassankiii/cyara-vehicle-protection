export const COVERAGE_OPTIONS = {
  full:               { label: 'Full Vehicle',            components: ['hood','roof','trunk','sides','frontBump','rearBump'] },
  front_full:         { label: 'Full Front Package',      components: ['hood','frontBump','sides_front'] },
  hood_roof:          { label: 'Hood & Roof',             components: ['hood','roof'] },
  hood:               { label: 'Hood Only',               components: ['hood'] },
  roof:               { label: 'Roof Only',               components: ['roof'] },
  fenders:            { label: 'Fenders / Doors (Sides)', components: ['sides'] },
  front_bumper:       { label: 'Front Bumper Only',       components: ['frontBump'] },
  rear_bumper:        { label: 'Rear Bumper Only',        components: ['rearBump'] },
  front_rear_bumpers: { label: 'Both Bumpers',            components: ['frontBump','rearBump'] },
};

export function calculateSurfaceArea(dimensions, coverage = 'full') {
  const L = dimensions.length_mm / 1000;
  const W = dimensions.width_mm  / 1000;
  const H = dimensions.height_mm / 1000;

  const allComponents = {
    hood:        Math.round(W * (L * 0.27) * 100) / 100,
    roof:        Math.round(W * (L * 0.33) * 100) / 100,
    trunk:       Math.round(W * (L * 0.20) * 100) / 100,
    sides:       Math.round(2 * (L * H * 0.72) * 100) / 100,
    sides_front: Math.round(2 * (L * H * 0.72) * 0.45 * 100) / 100,
    frontBump:   Math.round(W * (H * 0.22) * 100) / 100,
    rearBump:    Math.round(W * (H * 0.22) * 100) / 100,
  };

  const coverageConfig = COVERAGE_OPTIONS[coverage] || COVERAGE_OPTIONS.full;
  const selectedComponents = {};
  let baseArea_m2 = 0;

  for (const key of coverageConfig.components) {
    if (allComponents[key] !== undefined) {
      selectedComponents[key] = allComponents[key];
      baseArea_m2 += allComponents[key];
    }
  }

  return {
    baseArea_m2: Math.round(baseArea_m2 * 100) / 100,
    components: selectedComponents,
    allComponents,
    coverageLabel: coverageConfig.label,
  };
}
