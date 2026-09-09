import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './PaymentMethodsPage.css'

const PaymentMethodsPage = () => {
  const navigate = useNavigate()

  return (
    <div className="payment-methods-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Profil</button>
        <h1 className="page-title">Betalingsmåter</h1>
      </div>

      <div className="empty-state">
        <p>Du har ikke lagt til betalingsmåte.</p>
      </div>

      <button 
        className="add-button"
        onClick={() => navigate('/payment/methods/add')}
      >
        Legg til
      </button>

      <Footer />
    </div>
  )
}

export default PaymentMethodsPage

