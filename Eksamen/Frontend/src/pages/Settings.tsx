import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <section className="page-settings">
      <header className="appbar" role="banner" aria-label="Toppmeny">
        <a className="backlink" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
          Profil
        </a>
        <h1 className="appbar__title">Innstillinger</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        <p className="intro-text">
          Tilpass appen til dine behov og få en mer personlig reiseopplevelse.
        </p>

        {/* Seksjon 1 */}
        <section className="settings-group">
          <h2 className="group-title visually-hidden">Appinnstillinger</h2>
          <ul className="list list--grouped">
            <li>
              <a href="/settings/notifications" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/settings/notifications'); }}>
                <span className="label">Varslinger</span>
                <span className="chevron" aria-hidden="true">›</span>
              </a>
            </li>
            <li>
              <a href="/settings/theme" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/settings/theme'); }}>
                <span className="label">Tema</span>
                <span className="chevron" aria-hidden="true">›</span>
              </a>
            </li>
            <li>
              <a href="/settings/language" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/settings/language'); }}>
                <span className="label">Språk</span>
                <span className="meta">Norsk Bokmål</span>
                <span className="chevron" aria-hidden="true">›</span>
              </a>
            </li>
            <li>
              <a href="/settings/privacy" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/settings/privacy'); }}>
                <span className="label">Personvern</span>
                <span className="chevron" aria-hidden="true">›</span>
              </a>
            </li>
          </ul>
        </section>

        {/* Seksjon 2 */}
        <section className="settings-group">
          <h2 className="group-title">Reisesøk</h2>
          <ul className="list list--grouped">
            <li>
              <a href="#" className="list-item">
                <span className="label">Ditt tempo</span>
                <span className="meta">Middels</span>
              </a>
            </li>
            <li>
              <a href="#" className="list-item">
                <span className="label">Ekstra tid ved overganger</span>
                <span className="meta">0 min</span>
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </section>
  );
}

