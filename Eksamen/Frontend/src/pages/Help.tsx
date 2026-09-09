import Footer from '../components/Footer';
import './Help.css';

export default function Help() {
  return (
    <section className="page page-profil">
      <header className="appbar" role="banner">
        <h1 className="appbar__title">Hjelp og kontakt</h1>
      </header>

      <main className="container">
        {/* Hjelp */}
        <section aria-labelledby="help-title" className="section">
          <h2 id="help-title" className="section-title">Hjelp</h2>
          <ul className="list list--grouped" role="list">
            <li>
              <a
                href="https://ostfold-kollektiv.no"
                className="list-item"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="li-title">Besøk ostfold-kollektiv.no</span>
              </a>
            </li>
          </ul>
        </section>

        {/* Kontakt */}
        <section aria-labelledby="contact-title" className="section">
          <h2 id="contact-title" className="section-title">Kontakt</h2>
          <ul className="list list--grouped" role="list">
            <li>
              <a href="tel:+4769125460" className="list-item">
                <span className="li-title">Ring kundesenter</span>
              </a>
            </li>
          </ul>
        </section>

        {/* Vilkår og personvern */}
        <section aria-labelledby="terms-title" className="section">
          <h2 id="terms-title" className="section-title">Vilkår og personvern</h2>
          <ul className="list list--grouped" role="list">
            <li>
              <a
                href="https://ostfold-kollektiv.no/vilkar-og-personvern/personvern"
                className="list-item"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="li-title">Vilkår og personvern</span>
              </a>
            </li>
            <li>
              <a href="#" className="list-item" target="_blank" rel="noopener noreferrer">
                <span className="li-title">Personvern for Østfold Kollektiv</span>
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </section>
  );
}

