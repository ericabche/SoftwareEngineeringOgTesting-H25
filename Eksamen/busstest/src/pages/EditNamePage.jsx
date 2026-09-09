import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './EditNamePage.css'

const EditNamePage = () => {
  const navigate = useNavigate()

  return (
    <div className="edit-name-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Informasjonen din</button>
        <h1 className="page-title">Navn</h1>
      </div>

      <div className="form-section">
        <div className="form-field">
          <label>Navn</label>
          <input type="text" placeholder="Fornavn" className="form-input" />
        </div>
        <div className="form-field">
          <label>Etternavn</label>
          <input type="text" placeholder="Etternavn" className="form-input" />
        </div>
      </div>

      <button className="save-button">
        Lagre
      </button>

      <Footer />
    </div>
  )
}

export default EditNamePage

