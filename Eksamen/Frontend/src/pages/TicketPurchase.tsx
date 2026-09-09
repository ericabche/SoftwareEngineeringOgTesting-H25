import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { isGuest } from '../utils/guestUtils';

export default function TicketPurchase() {
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.state?.route || null;
  const from = location.state?.from || '';
  const to = location.state?.to || '';
  const departureTime = location.state?.departureTime || '';
  const routeCode = location.state?.routeCode || '';
  const routeName = location.state?.routeName || '';
  const [showAuthChoice, setShowAuthChoice] = useState(isGuest());

  const handleContinueAsGuest = () => {
    setShowAuthChoice(false);
  };

  const handleLogin = () => {
    navigate('/login', { 
      state: { 
        returnTo: '/ticket-purchase',
        route,
        from,
        to,
        departureTime,
        routeCode,
        routeName
      } 
    });
  };

  if (showAuthChoice) {
    return (
      <main className="home" style={{ paddingBottom: '2rem' }}>
        <section style={{ 
          width: '100%', 
          backgroundColor: 'rgb(250, 250, 250)', 
          borderRadius: '0.8rem', 
          padding: '1.5rem',
          filter: 'drop-shadow(0 0.4rem 0.8rem rgba(0, 0, 0, 0.2))',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#000', textAlign: 'left' }}>Velg billett</h1>
            <button 
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#000',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Avbryt
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', color: '#000' }}>Hvordan vil du fortsette?</h2>
            <p style={{ marginBottom: '24px', color: '#666', fontSize: '14px' }}>
              Du kan logge inn for å lagre billetten på tvers av enheter, eller fortsette som gjest.
            </p>
            
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '16px',
                marginBottom: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '0.8rem',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
              }}
            >
              Logg inn
            </button>
            
            <button
              onClick={handleContinueAsGuest}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'white',
                color: '#333',
                border: '1px solid #e8e8e8',
                borderRadius: '0.8rem',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Fortsett som gjest
            </button>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="home" style={{ paddingBottom: '2rem' }}>
      <section style={{ 
        width: '100%', 
        backgroundColor: 'rgb(250, 250, 250)', 
        borderRadius: '0.8rem', 
        padding: '1.5rem',
        filter: 'drop-shadow(0 0.4rem 0.8rem rgba(0, 0, 0, 0.2))',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#000', textAlign: 'left' }}>Velg billett</h1>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              cursor: 'pointer',
              padding: 0
            }}
          >
            Avbryt
          </button>
        </div>

        {route && (
          <section style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: 'white',
            border: '1px solid #e8e8e8',
            borderRadius: '5px'
          }}>
            <p style={{ margin: '8px 0', fontSize: '15px', color: '#000' }}>
              <strong>{routeName}</strong> ({routeCode})
            </p>
            <p style={{ margin: '8px 0', fontSize: '15px', color: '#000' }}>{from} → {to}</p>
            <p style={{ margin: '8px 0', fontSize: '15px', color: '#000' }}>
              Avgang: {new Date(departureTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </section>
        )}

        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            onClick={() => navigate('/ticket/single', { state: { route, from, to, departureTime, routeCode, routeName } })}
            style={{
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #e8e8e8',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>●</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#000' }}>Enkeltbillett</div>
              </div>
              <span style={{ fontSize: '20px', color: '#000' }}>›</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/ticket/period', { state: { route, from, to, departureTime, routeCode, routeName } })}
            style={{
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #e8e8e8',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>●</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#000' }}>Periodebillett</div>
              </div>
              <span style={{ fontSize: '20px', color: '#000' }}>›</span>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #e8e8e8',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>●</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#000' }}>Billett til andre</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>send billetten til en annen telefon</div>
              </div>
              <span style={{ fontSize: '20px', color: '#000' }}>›</span>
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}

