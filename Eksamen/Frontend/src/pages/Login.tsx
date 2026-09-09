import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import busslogo from '../assets/busslogo.png';
import { buildApiUrl, getBasePath } from '../utils/config';
import '../App.css';

interface LoginProps {
  onLogin: (username: string) => void;
}

interface AuthResponse {
  token?: string;
  username?: string;
  message?: string;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = getBasePath();
  const returnTo = location.state?.returnTo || '/home';
  const returnState = location.state;

  const handleLogin = async () => {
    setResult('');
    try {
      const url = buildApiUrl('auth/login');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data: AuthResponse = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || username);
        setResult(data.message || 'Innlogging vellykket');
        onLogin(username);
        // Navigate to returnTo with state if available
        if (returnState) {
          navigate(returnTo, { state: returnState, replace: true });
        } else {
          navigate(returnTo, { replace: true });
        }
      } else {
        setResult(data.message || 'Feil ved innlogging');
      }
    } catch (error) {
      console.error('Login error:', error);
      setResult('Feil ved innlogging');
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`${basePath}/forgot-password`, { replace: false });
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`${basePath}/register`, { replace: false });
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
        <p className="small-text">Logg inn for å lagre billettene dine</p>

        <input
          type="text"
          placeholder="Brukernavn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Logg inn</button>
        {result && <p className="result">{result}</p>}

        <section className="login-links">
          <a href="#" onClick={handleForgotPassword}>
            Glemt passord?
          </a>
          <p>
            Har du ikke konto?{' '}
            <a href="#" onClick={handleRegister}>
              Registrer deg
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
