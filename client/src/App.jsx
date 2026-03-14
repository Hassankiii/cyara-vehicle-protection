import { useState } from 'react'
import CarForm from './components/CarForm.jsx'
import PricingResults from './components/PricingResults.jsx'
import { calculate } from './lib/calculate.js'
import { CAR_CATALOG, PPF_FINISHES, VINYL_FINISHES } from './lib/carData.js'

// Car data is now bundled — no API call needed
const carData = { catalog: CAR_CATALOG, ppfFinishes: PPF_FINISHES, vinylFinishes: VINYL_FINISHES }

function MuscleCar() {
  return (
    <svg viewBox="0 0 500 108" className="car-svg" aria-hidden="true">
      <path fill="currentColor" d="M20,90 L20,78 Q28,56 50,50 Q72,42 96,40 L134,39 L155,18 Q160,12 170,12 L272,11 Q282,11 290,20 Q300,40 305,54 L325,56 L390,59 Q404,61 412,73 L416,86 L416,90 Z"/>
      <path fill="#000" d="M137,38 L156,18 L202,16 L198,40 Z"/>
      <path fill="#000" d="M203,16 L270,12 L284,48 L242,50 Z"/>
      <circle cx="104" cy="90" r="27" fill="#000"/>
      <circle cx="358" cy="90" r="27" fill="#000"/>
      <circle cx="104" cy="90" r="24" fill="#111" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="104" cy="90" r="15" fill="#0a0a0a" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="104" cy="90" r="6" fill="currentColor"/>
      <circle cx="358" cy="90" r="24" fill="#111" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="358" cy="90" r="15" fill="#0a0a0a" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="358" cy="90" r="6" fill="currentColor"/>
    </svg>
  )
}

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleCalculate(formData) {
    setLoading(true)
    // Small timeout so spinner renders before the sync calculation
    setTimeout(() => {
      const data = calculate(formData)
      setResult(data)
      setLoading(false)
    }, 30)
  }

  const notFound = result?.notFound

  return (
    <div className="app">
      <header className="site-header">
        <div className="racing-stripe" aria-hidden="true" />
        <div className="logo-block">
          <span className="logo-text">CYARA</span>
          <span className="logo-sub">Precision Protection — UAE</span>
        </div>
        <MuscleCar />
      </header>

      <main>
        <CarForm
          onCalculate={handleCalculate}
          loading={loading}
          notFound={notFound ? result : null}
          carData={carData}
        />

        {notFound && (
          <div className="alert alert-warning">
            <span className="alert-icon">!</span>
            <strong>{notFound.make} {notFound.model}</strong> not in our database.
            Enter dimensions above to continue.
          </div>
        )}

        {result && !notFound && <PricingResults result={result} />}
      </main>

      <footer className="site-footer">
        <p>CYARA Vehicle Protection &mdash; UAE &nbsp;|&nbsp; Estimates based on market rates</p>
      </footer>
    </div>
  )
}
