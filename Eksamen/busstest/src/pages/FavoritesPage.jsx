import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './FavoritesPage.css'

const FavoritesPage = () => {
  const navigate = useNavigate()

  const favorites = [
    { name: 'Hjem', destination: 'Skole' },
    { name: 'Jobb', destination: null },
    { name: 'Remmen', destination: 'Sarpsborg bussterminal' },
    { name: 'Halden bussterminal', destination: null },
  ]

  return (
    <div className="favorites-page">
      <div className="page-header">
        <button className="back-btn">‹ Profil</button>
        <h1 className="page-title">Favoritter</h1>
        <button className="add-btn" onClick={() => navigate('/favorites/add')}>+</button>
      </div>

      <div className="favorites-list">
        {favorites.map((fav, index) => (
          <div key={index} className="favorite-item">
            <div className="favorite-info">
              <span className="favorite-name">{fav.name}</span>
              {fav.destination && (
                <span className="favorite-destination">{fav.destination}</span>
              )}
            </div>
            <span className="favorite-arrow">›</span>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}

export default FavoritesPage

