import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './ActiveTicketPage.css'

const ActiveTicketPage = () => {
  const navigate = useNavigate()

  return (
    <div className="active-ticket-page">
      <div className="page-header">
        <h1 className="page-title">Billetten din</h1>
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Billetter</button>
      </div>

      <div className="ticket-card">
        <div className="ticket-header">
          <span className="ticket-type">Enkeltbillett</span>
        </div>
        <div className="ticket-info">
          <p className="ticket-validity">Billetten din er gyldig i 1 time og 30 minutter</p>
          <div className="ticket-details">
            <span className="detail-label">Voksen</span>
            <span className="detail-label">Hele Østfold</span>
            <span className="detail-label">Utløper _Dato_ kl. _Tid_</span>
          </div>
        </div>
      </div>

      <button className="view-receipt-btn">
        Vis kvittering
      </button>

      <Footer />
    </div>
  )
}

export default ActiveTicketPage

