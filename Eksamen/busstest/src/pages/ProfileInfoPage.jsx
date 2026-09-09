import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './ProfileInfoPage.css'

const ProfileInfoPage = () => {
  const navigate = useNavigate()

  return (
    <div className="profile-info-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Profil</button>
        <h1 className="page-title">Informasjonen din</h1>
      </div>

      <div className="profile-section">
        <div className="profile-item">
          <span className="item-label">Navn</span>
          <span className="item-value">Kari Nordmann</span>
          <button className="edit-btn" onClick={() => navigate('/profile/edit/name')}>›</button>
        </div>
        <div className="profile-item">
          <span className="item-label">Telefonnummer</span>
          <span className="item-value">+4799999999</span>
          <button className="edit-btn" onClick={() => navigate('/profile/edit/phone')}>›</button>
        </div>
        <div className="profile-item">
          <span className="item-label">E-post</span>
          <span className="item-value">eksempel@hotmail.com</span>
          <button className="edit-btn" onClick={() => navigate('/profile/edit/email')}>›</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Totrinnspålogging</span>
            <span className="setting-desc">Gjør profilen din tryggere ved å opprette et passord.</span>
          </div>
          <div className="toggle-switch">
            <div className="toggle-circle"></div>
          </div>
        </div>
        <div className="setting-item">
          <span className="setting-label">Slett profil</span>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProfileInfoPage

