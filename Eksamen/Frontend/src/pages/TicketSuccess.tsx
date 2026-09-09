import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import hahayesImage from '../assets/hahayes.png';

export default function TicketSuccess() {
  const navigate = useNavigate();

  return (
    <main className="home" style={{ paddingBottom: '2rem' }}>
      <section style={{ 
        width: '100%', 
        backgroundColor: 'rgb(250, 250, 250)', 
        borderRadius: '0.8rem', 
        padding: '1.5rem',
        filter: 'drop-shadow(0 0.4rem 0.8rem rgba(0, 0, 0, 0.2))',
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 2rem 0', color: '#000', textAlign: 'center' }}>Vellykket</h1>

        <img 
          src={hahayesImage} 
          alt="Success"
          style={{
            maxWidth: '300px',
            width: '100%',
            height: 'auto',
            marginBottom: '2rem',
            backgroundColor: 'white'
          }}
        />

        <h2 style={{ 
          fontSize: '1.3rem', 
          fontWeight: '600', 
          color: '#000', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Din billett er kjøpt!
        </h2>

        <button 
          onClick={() => navigate('/ticket')}
          style={{
            width: '100%',
            padding: '16px',
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
          Vis billett
        </button>
      </section>

      <Footer />
    </main>
  );
}

