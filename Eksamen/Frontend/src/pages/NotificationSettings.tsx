import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './Settings.css';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
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
        setEnabled(data.notifications !== false);
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
      const url = buildApiUrl('api/settings/notifications');
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ enabled }),
      });

      if (res.ok) {
        setResult('Varslingsinnstillinger oppdatert');
        setTimeout(() => {
          navigate('/settings');
        }, 1500);
      } else {
        setResult('Kunne ikke oppdatere innstillinger');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
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
        <h1 className="appbar__title">Varslinger</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        {isLoadingSettings ? (
          <p>Laster innstillinger...</p>
        ) : (
          <>
            <p className="intro-text">
              Velg hvilke varsler du vil motta.
            </p>

            <section className="settings-group">
              <ul className="list list--grouped">
                <li>
                  <label className="list-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span className="label">Aktiver varslinger</span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
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

