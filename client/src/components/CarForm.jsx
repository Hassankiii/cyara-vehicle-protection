import { useState } from 'react'

const SERVICE_TYPES = [
  { value: 'vinyl',   label: 'Vinyl Wrap' },
  { value: 'ppf',     label: 'PPF' },
  { value: 'ceramic', label: 'Ceramic' },
]

const COVERAGE_OPTIONS = [
  { value: 'full',               label: 'Full Vehicle' },
  { value: 'front_full',         label: 'Full Front Package (Hood + Bumper + Fenders)' },
  { value: 'hood_roof',          label: 'Hood & Roof' },
  { value: 'hood',               label: 'Hood Only' },
  { value: 'roof',               label: 'Roof Only' },
  { value: 'fenders',            label: 'Fenders / Doors (Sides)' },
  { value: 'front_bumper',       label: 'Front Bumper Only' },
  { value: 'rear_bumper',        label: 'Rear Bumper Only' },
  { value: 'front_rear_bumpers', label: 'Both Bumpers' },
]

const OTHER = 'Other / Not Listed'
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

export default function CarForm({ onCalculate, loading, notFound, carData }) {
  const [make, setMake]           = useState('')
  const [makeText, setMakeText]   = useState('')
  const [model, setModel]         = useState('')
  const [modelText, setModelText] = useState('')
  const [year, setYear]           = useState(currentYear)
  const [serviceType, setServiceType] = useState('vinyl')
  const [finish, setFinish]       = useState('')
  const [coverage, setCoverage]   = useState('full')
  const [manual, setManual]       = useState({ length_mm: '', width_mm: '', height_mm: '' })

  const catalog    = carData?.catalog || {}
  const makeKeys   = Object.keys(catalog).sort()
  const makeIsOther  = make === OTHER
  const modelIsOther = model === OTHER
  const modelOptions = (!makeIsOther && make && catalog[make]) ? catalog[make] : []

  const finishOptions = serviceType === 'vinyl'
    ? (carData?.vinylFinishes || [])
    : serviceType === 'ppf'
      ? (carData?.ppfFinishes || [])
      : []

  const showFinish  = serviceType === 'vinyl' || serviceType === 'ppf'
  // Show manual dims right after vehicle fields when make/model is unknown
  const showManual  = makeIsOther || modelIsOther || !!notFound
  const activeFinish = finish || (finishOptions[0]?.value ?? '')

  const effectiveMake  = makeIsOther  ? makeText.trim()  : make
  const effectiveModel = modelIsOther ? modelText.trim() : model

  function handleServiceType(val) {
    setServiceType(val)
    setFinish('')
  }

  function handleMakeChange(val) {
    setMake(val)
    setModel('')
    setModelText('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      make: effectiveMake,
      model: effectiveModel,
      year: parseInt(year),
      serviceType,
      coverage,
    }

    if (showFinish) {
      payload.finish = finish || (finishOptions[0]?.value ?? 'gloss')
    }

    if (showManual) {
      payload.manualDimensions = {
        length_mm: parseFloat(manual.length_mm),
        width_mm:  parseFloat(manual.width_mm),
        height_mm: parseFloat(manual.height_mm),
      }
    }

    onCalculate(payload)
  }

  return (
    <form className="car-form" onSubmit={handleSubmit}>

      {/* ── Vehicle Details ── */}
      <div className="form-section-title">Vehicle Details</div>

      <div className="form-row">
        {/* Make */}
        <div className="form-group">
          <label>Make</label>
          {makeKeys.length > 0 ? (
            <select value={make} onChange={e => handleMakeChange(e.target.value)} required>
              <option value="">Select Make</option>
              {makeKeys.map(m => <option key={m} value={m}>{m}</option>)}
              <option value={OTHER}>{OTHER}</option>
            </select>
          ) : (
            <input value={makeText} onChange={e => setMakeText(e.target.value)} placeholder="e.g. Toyota" required />
          )}
          {makeIsOther && (
            <input
              value={makeText}
              onChange={e => setMakeText(e.target.value)}
              placeholder="Type make name"
              required
              className="input-sub"
            />
          )}
        </div>

        {/* Model */}
        <div className="form-group">
          <label>Model</label>
          {!makeIsOther && modelOptions.length > 0 ? (
            <select value={model} onChange={e => setModel(e.target.value)} required>
              <option value="">Select Model</option>
              {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
              <option value={OTHER}>{OTHER}</option>
            </select>
          ) : (
            <input
              value={makeIsOther ? modelText : model}
              onChange={e => makeIsOther ? setModelText(e.target.value) : setModel(e.target.value)}
              placeholder="e.g. Corolla"
              required
            />
          )}
          {!makeIsOther && modelIsOther && (
            <input
              value={modelText}
              onChange={e => setModelText(e.target.value)}
              placeholder="Type model name"
              required
              className="input-sub"
            />
          )}
        </div>

        {/* Year */}
        <div className="form-group form-group-sm">
          <label>Year</label>
          <select value={year} onChange={e => setYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── Manual Dimensions — shown immediately when make/model unknown ── */}
      {showManual && (
        <div className="dims-block">
          <div className="dims-block-label">
            {notFound
              ? `Dimensions not found for ${notFound.make} ${notFound.model} — enter manually`
              : 'Vehicle not in database — enter dimensions'}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Length (mm)</label>
              <input type="number" value={manual.length_mm}
                onChange={e => setManual(p => ({ ...p, length_mm: e.target.value }))}
                placeholder="e.g. 4635" required />
            </div>
            <div className="form-group">
              <label>Width (mm)</label>
              <input type="number" value={manual.width_mm}
                onChange={e => setManual(p => ({ ...p, width_mm: e.target.value }))}
                placeholder="e.g. 1780" required />
            </div>
            <div className="form-group">
              <label>Height (mm)</label>
              <input type="number" value={manual.height_mm}
                onChange={e => setManual(p => ({ ...p, height_mm: e.target.value }))}
                placeholder="e.g. 1435" required />
            </div>
          </div>
        </div>
      )}

      <div className="form-divider" />

      {/* ── Service Options ── */}
      <div className="form-section-title">Service &amp; Finish</div>

      <div className="form-row">
        <div className="form-group">
          <label>Service Type</label>
          <div className="pill-group">
            {SERVICE_TYPES.map(s => (
              <button key={s.value} type="button"
                className={`pill ${serviceType === s.value ? 'pill-active' : ''}`}
                onClick={() => handleServiceType(s.value)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showFinish && finishOptions.length > 0 && (
        <div className="form-row">
          <div className="form-group">
            <label>Finish</label>
            <div className="pill-group">
              {finishOptions.map(f => (
                <button key={f.value} type="button"
                  className={`pill ${activeFinish === f.value ? 'pill-active' : ''}`}
                  onClick={() => setFinish(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="form-divider" />

      {/* ── Coverage ── */}
      <div className="form-section-title">Coverage Area</div>

      <div className="form-row">
        <div className="form-group form-group-wide">
          <select value={coverage} onChange={e => setCoverage(e.target.value)}>
            {COVERAGE_OPTIONS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Calculating...' : 'Get Quote →'}
        </button>
      </div>

    </form>
  )
}
