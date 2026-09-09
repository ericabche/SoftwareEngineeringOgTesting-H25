import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/home') return location.pathname === '/home'
    if (path === '/ticket') return location.pathname.startsWith('/ticket') || location.pathname === '/quick-purchase'
    if (path === '/profile') return location.pathname.startsWith('/profile') || location.pathname === '/settings' || location.pathname === '/saved-places' || location.pathname === '/favorites' || location.pathname === '/help' || location.pathname === '/payment/methods' || location.pathname === '/ticket/history'
    return false
  }

  return (
    <div className="footer">
      <div className="footer-container">
        <button 
          className={`footer-button ${isActive('/home') ? 'active' : ''}`}
          onClick={() => navigate('/home')}
        >
          <div className="footer-icon"></div>
          <span>Reise</span>
        </button>
        <button 
          className={`footer-button ${isActive('/ticket') ? 'active' : ''}`}
          onClick={() => navigate('/ticket')}
        >
          <div className="footer-icon"></div>
          <span>Billett</span>
        </button>
        <button 
          className={`footer-button ${isActive('/profile') ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <div className="footer-icon"></div>
          <span>Profil</span>
        </button>
      </div>
    </div>
  )
}

export default Footer

