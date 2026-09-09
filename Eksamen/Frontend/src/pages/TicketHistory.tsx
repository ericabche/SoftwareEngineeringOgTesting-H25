import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './TicketHistory.css';

interface Ticket {
  id: number;
  title?: string;
  route?: string;
  routeCode?: string;
  routeName?: string;
  from?: string;
  to?: string;
  purchasedAt?: string;
  state?: string;
  fareType?: string;
  priceCents?: number;
  facts?: string[];
}

export default function TicketHistory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'receipts' | 'tickets'>('receipts');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingTicket, setProcessingTicket] = useState<number | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/tickets/history?page=0&size=100');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const fetchedTickets: Ticket[] = (data.tickets || []).map((t: any) => ({
          id: t.id,
          title: t.routeName || 'Billett',
          route: t.route,
          routeCode: t.routeCode,
          routeName: t.routeName,
          from: t.from,
          to: t.to,
          purchasedAt: t.purchasedAt,
          state: t.state,
          fareType: t.fareType,
          priceCents: t.priceCents,
          facts: [
            t.fareType || 'Voksen',
            t.purchasedAt ? new Date(t.purchasedAt).toLocaleDateString('nb-NO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : '',
          ],
        }));
        setTickets(fetchedTickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (ticketId: number) => {
    setProcessingTicket(ticketId);
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/tickets/${ticketId}/download`);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        // If the API returns a URL, open it in a new window
        if (data.url) {
          window.open(data.url, '_blank');
        } else {
          // Otherwise, try to download as blob
          const blob = await res.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `ticket-${ticketId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
        }
      } else {
        alert('Kunne ikke laste ned billetten');
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Feil ved nedlasting av billett');
    } finally {
      setProcessingTicket(null);
    }
  };

  const handleRefund = async (ticketId: number) => {
    if (!confirm('Er du sikker på at du vil refundere denne billetten?')) {
      return;
    }

    setProcessingTicket(ticketId);
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/tickets/${ticketId}/refund`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        alert('Refusjon er behandlet');
        fetchTickets(); // Refresh tickets
      } else {
        const data = await res.json();
        alert(data.message || 'Kunne ikke refundere billetten');
      }
    } catch (error) {
      console.error('Error refunding ticket:', error);
      alert('Feil ved refusjon av billett');
    } finally {
      setProcessingTicket(null);
    }
  };

  // Group tickets by month for receipts
  const receipts = tickets.map(t => ({
    id: t.id,
    title: t.title || 'Billett',
    price: t.priceCents ? `${(t.priceCents / 100).toFixed(0)} kr` : 'N/A',
    date: t.purchasedAt ? new Date(t.purchasedAt).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) : '',
  }));

  return (
    <section className="page page--history">
      <header className="appbar" role="banner">
        <nav aria-label="Tilbake">
          <a className="backlink" href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>
            Profil
          </a>
        </nav>
        <h1 className="appbar__title">Billett­historikk</h1>
      </header>

      <main id="main" tabIndex={-1}>
        {/* Faner */}
        <section className="tabs" role="tablist" aria-label="Visning">
          <button
            role="tab"
            aria-selected={activeTab === 'receipts'}
            id="tab-receipts"
            aria-controls="panel-receipts"
            onClick={() => setActiveTab('receipts')}
            className={activeTab === 'receipts' ? 'active' : ''}
          >
            Kvitteringer
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'tickets'}
            id="tab-tickets"
            aria-controls="panel-tickets"
            onClick={() => setActiveTab('tickets')}
            className={activeTab === 'tickets' ? 'active' : ''}
          >
            Billetter
          </button>
        </section>

        {/* Panel: Kvitteringer */}
        {activeTab === 'receipts' && (
          <section id="panel-receipts" role="tabpanel" aria-labelledby="tab-receipts">
            <h2 className="group-title">November 2025</h2>
            <ul className="cardlist" aria-label="Kvitteringer i november 2025">
              {receipts.map((receipt) => (
                <li key={receipt.id}>
                  <article className="card receipt">
                    <header className="card__header">
                      <h3 className="card__title">{receipt.title}</h3>
                      <section className="card__price">{receipt.price}</section>
                    </header>
                    <p className="card__meta">{receipt.date}</p>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Panel: Billetter */}
        {activeTab === 'tickets' && (
          <section id="panel-tickets" role="tabpanel" aria-labelledby="tab-tickets">
            {isLoading ? (
              <p>Laster billetter...</p>
            ) : tickets.length === 0 ? (
              <p>Ingen billetter funnet</p>
            ) : (
              <>
                <h2 className="group-title">Billetter</h2>
                <ul className="cardlist" aria-label="Billetter">
                  {tickets.map((ticket) => (
                    <li key={ticket.id}>
                      <article className="card ticket">
                        <header className="card__header">
                          <h3 className="card__title">{ticket.title}</h3>
                        </header>
                        <ul className="card__facts">
                          {ticket.facts?.map((fact, index) => (
                            <li key={index}>{fact}</li>
                          ))}
                        </ul>
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid #eee'
                        }}>
                          <button
                            onClick={() => handleDownload(ticket.id)}
                            disabled={processingTicket === ticket.id}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: processingTicket === ticket.id ? 'not-allowed' : 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {processingTicket === ticket.id ? 'Laster ned...' : 'Last ned'}
                          </button>
                          {ticket.state !== 'REFUNDED' && (
                            <button
                              onClick={() => handleRefund(ticket.id)}
                              disabled={processingTicket === ticket.id}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: processingTicket === ticket.id ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              {processingTicket === ticket.id ? 'Behandler...' : 'Refunder'}
                            </button>
                          )}
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </main>

      <Footer />
    </section>
  );
}

