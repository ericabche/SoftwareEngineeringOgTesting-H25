import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './PickupTicket.css';

export default function PickupTicket() {
  const navigate = useNavigate();
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [code3, setCode3] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCodeChange = (value: string, setter: (val: string) => void, maxLength: number) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, maxLength);
    setter(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code1.length !== 2 || code2.length !== 2 || code3.length !== 3) {
      setError('Ugyldig kode. Eksempel: F4-R5-6O7');
      return;
    }

    setIsLoading(true);
    setError('');

    // TODO: Implement API call to fetch ticket by pickup code
    try {
      // const token = localStorage.getItem('token');
      // const url = buildApiUrl(`api/tickets/pickup?code=${fullCode}`);
      // const res = await fetch(url, { ... });
      
      // For now, just show success
      setTimeout(() => {
        setIsLoading(false);
        navigate('/ticket');
      }, 1000);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError('Kunne ikke hente billett. Sjekk at koden er riktig.');
      setIsLoading(false);
    }
  };

  const clearCode = () => {
    setCode1('');
    setCode2('');
    setCode3('');
    setError('');
  };

  return (
    <section className="page page--pickup">
      <header className="appbar" role="banner">
        <nav aria-label="Tilbake">
          <a className="backlink" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
            Profil
          </a>
        </nav>
        <h1 className="appbar__title">Hent billett</h1>
      </header>

      <main id="main" tabIndex={-1}>
        <form className="pickup-form" onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend className="form-legend">Oppgi hentekode</legend>

            <section className="code-inputs" aria-describedby="code-help">
              <label className="visually-hidden" htmlFor="code1">
                Første del
              </label>
              <input
                id="code1"
                inputMode="text"
                maxLength={2}
                autoComplete="one-time-code"
                required
                value={code1}
                onChange={(e) => handleCodeChange(e.target.value, setCode1, 2)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && code1 === '' && code2 === '') {
                    // Focus previous input
                  }
                }}
              />

              <span aria-hidden="true" className="dash">
                -
              </span>

              <label className="visually-hidden" htmlFor="code2">
                Andre del
              </label>
              <input
                id="code2"
                inputMode="text"
                maxLength={2}
                required
                value={code2}
                onChange={(e) => handleCodeChange(e.target.value, setCode2, 2)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && code2 === '') {
                    document.getElementById('code1')?.focus();
                  } else if (code2.length === 2) {
                    document.getElementById('code3')?.focus();
                  }
                }}
              />

              <span aria-hidden="true" className="dash">
                -
              </span>

              <label className="visually-hidden" htmlFor="code3">
                Tredje del
              </label>
              <input
                id="code3"
                inputMode="text"
                maxLength={3}
                required
                value={code3}
                onChange={(e) => handleCodeChange(e.target.value, setCode3, 3)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && code3 === '') {
                    document.getElementById('code2')?.focus();
                  }
                }}
              />

              {(code1 || code2 || code3) && (
                <button type="button" className="clear" aria-label="Tøm kode" onClick={clearCode}>
                  ×
                </button>
              )}
            </section>

            <p id="code-help" className="helptext">
              Eksempel: F4-R5-6O7
            </p>
          </fieldset>

          {error && <section className="error-message">{error}</section>}

          <button type="submit" className="btn btn--primary" disabled={isLoading || code1.length !== 2 || code2.length !== 2 || code3.length !== 3}>
            {isLoading ? 'Henter...' : 'Hent billett'}
          </button>
        </form>

        <section className="contact">
          <p>
            Ved problemer ta kontakt med{' '}
            <a href="tel:+4769125460" rel="nofollow">
              Østfold kollektivtrafikks kundesenter på 69 12 54 80
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </section>
  );
}

