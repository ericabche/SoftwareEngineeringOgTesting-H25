import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './Favorites.css';

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="page-favs">
      <header className="appbar" role="banner" aria-label="Toppmeny">
        <a className="backlink" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
          Profil
        </a>
        <h1 className="appbar__title">Favoritter</h1>
        <button
          id="btn-open"
          className="appbar__action"
          type="button"
          aria-label="Legg til favoritt"
          onClick={() => setShowAddModal(true)}
        >
          +
        </button>
      </header>

      <main id="main" className="container">
        {/* Tom visning */}
        {favorites.length === 0 && (
          <section id="empty" className="empty-state" aria-live="polite">
            <p className="empty-text">
              Legg til steder du reiser ofte til eller holdeplasser du bruker mye,
              og bruk dem som snarveier i appen.
            </p>
          </section>
        )}

        {/* Lister */}
        {favorites.length > 0 && (
          <section id="fav-lists">
            <h2 id="addresses-title" className="group-title">Adresser</h2>
            <ul id="fav-addresses" className="list list--grouped" role="list"></ul>

            <h2 id="stops-title" className="group-title">Stoppesteder</h2>
            <ul id="fav-stops" className="list list--grouped" role="list"></ul>
          </section>
        )}
      </main>

      {/* Modal: Legg til favoritt */}
      {showAddModal && (
        <section className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <section className="modal" onClick={(e) => e.stopPropagation()}>
            <section className="modal__header">
              <h2>Legg til ny favoritt</h2>
              <button type="button" className="linklike" aria-label="Lukk" onClick={() => setShowAddModal(false)}>
                Lukk
              </button>
            </section>

            <section className="modal__content">
              <fieldset className="inputs" role="search" aria-label="Søk etter stoppested eller adresse">
                <legend>Søk etter stoppested eller adresse</legend>
                <section className="input-wrap">
                  <label htmlFor="q">Søk</label>
                  <input
                    id="q"
                    name="q"
                    type="search"
                    placeholder="Søk etter stoppested eller adresse"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="clear"
                      aria-label="Tøm søk"
                      onClick={() => setSearchQuery('')}
                    >
                      ×
                    </button>
                  )}
                </section>
              </fieldset>

              <h3 className="subtle">Sist brukte</h3>
              <ul id="recent" className="picklist" role="list"></ul>

              <h3 id="res-title" className="subtle">Forslag</h3>
              <ul id="results" className="picklist" role="list" aria-labelledby="res-title"></ul>
            </section>
          </section>
        </section>
      )}

      <Footer />
    </section>
  );
}

