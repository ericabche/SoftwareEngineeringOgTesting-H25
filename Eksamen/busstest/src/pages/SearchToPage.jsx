import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './SearchToPage.css'

const SearchToPage = () => {
  const navigate = useNavigate()

  return (
    <div className="search-to-page">
      <div className="page-header">
        <h1 className="page-title">Hvor skal du?</h1>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Avbryt</button>
      </div>

      <div className="search-box">
        <input 
          type="text" 
          placeholder="Søk" 
          className="search-input"
        />
      </div>

      <button className="location-button">
        <span>Din posisjon</span>
      </button>

      <div className="section">
        <h3 className="section-title">Favoritter</h3>
        <div className="favorites-grid">
          <button className="favorite-btn">Hjem</button>
          <button className="favorite-btn">Jobb</button>
          <button className="favorite-btn">Skole</button>
          <button className="favorite-btn">osv...</button>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Sist brukte</h3>
        <div className="recent-searches">
          <button className="recent-item">
            <div>
              <span className="recent-from">Sarpsborg Bussterminal</span>
              <span className="recent-to">Remmen</span>
            </div>
            <span className="recent-label">Ditt forrige søk</span>
          </button>
          <button className="recent-item">
            <span>Fredrikstad Bussterminal</span>
            <span className="recent-label">Fredrikstad - 10,5 km</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SearchToPage

