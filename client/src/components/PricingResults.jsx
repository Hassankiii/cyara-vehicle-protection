const CATEGORY_ORDER = ['Vinyl Wrap', 'PPF (Paint Protection Film)', 'Ceramic Coating']

const CATEGORY_META = {
  'Vinyl Wrap':                  { icon: '◈', accent: '#a78bfa' },
  'PPF (Paint Protection Film)': { icon: '◉', accent: '#34d399' },
  'Ceramic Coating':             { icon: '◆', accent: '#60a5fa' },
}

const COMPONENT_LABELS = {
  hood:        'Hood',
  roof:        'Roof',
  trunk:       'Trunk / Boot',
  sides:       'Sides & Doors',
  sides_front: 'Front Fenders',
  frontBump:   'Front Bumper',
  rearBump:    'Rear Bumper',
}

function formatAED(n) {
  return 'AED\u00A0' + n.toLocaleString('en-AE')
}

function AreaBreakdown({ components }) {
  return (
    <div className="area-breakdown">
      {Object.entries(components).map(([k, v]) => (
        <div key={k} className="area-row">
          <span>{COMPONENT_LABELS[k] || k}</span>
          <span>{v} m²</span>
        </div>
      ))}
    </div>
  )
}

export default function PricingResults({ result }) {
  const { car, dimensions, surfaceArea, packages, source } = result

  const grouped = {}
  for (const pkg of packages) {
    if (!grouped[pkg.category]) grouped[pkg.category] = []
    grouped[pkg.category].push(pkg)
  }

  const visibleCategories = CATEGORY_ORDER.filter(c => grouped[c])

  return (
    <div className="results">
      {/* Car summary bar */}
      <div className="car-summary">
        <div className="car-summary-left">
          <div className="car-name">{car.year} {car.make} {car.model}</div>
          <div className="car-dims">
            {dimensions.length_mm} × {dimensions.width_mm} × {dimensions.height_mm} mm
            {dimensions.yearNote && <span className="dim-note">&nbsp;({dimensions.yearNote})</span>}
            {source === 'manual' && <span className="badge badge-manual">Manual</span>}
            {source === 'database' && <span className="badge badge-db">Database</span>}
          </div>
        </div>
        <div className="car-summary-right">
          <div className="coverage-label">{surfaceArea.coverageLabel}</div>
          <div className="area-total">{surfaceArea.baseArea_m2} m²</div>
          <div className="area-sub">wrappable area</div>
        </div>
      </div>

      {/* Area breakdown */}
      {Object.keys(surfaceArea.components).length > 1 && (
        <details className="breakdown-details">
          <summary>Area breakdown by panel</summary>
          <AreaBreakdown components={surfaceArea.components} />
        </details>
      )}

      {/* Package categories */}
      {visibleCategories.map(category => {
        const meta = CATEGORY_META[category] || { icon: '●', accent: '#94a3b8' }
        return (
          <div key={category} className="category-section">
            <div className="category-header" style={{ '--accent': meta.accent }}>
              <span className="category-icon">{meta.icon}</span>
              <span className="category-name">{category}</span>
            </div>
            <div className="package-grid">
              {grouped[category].map(pkg => (
                <div
                  key={pkg.id}
                  className={`package-card ${pkg.recommended ? 'recommended' : ''}`}
                  style={{ '--accent': meta.accent }}
                >
                  {pkg.recommended && (
                    <div className="rec-badge" style={{ background: meta.accent }}>
                      Best Value
                    </div>
                  )}
                  <div className="pkg-header">
                    <h4 className="pkg-name">{pkg.name}</h4>
                    <div className="pkg-warranty">{pkg.warranty}</div>
                  </div>
                  <p className="pkg-desc">{pkg.description}</p>

                  <div className="pkg-details">
                    {pkg.type !== 'ceramic' ? (
                      <>
                        <div className="detail-row">
                          <span>Material needed</span>
                          <strong>{pkg.materialArea_m2} m²</strong>
                        </div>
                        <div className="detail-row">
                          <span>Wastage factor</span>
                          <strong>{pkg.wastage}</strong>
                        </div>
                        {pkg.finish && (
                          <div className="detail-row">
                            <span>Finish</span>
                            <strong>{pkg.finish.charAt(0).toUpperCase() + pkg.finish.slice(1)}</strong>
                          </div>
                        )}
                        <div className="detail-row">
                          <span>Material</span>
                          <strong>{formatAED(pkg.materialCost)}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Labour</span>
                          <strong>{formatAED(pkg.laborCost)}</strong>
                        </div>
                      </>
                    ) : (
                      <div className="detail-row">
                        <span>Flat rate pricing</span>
                        <strong>Liquid applied</strong>
                      </div>
                    )}
                  </div>

                  <div className="pkg-price" style={{ color: meta.accent }}>
                    {formatAED(pkg.totalPrice_aed)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <p className="disclaimer">
        Estimates based on UAE market rates. Final pricing varies by installer and vehicle condition.
      </p>
    </div>
  )
}
