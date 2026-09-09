import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/config';
import Footer from '../components/Footer';
import './EditName.css';

export default function EditName() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/profile/changename');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      if (res.ok) {
        navigate('/profile/details');
      } else {
        const data = await res.json();
        setError(data.message || 'Kunne ikke oppdatere navn');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      setError('Feil ved oppdatering av navn');
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
        <h1 className="appbar__title">Navn</h1>
      </header>

      <main id="main" tabIndex={-1}>
        <form className="form" onSubmit={handleSubmit} aria-labelledby="legend">
          <fieldset>
            <legend id="legend" className="form-legend">Skriv inn fullt navn</legend>

            <label htmlFor="first" className="visually-hidden">
              Fornavn
            </label>
            <input
              id="first"
              name="first"
              type="text"
              inputMode="text"
              autoComplete="given-name"
              placeholder="Fornavn"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <label htmlFor="last" className="visually-hidden">
              Etternavn
            </label>
            <input
              id="last"
              name="last"
              type="text"
              inputMode="text"
              autoComplete="family-name"
              placeholder="Etternavn"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </fieldset>

          {error && <section className="error-message">{error}</section>}

          <section className="form-actions">
            <button type="submit" className="btn btn--primary btn--block" disabled={isLoading}>
              {isLoading ? 'Lagrer...' : 'Lagre'}
            </button>
          </section>
        </form>
      </main>

      <Footer />
    </section>
  );
}

