import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './AddFavoritePage.css'

const AddFavoritePage = () => {
  const navigate = useNavigate()

  const recentSearches = [
    { from: 'Sarpsborg Bussterminal', to: 'Remmen', label: 'Ditt forrige søk' },
    { from: 'Fredrikstad Bussterminal', distance: 'Fredrikstad - 10,5 km' },
  ]

  return (
    <div className="add-favorite-page">
      <div className="page-header">
        <h1 className="page-title">Legg til ny favoritt</h1>
        <button className="close-btn" onClick={() => navigate(-1)}>Lukk</button>
      </div>

      <div className="search-box">
        <input 
          type="text" 
          placeholder="Søk etter stoppested eller adresse" 
          className="search-input"
        />
      </div>

      <div className="section">
        <h3 className="section-title">Sist brukte</h3>
        <div className="recent-searches">
          {recentSearches.map((search, index) => (
            <div key={index} className="recent-item">
              {search.label && (
                <span className="recent-label">{search.label}</span>
              )}
              <div className="recent-info">
                <span className="recent-from">{search.from}</span>
                {search.to && (
                  <>
                    <span className="recent-arrow">→</span>
                    <span className="recent-to">{search.to}</span>
                  </>
                )}
                {search.distance && (
                  <span className="recent-distance">{search.distance}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default AddFavoritePage

