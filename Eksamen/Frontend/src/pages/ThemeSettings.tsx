import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './Settings.css';

export default function ThemeSettings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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
        setTheme(data.theme || 'light');
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', data.theme || 'light');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/settings/theme');
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ theme }),
      });

      if (res.ok) {
        setResult('Tema oppdatert');
        setTimeout(() => {
          navigate('/settings');
        }, 1500);
      } else {
        setResult('Kunne ikke oppdatere tema');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      setResult('Feil ved oppdatering av tema');
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
        <h1 className="appbar__title">Tema</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        {isLoadingSettings ? (
          <p>Laster innstillinger...</p>
        ) : (
          <>
            <p className="intro-text">
              Velg fargetema for appen.
            </p>

            <section className="settings-group">
              <ul className="list list--grouped">
                <li>
                  <label className="list-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={theme === 'light'}
                      onChange={() => handleThemeChange('light')}
                      disabled={isLoading}
                      style={{ marginRight: '12px' }}
                    />
                    <span className="label">Lys</span>
                  </label>
                </li>
                <li>
                  <label className="list-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={theme === 'dark'}
                      onChange={() => handleThemeChange('dark')}
                      disabled={isLoading}
                      style={{ marginRight: '12px' }}
                    />
                    <span className="label">Mørk</span>
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

