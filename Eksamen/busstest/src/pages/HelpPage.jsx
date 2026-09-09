import React from 'react'
import Footer from '../components/Footer'
import './HelpPage.css'

const HelpPage = () => {
  return (
    <div className="help-page">
      <div className="help-content">
        <h1 className="help-title">Hjelp og kontakt oss</h1>
        <div className="help-sections">
          <section className="help-section">
            <h2 className="section-title">Ofte stilte spørsmål</h2>
            <p>Her finner du svar på de mest vanlige spørsmålene.</p>
          </section>
          <section className="help-section">
            <h2 className="section-title">Kontakt oss</h2>
            <p>Ta kontakt med oss hvis du har spørsmål eller trenger hjelp.</p>
          </section>
          <section className="help-section">
            <h2 className="section-title">Ring kundesenter</h2>
            <p>Ring oss på telefon hvis du trenger hjelp.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default HelpPage

