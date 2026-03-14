import express from 'express';
import cors from 'cors';
import { getCarDimensions, CAR_CATALOG } from './services/carDimensions.js';
import { calculateSurfaceArea } from './services/surfaceArea.js';
import { getPricing, PPF_FINISHES, VINYL_FINISHES } from './services/pricing.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/cars', (req, res) => {
  res.json({ catalog: CAR_CATALOG, ppfFinishes: PPF_FINISHES, vinylFinishes: VINYL_FINISHES });
});

app.post('/api/calculate', async (req, res) => {
  try {
    const { make, model, year, manualDimensions, coverage = 'full', serviceType = 'vinyl', finish } = req.body;

    if (!make || !model || !year) {
      return res.status(400).json({ error: 'make, model, and year are required' });
    }

    let dimensions = null;
    let source = 'database';

    if (manualDimensions && manualDimensions.length_mm && manualDimensions.width_mm && manualDimensions.height_mm) {
      dimensions = manualDimensions;
      source = 'manual';
    } else {
      dimensions = await getCarDimensions(make, model, year);
      if (dimensions) source = dimensions.source || 'database';
    }

    if (!dimensions) {
      return res.json({ notFound: true, make, model, year });
    }

    const surfaceArea = calculateSurfaceArea(dimensions, coverage);
    const packages = getPricing(surfaceArea.baseArea_m2, serviceType, finish);

    res.json({
      car: { make, model, year },
      dimensions,
      surfaceArea,
      packages,
      source,
      coverage,
      serviceType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
