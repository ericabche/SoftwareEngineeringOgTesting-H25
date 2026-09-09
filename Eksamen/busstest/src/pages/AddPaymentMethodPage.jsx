import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './AddPaymentMethodPage.css'

const AddPaymentMethodPage = () => {
  const navigate = useNavigate()

  const methods = [
    { name: 'Legg til kort', icon: '+' },
    { name: 'Apple Pay', icon: '+' },
    { name: 'Vipps', icon: '+' },
  ]

  return (
    <div className="add-payment-method-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Betalingsmåter</button>
        <h1 className="page-title">Legg til</h1>
      </div>

      <div className="methods-list">
        {methods.map((method, index) => (
          <div key={index} className="method-item">
            <span className="method-name">{method.name}</span>
            <span className="method-icon">{method.icon}</span>
          </div>
        ))}
      </div>

      <button className="add-button">
        Legg til
      </button>

      <Footer />
    </div>
  )
}

export default AddPaymentMethodPage

