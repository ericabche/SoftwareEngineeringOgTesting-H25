import React from 'react'
import { useNavigate } from 'react-router-dom'
import { images } from '../assets/images'
import Footer from '../components/Footer'
import './ProfilePage.css'

const ProfilePage = () => {
  const navigate = useNavigate()

  return (
    <div className="profile-page">
      <h1 className="page-title">Profil</h1>

      <div className="profile-container">
        <img src={images.profil} alt="Profile" className="profile-image" />
      </div>

      <button 
        className="settings-button"
        onClick={() => navigate('/settings')}
      >
        Innstillinger
      </button>

      <div className="section">
        <h3 className="section-title">Billetter og betaling</h3>
        <div className="section-content">
          <button 
            className="section-item"
            onClick={() => navigate('/ticket/history')}
          >
            Billetthistorikk
          </button>
          <div className="divider"></div>
          <button 
            className="section-item"
            onClick={() => navigate('/ticket/active')}
          >
            Hent billett
          </button>
          <div className="divider"></div>
          <button 
            className="section-item"
            onClick={() => navigate('/payment/methods')}
          >
            Betalingsmåter
          </button>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Dine reiser</h3>
        <div className="section-content">
          <button 
            className="section-item"
            onClick={() => navigate('/saved-places')}
          >
            Lagrede reiser
          </button>
          <div className="divider"></div>
          <button 
            className="section-item"
            onClick={() => navigate('/favorites')}
          >
            Favoritter
          </button>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Hjelp og informasjon</h3>
        <div className="section-content">
          <button 
            className="section-item"
            onClick={() => navigate('/help')}
          >
            Hjelp og kontakt oss
          </button>
          <div className="divider"></div>
          <button className="section-item">
            Vilkår og personvern
          </button>
          <div className="divider"></div>
          <button className="section-item">
            Tilgjengelighetserklæring
          </button>
        </div>
      </div>

      <button className="logout-button">
        Logg ut
      </button>

      <Footer />
    </div>
  )
}

export default ProfilePage

