import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import busslogo from '../assets/busslogo.png';
import { buildApiUrl, getBasePath } from '../utils/config';
import '../App.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const basePath = getBasePath();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult('');
    setIsLoading(true);

    try {
      const url = buildApiUrl('auth/forgot-password');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data.message || 'Hvis e-postadressen eksisterer, har vi sendt en lenke for å nullstille passordet.');
      } else {
        setResult(data.message || 'Noe gikk galt. Prøv igjen.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setResult('Feil ved sending av e-post. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login-page">
      <header className="desktop-header">
        <img src={busslogo} alt="Buss logo" className="header-logo" />
        <h2 className="header-title">Østfold Kollektiv</h2>
      </header>

      <main className="login-content">
        <img src={busslogo} alt="Buss logo" className="bus-icon" />
        <h1>Glemt passord</h1>
        <p className="small-text">Skriv inn din e-postadresse for å få en lenke til å nullstille passordet</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-postadresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sender...' : 'Send lenke'}
          </button>
        </form>
        
        {result && (
          <p className={`result ${result.includes('sendt') ? 'success' : ''}`}>
            {result}
          </p>
        )}

        <section className="login-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(`${basePath}/login`); }}>
            Tilbake til innlogging
          </a>
        </section>
      </main>

      <footer className="desktop-footer">
        <p>© 2025 Østfold Kollektiv</p>
      </footer>
    </section>
  );
}

