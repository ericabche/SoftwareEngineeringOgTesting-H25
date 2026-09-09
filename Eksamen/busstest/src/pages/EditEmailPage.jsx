import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './EditEmailPage.css'

const EditEmailPage = () => {
  const navigate = useNavigate()

  return (
    <div className="edit-email-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Tilbake</button>
        <button className="cancel-btn" onClick={() => navigate(-1)}>Avbryt</button>
      </div>

      <div className="form-section">
        <h2 className="form-title">Skriv inn den nye e-posten din</h2>
        <div className="form-field">
          <input type="email" placeholder="eksempel@hotmail.com" className="form-input" />
        </div>
      </div>

      <button className="confirm-button">
        Bekreft
      </button>

      <Footer />
    </div>
  )
}

export default EditEmailPage

