import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './EditName.css';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/profile/changepassword');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult('Passordet er endret!');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setResult(data.message || 'Kunne ikke endre passord. Sjekk at gammelt passord er riktig.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setResult('Feil ved endring av passord. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page-edit-name">
      <header className="appbar" role="banner">
        <a className="backlink" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
          Profil
        </a>
        <h1 className="appbar__title">Endre passord</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="oldPassword">Gammelt passord</label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Skriv inn gammelt passord"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Nytt passord</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              placeholder="Skriv inn nytt passord (minst 6 tegn)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Bekreft nytt passord</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              placeholder="Bekreft nytt passord"
            />
          </div>

          {result && (
            <p className={`result ${result.includes('endret') ? 'success' : 'error'}`}>
              {result}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={isLoading}>
            {isLoading ? 'Endrer...' : 'Endre passord'}
          </button>
        </form>
      </main>

      <Footer />
    </section>
  );
}

