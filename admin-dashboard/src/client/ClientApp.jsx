import { Link, Route, Routes } from 'react-router-dom'
import HousingList from './HousingList.jsx'
import HousingDetail from './HousingDetail.jsx'
import './client.css'

export default function ClientApp() {
  return (
    <div className="client">
      <header className="client__header">
        <Link to="/housing" className="client__brand">Kalaw Travelling</Link>
        <span className="client__tag">Housing</span>
      </header>
      <main className="client__main">
        <Routes>
          <Route path="/housing" element={<HousingList />} />
          <Route path="/housing/:id" element={<HousingDetail />} />
        </Routes>
      </main>
    </div>
  )
}
