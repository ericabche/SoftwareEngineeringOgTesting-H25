import React from 'react'
import Footer from '../components/Footer'
import './TicketHistoryPage.css'

const TicketHistoryPage = () => {
  const tickets = [
    { type: 'Enkeltbillett', date: '03.11.25 20:49:57', price: '40 kr' },
    { type: 'Enkeltbillett', date: '03.11.25 20:49:57', price: '40 kr' },
    { type: 'Enkeltbillett', date: '03.11.25 20:49:57', price: '40 kr' },
    { type: 'Enkeltbillett', date: '03.11.25 20:49:57', price: '40 kr' },
  ]

  return (
    <div className="ticket-history-page">
      <div className="page-header">
        <button className="back-btn">‹ Profil</button>
        <h1 className="page-title">Billetthistorikk</h1>
      </div>

      <div className="tabs">
        <button className="tab active">Kvitteringer</button>
        <button className="tab">Billetter</button>
      </div>

      <div className="months">
        <div className="month-section">
          <h3 className="month-title">November 2025</h3>
          <div className="tickets-list">
            {tickets.map((ticket, index) => (
              <div key={index} className="ticket-item">
                <div className="ticket-info">
                  <span className="ticket-type">{ticket.type}</span>
                  <span className="ticket-date">{ticket.date}</span>
                </div>
                <span className="ticket-price">{ticket.price}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="month-section">
          <h3 className="month-title">August 2025</h3>
          <div className="tickets-list">
            {tickets.map((ticket, index) => (
              <div key={index} className="ticket-item">
                <div className="ticket-info">
                  <span className="ticket-type">{ticket.type}</span>
                  <span className="ticket-date">{ticket.date}</span>
                </div>
                <span className="ticket-price">{ticket.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default TicketHistoryPage

