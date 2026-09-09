import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './SavedTrips.css';

export default function SavedTrips() {
  const navigate = useNavigate();

  return (
    <section className="page-saved">
      <header className="appbar" role="banner" aria-label="Toppmeny">
        <a className="backlink" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
          Profil
        </a>
        <h1 className="appbar__title">Lagrede reiser</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        <section className="empty-state" aria-live="polite">
          <p className="empty-text">
            Nå kan du lagre reisene du søker på. Har du lagret en reise, dukker den opp her.
          </p>
        </section>
      </main>

      <Footer />
    </section>
  );
}

