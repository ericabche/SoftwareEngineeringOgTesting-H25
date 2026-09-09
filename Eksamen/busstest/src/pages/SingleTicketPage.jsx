import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './SingleTicketPage.css'

const SingleTicketPage = () => {
  const navigate = useNavigate()
  const [adults, setAdults] = useState(0)
  const [children, setChildren] = useState(0)
  const [seniors, setSeniors] = useState(0)

  const handlePurchase = () => {
    navigate('/payment')
  }

  return (
    <div className="single-ticket-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Velg billett</button>
        <h1 className="page-title">Enkeltbillett</h1>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Avbryt</button>
      </div>

      <div className="ticket-selection">
        <h3 className="section-title">Velg billett</h3>
        <div className="ticket-options">
          <label className="ticket-option">
            <input type="radio" name="ticket" defaultChecked />
            <span>Enkeltbillett</span>
            <span className="ticket-desc">For hele Østfold</span>
          </label>
          <label className="ticket-option">
            <input type="radio" name="ticket" />
            <span>Enkeltbillett Nedre Glomma</span>
            <span className="ticket-desc">For Sarpsborg og Fredrikstad</span>
          </label>
          <label className="ticket-option">
            <input type="radio" name="ticket" />
            <span>Enkeltbillett fritid Nedre Glomma</span>
            <span className="ticket-desc">Gyldig i Sarpsborg og Fredrikstad hverdager fra kl 17 og hele lør/søn. Gyldig kun på buss</span>
          </label>
        </div>
      </div>

      <div className="passenger-selection">
        <h3 className="section-title">Velg reisende</h3>
        <div className="passenger-list">
          <div className="passenger-item">
            <div className="passenger-info">
              <span className="passenger-type">Voksen</span>
            </div>
            <div className="passenger-controls">
              <button onClick={() => setAdults(Math.max(0, adults - 1))}>−</button>
              <span>{adults}</span>
              <button onClick={() => setAdults(adults + 1)}>+</button>
            </div>
          </div>
          <div className="passenger-item">
            <div className="passenger-info">
              <span className="passenger-type">Barn</span>
              <span className="passenger-desc">6-17 år. Barn under 6 år reiser gratis</span>
            </div>
            <div className="passenger-controls">
              <button onClick={() => setChildren(Math.max(0, children - 1))}>−</button>
              <span>{children}</span>
              <button onClick={() => setChildren(children + 1)}>+</button>
            </div>
          </div>
          <div className="passenger-item">
            <div className="passenger-info">
              <span className="passenger-type">Honnør</span>
              <span className="passenger-desc">Fra 67 år og personer med norsk uføretrygd.</span>
            </div>
            <div className="passenger-controls">
              <button onClick={() => setSeniors(Math.max(0, seniors - 1))}>−</button>
              <span>{seniors}</span>
              <button onClick={() => setSeniors(seniors + 1)}>+</button>
            </div>
          </div>
        </div>
      </div>

      {(adults > 0 || children > 0 || seniors > 0) && (
        <button className="purchase-button" onClick={handlePurchase}>
          Kjøp billett
        </button>
      )}

      <Footer />
    </div>
  )
}

export default SingleTicketPage

