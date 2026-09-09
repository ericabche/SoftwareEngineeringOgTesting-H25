import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';

interface TicketQuantities {
  voksen: number;
  barn: number;
  honnør: number;
}

export default function PeriodTicket() {
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.state?.route || null;
  const from = location.state?.from || '';
  const to = location.state?.to || '';
  const departureTime = location.state?.departureTime || '';
  const routeCode = location.state?.routeCode || '';
  const routeName = location.state?.routeName || '';
  
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, TicketQuantities>>({
    '1 dag': { voksen: 0, barn: 0, honnør: 0 },
    '7 dager': { voksen: 0, barn: 0, honnør: 0 },
    '30 dager': { voksen: 0, barn: 0, honnør: 0 },
    '6 måneder': { voksen: 0, barn: 0, honnør: 0 },
    '1 år': { voksen: 0, barn: 0, honnør: 0 },
  });

  const periodTickets = [
    { id: '1 dag', name: '1 dag', price: 150 },
    { id: '7 dager', name: '7 dager', price: 800 },
    { id: '30 dager', name: '30 dager', price: 2500 },
    { id: '6 måneder', name: '6 måneder', price: 12000 },
    { id: '1 år', name: '1 år', price: 20000 },
  ];

  const updateQuantity = (ticketType: string, passengerType: 'voksen' | 'barn' | 'honnør', delta: number) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketType]: {
        ...prev[ticketType],
        [passengerType]: Math.max(0, (prev[ticketType]?.[passengerType] || 0) + delta)
      }
    }));
  };

  const toggleTicket = (ticketType: string) => {
    setExpandedTicket(expandedTicket === ticketType ? null : ticketType);
  };

  const getTotalTickets = () => {
    return Object.values(ticketQuantities).reduce((total, qty) => {
      return total + qty.voksen + qty.barn + qty.honnør;
    }, 0);
  };

  const getTicketSummary = () => {
    const summary: Array<{ ticketType: string; quantities: TicketQuantities }> = [];
    Object.entries(ticketQuantities).forEach(([ticketType, quantities]) => {
      const total = quantities.voksen + quantities.barn + quantities.honnør;
      if (total > 0) {
        summary.push({ ticketType, quantities });
      }
    });
    return summary;
  };

  const handlePurchase = () => {
    const summary = getTicketSummary();
    if (summary.length === 0) return;
    
    const firstTicket = summary[0];
    navigate('/payment', {
      state: {
        route,
        from,
        to,
        departureTime,
        routeCode,
        routeName,
        adults: firstTicket.quantities.voksen,
        children: firstTicket.quantities.barn,
        seniors: firstTicket.quantities.honnør,
        ticketType: `Periodebillett ${firstTicket.ticketType}`,
        ticketQuantities: ticketQuantities,
      },
    });
  };

  return (
    <main className="home" style={{ paddingBottom: '2rem' }}>
      <section style={{ 
        width: '100%', 
        backgroundColor: 'rgb(250, 250, 250)', 
        borderRadius: '0.8rem', 
        padding: '1.5rem',
        filter: 'drop-shadow(0 0.4rem 0.8rem rgba(0, 0, 0, 0.2))',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              cursor: 'pointer',
              padding: 0
            }}
          >
            ‹ Velg billett
          </button>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#000', textAlign: 'center', flex: 1 }}>Periodebillett</h1>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000',
              cursor: 'pointer',
              padding: 0
            }}
          >
            Avbryt
          </button>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', color: '#000', textAlign: 'left' }}>Velg billett</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {periodTickets.map((ticket) => {
              const isExpanded = expandedTicket === ticket.id;
              const quantities = ticketQuantities[ticket.id] || { voksen: 0, barn: 0, honnør: 0 };

              return (
                <div key={ticket.id}>
                  <div
                    onClick={() => toggleTicket(ticket.id)}
                    style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      border: isExpanded ? '2px solid #007bff' : '1px solid #e8e8e8',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.borderColor = '#d0d0d0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e8e8e8';
                      }
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>
                        Periodebillett {ticket.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {ticket.price} kr
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div style={{
                      marginTop: '12px',
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e8e8e8',
                      borderRadius: '8px'
                    }}>
                      {(['voksen', 'barn', 'honnør'] as const).map((passengerType) => {
                        const count = quantities[passengerType];
                        const labels: Record<string, { title: string; desc?: string }> = {
                          voksen: { title: 'Voksen' },
                          barn: { title: 'Barn', desc: '6-17 år. Barn under 6 år reiser gratis' },
                          honnør: { title: 'Honnør', desc: 'Fra 67 år og personer med norsk uføretrygd.' }
                        };
                        const label = labels[passengerType];

                        return (
                          <div
                            key={passengerType}
                            style={{
                              padding: '12px',
                              backgroundColor: 'white',
                              border: '1px solid #e8e8e8',
                              borderRadius: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>{label.title}</div>
                              {label.desc && (
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{label.desc}</div>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(ticket.id, passengerType, -1);
                                }}
                                disabled={count === 0}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  border: '1px solid #e8e8e8',
                                  backgroundColor: count === 0 ? '#f5f5f5' : 'white',
                                  color: count === 0 ? '#ccc' : '#333',
                                  cursor: count === 0 ? 'not-allowed' : 'pointer',
                                  fontSize: '20px',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                              >−</button>
                              <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '32px', textAlign: 'center', color: '#000' }}>
                                {count}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(ticket.id, passengerType, 1);
                                }}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  border: '1px solid #e8e8e8',
                                  backgroundColor: 'white',
                                  color: '#333',
                                  cursor: 'pointer',
                                  fontSize: '20px',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                              >+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {getTotalTickets() > 0 && (
          <div style={{
            marginTop: '2rem',
            padding: '16px',
            backgroundColor: 'white',
            border: '1px solid #e8e8e8',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px 0', color: '#000' }}>Oppsummering</h3>
            {getTicketSummary().map(({ ticketType, quantities }) => {
              const total = quantities.voksen + quantities.barn + quantities.honnør;
              const ticketInfo = periodTickets.find(t => t.id === ticketType);
              return (
                <div key={ticketType} style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                  <strong style={{ color: '#000' }}>Periodebillett {ticketType}:</strong> {' '}
                  {quantities.voksen > 0 && `${quantities.voksen} voksen`}
                  {quantities.voksen > 0 && (quantities.barn > 0 || quantities.honnør > 0) && ', '}
                  {quantities.barn > 0 && `${quantities.barn} barn`}
                  {quantities.barn > 0 && quantities.honnør > 0 && ', '}
                  {quantities.honnør > 0 && `${quantities.honnør} honnør`}
                  {' '}({total} {total === 1 ? 'billett' : 'billetter'})
                  {ticketInfo && <span style={{ color: '#007bff', marginLeft: '8px' }}>• {ticketInfo.price} kr</span>}
                </div>
              );
            })}
            <button
              onClick={handlePurchase}
              style={{
                width: '100%',
                padding: '16px',
                marginTop: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '0.8rem',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
              }}
            >
              Fortsett til betaling
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

