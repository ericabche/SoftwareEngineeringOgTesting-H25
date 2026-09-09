import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './Settings.css';

export default function PrivacySettings() {
  const navigate = useNavigate();
  const [shareLocation, setShareLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/settings');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setShareLocation(data.privacy?.shareLocation || false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/settings/privacy');
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ shareLocation }),
      });

      if (res.ok) {
        setResult('Personverninnstillinger oppdatert');
        setTimeout(() => {
          navigate('/settings');
        }, 1500);
      } else {
        setResult('Kunne ikke oppdatere innstillinger');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setResult('Feil ved oppdatering av innstillinger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page-settings">
      <header className="appbar" role="banner" aria-label="Toppmeny">
        <a className="backlink" href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
          Innstillinger
        </a>
        <h1 className="appbar__title">Personvern</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        {isLoadingSettings ? (
          <p>Laster innstillinger...</p>
        ) : (
          <>
            <p className="intro-text">
              Kontroller hvordan dine data deles og brukes.
            </p>

            <section className="settings-group">
              <ul className="list list--grouped">
                <li>
                  <label className="list-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <span className="label">Del lokasjon</span>
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Tillat appen å bruke din lokasjon for å vise nærmeste stoppesteder
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareLocation}
                      onChange={(e) => setShareLocation(e.target.checked)}
                      disabled={isLoading}
                      style={{ width: 'auto', marginLeft: '16px' }}
                    />
                  </label>
                </li>
              </ul>
            </section>

            {result && (
              <p className={`result ${result.includes('oppdatert') ? 'success' : 'error'}`}>
                {result}
              </p>
            )}

            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Lagrer...' : 'Lagre'}
            </button>
          </>
        )}
      </main>

      <Footer />
    </section>
  );
}

