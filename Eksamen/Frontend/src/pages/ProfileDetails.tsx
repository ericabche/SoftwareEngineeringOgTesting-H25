import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/config';
import Footer from '../components/Footer';
import './ProfileDetails.css';

export default function ProfileDetails() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/profile');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page page--profile-detail">
      <header className="appbar" role="banner">
        <nav aria-label="Tilbake">
          <a className="backlink" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
            Profil
          </a>
        </nav>
        <h1 className="appbar__title">Informasjonen din</h1>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="section" aria-labelledby="pi-title">
          <h2 id="pi-title" className="visually-hidden">Profilfelter</h2>
          <ul className="list" role="list">
            <li>
              <a
                className="list-item"
                href="/profile/edit-name"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/profile/edit-name');
                }}
              >
                <section className="li-main">
                  <section className="li-title">Navn</section>
                  <section className="li-sub" id="pi-name">
                    {loading ? 'Laster...' : profile?.fullName || 'Ikke satt'}
                  </section>
                </section>
                <span className="chevron" aria-hidden="true">›</span>
              </a>
            </li>
            <li>
              <a
                className="list-item"
                href="/profile/edit-phone"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/profile/edit-phone');
                }}
              >
                <section className="li-main">
                  <section className="li-title">Telefonnummer</section>
                  <section className="li-sub" id="pi-phone">
                    {loading ? 'Laster...' : profile?.phone || 'Ikke satt'}
                  </section>
                </section>
                <span className="chevron" aria-hidden="true">›</span>
              </a>
            </li>
            <li>
              <a
                className="list-item"
                href="/profile/edit-email"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/profile/edit-email');
                }}
              >
                <section className="li-main">
                  <section className="li-title">E-post</section>
                  <section className="li-sub" id="pi-email">
                    {loading ? 'Laster...' : profile?.email || 'Ikke satt'}
                  </section>
                </section>
                <span className="chevron" aria-hidden="true">›</span>
              </a>
            </li>
            <li>
              <a
                className="list-item"
                href="/profile/change-password"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/profile/change-password');
                }}
              >
                <section className="li-main">
                  <section className="li-title">Passord</section>
                  <section className="li-sub">
                    Endre passord
                  </section>
                </section>
                <span className="chevron" aria-hidden="true">›</span>
              </a>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </section>
  );
}

