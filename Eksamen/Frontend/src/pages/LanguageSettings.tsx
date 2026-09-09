import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './Settings.css';

const languages = [
  { code: 'no', name: 'Norsk Bokmål' },
  { code: 'nn', name: 'Norsk Nynorsk' },
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Svenska' },
];

export default function LanguageSettings() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('no');
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
        setLanguage(data.language || 'no');
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
      const url = buildApiUrl('api/settings/language');
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ language }),
      });

      if (res.ok) {
        setResult('Språk oppdatert');
        setTimeout(() => {
          navigate('/settings');
        }, 1500);
      } else {
        setResult('Kunne ikke oppdatere språk');
      }
    } catch (error) {
      console.error('Error updating language:', error);
      setResult('Feil ved oppdatering av språk');
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
        <h1 className="appbar__title">Språk</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        {isLoadingSettings ? (
          <p>Laster innstillinger...</p>
        ) : (
          <>
            <p className="intro-text">
              Velg språk for appen.
            </p>

            <section className="settings-group">
              <ul className="list list--grouped">
                {languages.map((lang) => (
                  <li key={lang.code}>
                    <label className="list-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="language"
                        value={lang.code}
                        checked={language === lang.code}
                        onChange={() => setLanguage(lang.code)}
                        disabled={isLoading}
                        style={{ marginRight: '12px' }}
                      />
                      <span className="label">{lang.name}</span>
                    </label>
                  </li>
                ))}
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

