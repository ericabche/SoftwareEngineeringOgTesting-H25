import React from 'react'
import { useNavigate } from 'react-router-dom'
import { images } from '../assets/images'
import Footer from '../components/Footer'
import './TicketPage.css'

const TicketPage = () => {
  const navigate = useNavigate()

  return (
    <div className="ticket-page">
      <h1 className="page-title">Billetter</h1>

      <div className="ticket-container">
        <img src={images.billett} alt="Ticket" className="ticket-image" />
      </div>

      <button 
        className="purchase-button"
        onClick={() => navigate('/ticket/purchase')}
      >
        Kjøp billett
      </button>

      <div className="quick-purchase-section">
        <div className="section-header">
          <h2 className="section-title">Hurtigkjøp</h2>
          <button 
            className="see-all-btn"
            onClick={() => navigate('/quick-purchase')}
          >
            Se alle
          </button>
        </div>
        <div className="quick-purchase-items">
          <div className="quick-item">
            <img src={images.line12} alt="" className="item-line" />
            <img src={images.line13} alt="" className="item-line" />
          </div>
          <div className="quick-item">
            <img src={images.line14} alt="" className="item-line" />
            <img src={images.line15} alt="" className="item-line" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default TicketPage

