import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { images } from '../assets/images'
import './LoadingPage.css'

const LoadingPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="loading-page">
      <div className="logo-container">
        <div className="logo-box">
          <img src={images.line1} alt="" className="logo-line logo-line-1" />
          <img src={images.line2} alt="" className="logo-line logo-line-2" />
        </div>
        <h1 className="logo-text">Logo</h1>
      </div>
    </div>
  )
}

export default LoadingPage

