import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import './QuickPurchasePage.css'

const QuickPurchasePage = () => {
  const navigate = useNavigate()

  const quickPurchases = [
    { description: 'Enkeltbillett 1 voksen, Nedre Glomma' },
    { description: 'Enkeltbillett 1 voksen, Nedre Glomma' },
    { description: 'Enkeltbillett 1 voksen, Nedre Glomma' },
  ]

  return (
    <div className="quick-purchase-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹ Billetter</button>
        <h1 className="page-title">Hurtigkjøp</h1>
      </div>

      <div className="section">
        <h3 className="section-title">Dine siste kjøp</h3>
        <div className="purchase-list">
          {quickPurchases.map((purchase, index) => (
            <div key={index} className="purchase-item">
              <span className="purchase-desc">{purchase.description}</span>
              <button className="purchase-btn">Kjøp</button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default QuickPurchasePage

