import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './SettingsPage.css'

const SettingsPage = () => {
  const navigate = useNavigate()

  return (
    <div className="settings-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Profil</button>
        <h1 className="page-title">Innstillinger</h1>
      </div>

      <div className="settings-section">
        <div className="setting-item">
          <span className="setting-label">Varslinger</span>
          <button className="setting-arrow">›</button>
        </div>
        <div className="setting-item">
          <span className="setting-label">Språk</span>
          <button className="setting-arrow">›</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Kvittering</span>
            <span className="setting-desc">Automatisk kvittering på e-post</span>
          </div>
          <div className="toggle-switch">
            <div className="toggle-circle"></div>
          </div>
        </div>
        <div className="setting-desc-full">
          Få kvittering på e-post automatisk ved kjøp av billett
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SettingsPage

