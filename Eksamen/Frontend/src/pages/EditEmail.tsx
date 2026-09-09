import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/config';
import Footer from '../components/Footer';
import './EditEmail.css';

export default function EditEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/profile/changeemail');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      if (res.ok) {
        navigate('/profile/details');
      } else {
        const data = await res.json();
        setError(data.message || 'Kunne ikke oppdatere e-post');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      setError('Feil ved oppdatering av e-post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page page--edit">
      <header className="appbar" role="banner">
        <nav aria-label="Tilbake">
          <a
            className="backlink"
            href="/profile/details"
            onClick={(e) => {
              e.preventDefault();
              navigate('/profile/details');
            }}
          >
            Tilbake
          </a>
        </nav>
        <h1 className="appbar__title">E-post</h1>
      </header>

      <main id="main" tabIndex={-1}>
        <form className="form" onSubmit={handleSubmit} aria-labelledby="legend">
          <fieldset>
            <legend id="legend" className="form-legend">Skriv inn den nye e-posten din</legend>

            <label htmlFor="email" className="visually-hidden">
              E-post
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="navn@domene.no"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </fieldset>

          {error && <section className="error-message">{error}</section>}

          <section className="form-actions">
            <button type="submit" className="btn btn--primary btn--block" disabled={isLoading}>
              {isLoading ? 'Bekrefter...' : 'Bekreft'}
            </button>
          </section>
        </form>
      </main>

      <Footer />
    </section>
  );
}

