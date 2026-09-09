import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './EditPhonePage.css'

const EditPhonePage = () => {
  const navigate = useNavigate()

  return (
    <div className="edit-phone-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Tilbake</button>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Avbryt</button>
      </div>

      <div className="form-section">
        <h2 className="form-title">Skriv inn det nye telefonnummeret ditt</h2>
        <div className="form-field">
          <input type="tel" placeholder="+47 99 99 99 99" className="form-input" />
        </div>
      </div>

      <button className="confirm-button">
        Bekreft
      </button>

      <Footer />
    </div>
  )
}

export default EditPhonePage

