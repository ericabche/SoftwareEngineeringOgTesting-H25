import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './SearchPage.css'

const SearchPage = () => {
  const navigate = useNavigate()

  return (
    <div className="search-page">
      <h1 className="page-title">Finn reise</h1>

      <div className="search-form">
        <div className="search-field">
          <label>Fra</label>
          <button 
            className="search-input"
            onClick={() => navigate('/search/from')}
          >
            Din posisjon
          </button>
        </div>
        <div className="search-field">
          <label>Til</label>
          <button 
            className="search-input"
            onClick={() => navigate('/search/to')}
          >
            Hvor skal du?
          </button>
        </div>
        <div className="search-options">
          <button className="option-button">Avgang: Nå</button>
          <button className="option-button">Filtrer</button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SearchPage

