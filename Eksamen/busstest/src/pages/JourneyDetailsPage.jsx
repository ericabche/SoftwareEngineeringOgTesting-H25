import React from 'react'
import { useNavigate } from 'react-router-dom'
import { images } from '../assets/images'
import Footer from '../components/Footer'
import './JourneyDetailsPage.css'

const JourneyDetailsPage = () => {
  const navigate = useNavigate()

  const departures = [
    { time: '14:20', bus: '633', destination: 'Kalnes' },
    { time: '14:40', bus: '633', destination: 'Kalnes' },
    { time: '15:00', bus: '633', destination: 'Kalnes' },
    { time: '15:20', bus: '633', destination: 'Kalnes' },
  ]

  return (
    <div className="journey-details-page">
      <div className="map-container">
        <div className="map-placeholder">
          <img src={images.line3} alt="" className="map-line" />
          <img src={images.line4} alt="" className="map-line map-line-2" />
          <h2 className="map-text">KART</h2>
        </div>
      </div>

      <div className="journey-info">
        <h2 className="location-name">Remmen</h2>
        <h3 className="departures-title">Avganger</h3>
        
        <div className="departures-list">
          {departures.map((dep, index) => (
            <div key={index} className="departure-item">
              <div className="bus-number">{dep.bus}</div>
              <div className="departure-info">
                <span className="destination">{dep.destination}</span>
                <span className="time">{dep.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default JourneyDetailsPage

