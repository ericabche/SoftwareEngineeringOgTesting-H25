import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import busslogo from '../assets/busslogo.png';
import { buildApiUrl, getBasePath } from '../utils/config';
import '../App.css';

interface AuthResponse {
  token?: string;
  username?: string;
  message?: string;
}

export default function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();
  const basePath = getBasePath();

  const handleRegister = async () => {
    setResult('');
    
    if (!name.trim()) {
      setResult('Navn er påkrevd');
      return;
    }
    
    if (!password.trim()) {
      setResult('Passord er påkrevd');
      return;
    }
    
    try {
      const url = buildApiUrl('auth/register');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      const data: AuthResponse = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || name);
        setResult(data.message || 'Registrering vellykket');
        // Redirect to home after successful registration
        setTimeout(() => {
          navigate(`${basePath}/home`, { replace: true });
        }, 1000);
      } else {
        setResult(data.message || 'Feil ved registrering');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setResult('Feil ved registrering');
    }
  };

  const handleBackToLogin = () => {
    navigate(`${basePath}/login`, { replace: true });
  };

  return (
    <section className="login-page">
      <header className="desktop-header">
        <img src={busslogo} alt="Buss logo" className="header-logo" />
        <h2 className="header-title">Østfold Kollektiv</h2>
      </header>

      <main className="login-content">
        <img src={busslogo} alt="Buss logo" className="bus-icon" />
        <h1>Østfold Kollektiv</h1>
        <p className="small-text">Registrer deg for å se ruter</p>

        <input
          type="text"
          placeholder="Navn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
        />
        <input
          type="password"
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
        />
        <button onClick={handleRegister}>Registrer</button>
        {result && <p className="result">{result}</p>}

        <section className="login-links">
          <p>
            Har du allerede konto?{' '}
            <a href="#" onClick={handleBackToLogin}>
              Logg inn
            </a>
          </p>
        </section>
      </main>

      <footer className="desktop-footer">
        <p>© 2025 Østfold Kollektiv</p>
      </footer>
    </section>
  );
}

