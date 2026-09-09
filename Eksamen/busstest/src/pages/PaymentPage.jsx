import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './PaymentPage.css'

const PaymentPage = () => {
  const navigate = useNavigate()

  const handlePayment = () => {
    navigate('/ticket/success')
  }

  return (
    <div className="payment-page">
      <div className="page-header">
        <h1 className="page-title">Kjøp billett</h1>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Avbryt</button>
      </div>

      <div className="ticket-summary">
        <div className="summary-item">
          <span className="summary-label">Enkeltbillett</span>
          <button className="edit-btn">Endre</button>
        </div>
        <div className="summary-details">
          <span>1 voksen For hele Østfold</span>
        </div>
      </div>

      <div className="time-selection">
        <div className="time-item">
          <span className="time-label">Starter nå</span>
          <span className="time-value">nov. 22:20 ›</span>
        </div>
      </div>

      <div className="payment-method">
        <div className="method-item">
          <span className="method-label">betalingsmåte</span>
          <span className="method-arrow">›</span>
        </div>
      </div>

      <div className="total-section">
        <div className="total-item">
          <span className="total-label">Sum</span>
          <span className="total-price">40 kr</span>
        </div>
      </div>

      <button className="payment-button" onClick={handlePayment}>
        Kjøp med _betalingsmåte_
      </button>

      <Footer />
    </div>
  )
}

export default PaymentPage

