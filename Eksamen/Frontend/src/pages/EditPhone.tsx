import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/config';
import Footer from '../components/Footer';
import './EditPhone.css';

export default function EditPhone() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/profile/changetel');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          phone: phone.trim(),
        }),
      });

      if (res.ok) {
        navigate('/profile/details');
      } else {
        const data = await res.json();
        setError(data.message || 'Kunne ikke oppdatere telefonnummer');
      }
    } catch (error) {
      console.error('Error updating phone:', error);
      setError('Feil ved oppdatering av telefonnummer');
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
        <h1 className="appbar__title">Telefonnummer</h1>
      </header>

      <main id="main" tabIndex={-1}>
        <form className="form" onSubmit={handleSubmit} aria-labelledby="legend">
          <fieldset>
            <legend id="legend" className="form-legend">Skriv inn nytt telefonnummer</legend>

            <section className="input-group">
              <label htmlFor="phone" className="visually-hidden">
                Telefon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+47 99 99 99 99"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </section>
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

