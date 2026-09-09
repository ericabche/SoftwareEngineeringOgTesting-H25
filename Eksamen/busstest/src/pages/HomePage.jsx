import React from 'react'
import { useNavigate } from 'react-router-dom'
import { images } from '../assets/images'
import Footer from '../components/Footer'
import './HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="map-container">
        <div className="map-placeholder">
          <img src={images.line3} alt="" className="map-line" />
          <img src={images.line4} alt="" className="map-line map-line-2" />
          <h2 className="map-text">KART</h2>
        </div>
      </div>

      <div className="route-search">
        <div className="search-header">
          <button className="search-button" onClick={() => navigate('/search')}>
            Finn reise
          </button>
          <button className="search-button" onClick={() => navigate('/journey/1')}>
            Se avganger
          </button>
        </div>
        <div className="search-inputs">
          <button 
            className="search-input" 
            onClick={() => navigate('/search/from')}
          >
            Fra: Din posisjon
          </button>
          <div className="divider"></div>
          <button 
            className="search-input" 
            onClick={() => navigate('/search/to')}
          >
            Til: Hvor skal du?
          </button>
          <div className="search-icon"></div>
        </div>
      </div>

      <div className="nearby-section">
        <h3 className="section-title">I nærheten</h3>
        <div className="nearby-placeholder">
          <img src={images.line6} alt="" className="placeholder-line" />
          <img src={images.line7} alt="" className="placeholder-line" />
        </div>
      </div>

      <div className="favorites-section">
        <h3 className="section-title">Favoritter</h3>
        <div className="favorites-placeholder">
          <img src={images.line8} alt="" className="placeholder-line" />
          <img src={images.line9} alt="" className="placeholder-line" />
        </div>
        <button 
          className="add-favorite-btn"
          onClick={() => navigate('/favorites/add')}
        >
          + Legg til ny favoritt
        </button>
      </div>

      <Footer />
    </div>
  )
}

export default HomePage

