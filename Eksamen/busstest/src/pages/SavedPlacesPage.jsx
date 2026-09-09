import React from 'react'
import Footer from '../components/Footer'
import './SavedPlacesPage.css'

const SavedPlacesPage = () => {
  return (
    <div className="saved-places-page">
      <div className="page-header">
        <button className="back-btn">‹ Profil</button>
        <h1 className="page-title">Lagrede reiser</h1>
      </div>

      <div className="empty-state">
        <p>Du har ingen lagrede reiser ennå.</p>
      </div>

      <Footer />
    </div>
  )
}

export default SavedPlacesPage

