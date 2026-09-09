import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import busslogo from '../assets/busslogo.png';
import { buildApiUrl, getBasePath } from '../utils/config';
import '../App.css';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const basePath = getBasePath();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult('');

    if (newPassword !== confirmPassword) {
      setResult('Passordene matcher ikke');
      return;
    }

    if (newPassword.length < 6) {
      setResult('Passordet må være minst 6 tegn langt');
      return;
    }

    if (!token) {
      setResult('Manglende token. Vennligst bruk lenken fra e-posten.');
      return;
    }

    setIsLoading(true);

    try {
      const url = buildApiUrl('auth/reset-password');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult('Passordet er nullstilt! Du kan nå logge inn med ditt nye passord.');
        setTimeout(() => {
          navigate(`${basePath}/login`);
        }, 2000);
      } else {
        setResult(data.message || 'Kunne ikke nullstille passordet. Token kan være utløpt.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setResult('Feil ved nullstilling av passord. Prøv igjen.');
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
        <h1>Nullstill passord</h1>
        <p className="small-text">Skriv inn ditt nye passord</p>

        <form onSubmit={handleSubmit}>
          {!token && (
            <input
              type="text"
              placeholder="Token (fra e-post)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              disabled={isLoading}
            />
          )}
          <input
            type="password"
            placeholder="Nytt passord"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
          <input
            type="password"
            placeholder="Bekreft passord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Nullstiller...' : 'Nullstill passord'}
          </button>
        </form>
        
        {result && (
          <p className={`result ${result.includes('nullstilt') ? 'success' : ''}`}>
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

