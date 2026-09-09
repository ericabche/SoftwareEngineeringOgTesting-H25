import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/config';
import Footer from '../components/Footer';
import './PaymentMethods.css';

export default function PaymentMethods() {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/payment/methods');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page page--payments">
      <header className="appbar" role="banner">
        <nav aria-label="Tilbake">
          <a className="backlink" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
            Profil
          </a>
        </nav>
        <h1 className="appbar__title">Betalingsmåter</h1>
      </header>

      <main id="main" tabIndex={-1}>
        {loading ? (
          <section className="loading">Laster...</section>
        ) : paymentMethods.length === 0 ? (
          <section className="empty-state" aria-live="polite">
            <section className="empty-illustration" aria-hidden="true"></section>
            <p className="empty-text">Du har ikke lagt til betalingsmåte.</p>
            <button type="button" className="btn btn--primary" onClick={() => navigate('/payment-methods/add')}>
              Legg til
            </button>
          </section>
        ) : (
          <section aria-labelledby="paylist-title">
            <h2 id="paylist-title">Dine betalingsmåter</h2>
            <ul className="list list--cards">
              {paymentMethods.map((method) => (
                <li key={method.id}>
                  <article className="list-item" role="group" aria-label={method.name}>
                    <section className="li-main">
                      <section className="li-title">{method.name}</section>
                      {method.expiry && <section className="li-sub">Utløper {method.expiry}</section>}
                    </section>
                    <button className="row-cta" onClick={() => {/* Handle remove */}}>
                      Fjern
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </section>
  );
}

