import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../utils/config';
import { getGuestTickets, isGuest } from '../utils/guestUtils';
import type { GuestTicket } from '../utils/guestUtils';
import Footer from '../components/Footer';
import './Ticket.css';

interface Ticket {
  id: number;
  title?: string;
  route?: string;
  routeCode?: string;
  routeName?: string;
  from?: string;
  to?: string;
  purchasedAt?: string;
  validFrom?: string;
  validTo?: string;
  state?: string;
  fareType?: string;
  area?: string;
}

interface QuickPurchase {
  id: string;
  title: string;
  subtitle: string;
  ticketType: string;
  routeName?: string;
  from?: string;
  to?: string;
  routeCode?: string;
  purchasedAt?: string;
  fareType?: string;
}

export default function Ticket() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [upcomingTickets, setUpcomingTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickPurchases, setQuickPurchases] = useState<QuickPurchase[]>([]);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const prevLocationRef = useRef<string>('');

  useEffect(() => {
    // Refresh tickets when navigating to this page
    const currentPath = location.pathname;
    if (prevLocationRef.current !== currentPath && currentPath === '/ticket') {
      fetchTickets();
    }
    prevLocationRef.current = currentPath;
  }, [location.pathname]);

  useEffect(() => {
    fetchTickets();
    
    // Refresh tickets when component becomes visible (e.g., after returning from purchase)
    const handleFocus = () => {
      fetchTickets();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const generateQuickPurchases = (tickets: Ticket[]): QuickPurchase[] => {
    // Create a map to track unique ticket types by their key
    const uniquePurchases = new Map<string, QuickPurchase>();
    
    // Sort tickets by purchase date (most recent first)
    const sortedTickets = [...tickets].sort((a, b) => {
      const dateA = a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0;
      const dateB = b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    // Extract unique ticket types (keep most recent of each type)
    sortedTickets.forEach((ticket) => {
      const ticketTitle = ticket.title || 'Enkeltbillett';
      const routeName = ticket.routeName || 'Østfold';
      const fareType = ticket.fareType || 'Voksen';
      
      // Create a unique key based on ticket type and route
      const key = `${ticketTitle}-${routeName}`;
      
      // Only add if we haven't seen this type before (keeps most recent)
      if (!uniquePurchases.has(key)) {
        // Determine if it's a period ticket or single ticket
        const isPeriodTicket = ticketTitle.toLowerCase().includes('periode') || 
                               ticketTitle.toLowerCase().includes('dag') ||
                               ticketTitle.toLowerCase().includes('dager') ||
                               ticketTitle.toLowerCase().includes('måned') ||
                               ticketTitle.toLowerCase().includes('år');
        
        uniquePurchases.set(key, {
          id: key,
          title: ticketTitle,
          subtitle: `${fareType} • ${routeName}`,
          ticketType: isPeriodTicket ? 'period' : 'single',
          routeName: ticket.routeName,
          from: ticket.from,
          to: ticket.to,
          routeCode: ticket.routeCode,
          purchasedAt: ticket.purchasedAt,
          fareType: ticket.fareType,
        });
      }
    });
    
    // Return the most recent 5 unique purchases
    return Array.from(uniquePurchases.values()).slice(0, 5);
  };

  const fetchTickets = async () => {
    try {
      // If guest, load tickets from localStorage
      if (isGuest()) {
        const guestTickets = getGuestTickets();
        const tickets: Ticket[] = guestTickets.map((gt: GuestTicket) => ({
          id: gt.ticketId,
          title: 'Enkeltbillett',
          routeName: gt.routeName,
          from: gt.from,
          to: gt.to,
          purchasedAt: gt.purchasedAt,
          state: gt.state || 'NEW',
          fareType: gt.fareType,
          validFrom: gt.purchasedAt,
          validTo: gt.purchasedAt ? new Date(new Date(gt.purchasedAt).getTime() + 90 * 60 * 1000).toISOString() : undefined,
        }));

        // Filter tickets by validity
        const now = new Date();
        const active: Ticket[] = [];
        const upcoming: Ticket[] = [];

        tickets.forEach((ticket) => {
          if (ticket.validFrom && ticket.validTo) {
            const validFrom = new Date(ticket.validFrom);
            const validTo = new Date(ticket.validTo);
            
            if (now >= validFrom && now < validTo) {
              active.push(ticket);
            } else if (now < validFrom) {
              upcoming.push(ticket);
            }
          } else if (ticket.state === 'ACTIVE' || ticket.state === 'NEW') {
            active.push(ticket);
          }
        });

        setActiveTickets(active);
        setUpcomingTickets(upcoming);
        
        // Generate quick purchases from all tickets
        const quickPurchases = generateQuickPurchases(tickets);
        setQuickPurchases(quickPurchases);
        
        setIsLoading(false);
        return;
      }

      // If logged in, fetch from API
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
        const tickets: Ticket[] = data.tickets || [];
        
        // Filter tickets by validity
        const now = new Date();
        const active: Ticket[] = [];
        const upcoming: Ticket[] = [];

        tickets.forEach((ticket) => {
          // If ticket has validFrom and validTo, check if it's currently valid
          if (ticket.validFrom && ticket.validTo) {
            const validFrom = new Date(ticket.validFrom);
            const validTo = new Date(ticket.validTo);
            
            if (now >= validFrom && now < validTo) {
              active.push(ticket);
            } else if (now < validFrom) {
              upcoming.push(ticket);
            }
          } else if (ticket.state === 'ACTIVE' || ticket.state === 'NEW') {
            // If no validity dates but state indicates active, include it
            active.push(ticket);
          }
        });

        setActiveTickets(active);
        setUpcomingTickets(upcoming);
        
        // Generate quick purchases from all tickets
        const quickPurchases = generateQuickPurchases(tickets);
        setQuickPurchases(quickPurchases);
      } else {
        console.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nb-NO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleDownload = async (ticketId: number, e: React.MouseEvent) => {
    e.stopPropagation();
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
        if (data.url) {
          window.open(data.url, '_blank');
        } else {
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
    }
  };

  const handleRefund = async (ticketId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Er du sikker på at du vil refundere denne billetten?')) {
      return;
    }

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
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    // Navigate to ticket details or maps
    navigate('/maps', {
      state: {
        ticket: ticket,
        route: ticket.route,
        from: ticket.from,
        to: ticket.to,
      },
    });
  };

  const handleShowAll = () => {
    setShowAllTickets(!showAllTickets);
  };

  const handleQuickPurchase = (purchase: QuickPurchase) => {
    // Determine passenger quantities based on fare type
    // Default to 1 adult ticket
    let adults = 0;
    let children = 0;
    let seniors = 0;
    
    if (purchase.fareType === 'SENIOR' || purchase.fareType === 'Honnør') {
      seniors = 1;
    } else if (purchase.fareType === 'CHILD' || purchase.fareType === 'Barn') {
      children = 1;
    } else {
      adults = 1; // Default to adult
    }
    
    // For period tickets, extract the period type from title
    if (purchase.ticketType === 'period') {
      const title = purchase.title.toLowerCase();
      let periodType = '30 dager'; // Default
      
      if (title.includes('1 dag')) {
        periodType = '1 dag';
      } else if (title.includes('7 dager')) {
        periodType = '7 dager';
      } else if (title.includes('30 dager')) {
        periodType = '30 dager';
      } else if (title.includes('6 måneder') || title.includes('6 måned')) {
        periodType = '6 måneder';
      } else if (title.includes('1 år')) {
        periodType = '1 år';
      }
      
      // Create ticketQuantities for period ticket
      const ticketQuantities: Record<string, { voksen: number; barn: number; honnør: number }> = {};
      ticketQuantities[periodType] = { voksen: adults, barn: children, honnør: seniors };
      
      // Navigate directly to payment page
      navigate('/payment', {
        state: {
          route: null,
          from: purchase.from || '',
          to: purchase.to || '',
          departureTime: '',
          routeCode: purchase.routeCode || '',
          routeName: purchase.routeName || '',
          adults: adults,
          children: children,
          seniors: seniors,
          ticketType: purchase.title,
          ticketQuantities: ticketQuantities,
        },
      });
    } else {
      // For single tickets, create ticketQuantities
      const ticketQuantities: Record<string, { voksen: number; barn: number; honnør: number }> = {};
      ticketQuantities['Enkeltbillett'] = { voksen: adults, barn: children, honnør: seniors };
      
      // Navigate directly to payment page
      navigate('/payment', {
        state: {
          route: null,
          from: purchase.from || '',
          to: purchase.to || '',
          departureTime: '',
          routeCode: purchase.routeCode || '',
          routeName: purchase.routeName || '',
          adults: adults,
          children: children,
          seniors: seniors,
          ticketType: purchase.title,
          ticketQuantities: ticketQuantities,
        },
      });
    }
  };

  // Limit displayed tickets to 2 if not showing all
  const displayedActiveTickets = showAllTickets ? activeTickets : activeTickets.slice(0, 2);
  const displayedUpcomingTickets = showAllTickets ? upcomingTickets : upcomingTickets.slice(0, 2);
  const hasMoreTickets = activeTickets.length > 2 || upcomingTickets.length > 2;

  return (
    <section className="page-billett">
      <header className="appbar" role="banner">
        <h1>Billetter</h1>
      </header>

      <main id="content" className="content" tabIndex={-1}>
        {/* Aktive / kommende billetter */}
        <section aria-labelledby="active-title" className="section">
          <h2 id="active-title" className="sr-only">Aktive billetter</h2>

          {isLoading ? (
            <article className="card card--empty" aria-live="polite">
              <p>Laster billetter...</p>
              <section className="shimmer-row" aria-hidden="true"></section>
              <section className="shimmer-row" aria-hidden="true"></section>
            </article>
          ) : activeTickets.length === 0 && upcomingTickets.length === 0 ? (
            <article id="empty-card" className="card card--empty" aria-live="polite">
              <p>Du har ingen gyldige billetter</p>
              <section className="shimmer-row" aria-hidden="true"></section>
              <section className="shimmer-row" aria-hidden="true"></section>
            </article>
          ) : (
            <>
              <section id="ticket-list" className="list list--cards">
                {displayedActiveTickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="card ticket-card"
                    onClick={() => handleTicketClick(ticket)}
                    style={{ cursor: 'pointer' }}
                  >
                    <section className="ticket-row">
                      <section>
                        <section className="ticket-title">
                          {ticket.title || ticket.routeName || 'Billett'}
                        </section>
                        <section className="ticket-meta">
                          {ticket.fareType || 'Voksen'} • {ticket.area || 'Østfold'}
                        </section>
                      </section>
                      <section className="ticket-qr">QR</section>
                    </section>
                    <section className="ticket-row">
                      <section className="ticket-meta">
                        {ticket.validFrom && `Gyldig fra ${formatDate(ticket.validFrom)}`}
                      </section>
                      <section className="ticket-status">Aktiv nå</section>
                    </section>
                    <section className="ticket-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => handleDownload(ticket.id, e)}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Last ned
                      </button>
                      {ticket.state !== 'REFUNDED' && (
                        <button
                          onClick={(e) => handleRefund(ticket.id, e)}
                          style={{
                            flex: 1,
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Refunder
                        </button>
                      )}
                    </section>
                  </article>
                ))}
                {displayedUpcomingTickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="card ticket-card"
                    onClick={() => handleTicketClick(ticket)}
                    style={{ cursor: 'pointer' }}
                  >
                    <section className="ticket-row">
                      <section>
                        <section className="ticket-title">
                          {ticket.title || ticket.routeName || 'Billett'}
                        </section>
                        <section className="ticket-meta">
                          {ticket.fareType || 'Voksen'} • {ticket.area || 'Østfold'}
                        </section>
                      </section>
                      <section className="ticket-qr">QR</section>
                    </section>
                    <section className="ticket-row">
                      <section className="ticket-meta">
                        {ticket.validFrom && `Gyldig fra ${formatDate(ticket.validFrom)}`}
                      </section>
                      <section className="ticket-status">
                        {ticket.validFrom && `Starter ${formatDate(ticket.validFrom)}`}
                      </section>
                    </section>
                    <section className="ticket-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => handleDownload(ticket.id, e)}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Last ned
                      </button>
                      {ticket.state !== 'REFUNDED' && (
                        <button
                          onClick={(e) => handleRefund(ticket.id, e)}
                          style={{
                            flex: 1,
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Refunder
                        </button>
                      )}
                    </section>
                  </article>
                ))}
              </section>
              
              {hasMoreTickets && (
                <section style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <button 
                    className="link-button" 
                    type="button" 
                    onClick={handleShowAll}
                    style={{ textAlign: 'center' }}
                  >
                    {showAllTickets ? 'Vis færre' : 'Se alle'}
                  </button>
                </section>
              )}
            </>
          )}
        </section>

        {/* Hurtigkjøp */}
        <section aria-labelledby="quick-title" className="section">
          <header className="section-head">
            <h2 id="quick-title">Hurtigkjøp</h2>
          </header>

          <ul id="quick-list" className="list list--cards" role="list">
            {quickPurchases.length === 0 ? (
              <li>
                <p className="empty-text">Ingen hurtigkjøp tilgjengelig</p>
              </li>
            ) : (
              quickPurchases.map((purchase) => (
                <li key={purchase.id}>
                  <article className="card" style={{ cursor: 'pointer' }} onClick={() => handleQuickPurchase(purchase)}>
                    <section className="ticket-row">
                      <section>
                        <section className="ticket-title">{purchase.title}</section>
                        <section className="ticket-meta">{purchase.subtitle}</section>
                      </section>
                      <button
                        className="row-cta"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickPurchase(purchase);
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Kjøp
                      </button>
                    </section>
                  </article>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Primær CTA */}
        <section className="section section--cta">
          <button
            id="btn-new"
            className="btn btn--primary btn--xl"
            type="button"
            onClick={() => navigate('/ticket-purchase')}
          >
            NY BILLETT
          </button>
        </section>
      </main>

      <Footer />
    </section>
  );
}

