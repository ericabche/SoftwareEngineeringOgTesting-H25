import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './TicketPurchasePage.css'

const TicketPurchasePage = () => {
  const navigate = useNavigate()

  return (
    <div className="ticket-purchase-page">
      <div className="page-header">
        <h1 className="page-title">Velg billett</h1>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Avbryt</button>
      </div>

      <div className="ticket-options">
        <div className="ticket-option" onClick={() => navigate('/ticket/single')}>
          <div className="option-content">
            <span className="option-icon">●</span>
            <div className="option-text">
              <span className="option-title">Enkeltbillett</span>
            </div>
            <span className="option-arrow">›</span>
          </div>
        </div>
        <div className="ticket-option" onClick={() => navigate('/ticket/period')}>
          <div className="option-content">
            <span className="option-icon">●</span>
            <div className="option-text">
              <span className="option-title">Periodebillett</span>
            </div>
            <span className="option-arrow">›</span>
          </div>
        </div>
        <div className="ticket-option">
          <div className="option-content">
            <span className="option-icon">●</span>
            <div className="option-text">
              <span className="option-title">Billett til andre</span>
              <span className="option-subtitle">send billetten til en annen telefon</span>
            </div>
            <span className="option-arrow">›</span>
          </div>
        </div>
      </div>

      <div className="qr-placeholder">
        <div className="qr-circle"></div>
      </div>

      <Footer />
    </div>
  )
}

export default TicketPurchasePage

