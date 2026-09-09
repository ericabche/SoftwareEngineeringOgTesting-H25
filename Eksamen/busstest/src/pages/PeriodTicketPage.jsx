import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './PeriodTicketPage.css'

const PeriodTicketPage = () => {
  const navigate = useNavigate()
  const [passengerType, setPassengerType] = useState('Voksen')

  return (
    <div className="period-ticket-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Velg billett</button>
        <h1 className="page-title">Periodebillett</h1>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Avbryt</button>
      </div>

      <div className="passenger-selection">
        <h3 className="section-title">Velg reisende</h3>
        <div className="passenger-selector">
          <select 
            className="passenger-select"
            value={passengerType}
            onChange={(e) => setPassengerType(e.target.value)}
          >
            <option value="Voksen">Voksen</option>
            <option value="Barn">Barn</option>
            <option value="Honnør">Honnør</option>
            <option value="Student">Student</option>
          </select>
        </div>
      </div>

      <div className="ticket-selection">
        <h3 className="section-title">Velg billett</h3>
        <div className="ticket-list">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="ticket-item">
              <span className="ticket-name">24-timersbillet Østfold</span>
              <span className="ticket-price">150kr</span>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default PeriodTicketPage

