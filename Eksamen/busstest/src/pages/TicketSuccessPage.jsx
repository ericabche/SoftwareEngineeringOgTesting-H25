import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './TicketSuccessPage.css'

const TicketSuccessPage = () => {
  const navigate = useNavigate()

  return (
    <div className="ticket-success-page">
      <div className="page-header">
        <h1 className="page-title">Vellykket</h1>
      </div>

      <div className="success-content">
        <div className="qr-code-placeholder">
          <div className="qr-circle"></div>
        </div>
        <h2 className="success-message">Din billett er kjøpt!</h2>
        <button 
          className="view-ticket-btn"
          onClick={() => navigate('/ticket/active')}
        >
          Vis billett
        </button>
      </div>

      <Footer />
    </div>
  )
}

export default TicketSuccessPage

