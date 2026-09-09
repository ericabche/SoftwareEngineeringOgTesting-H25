import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../utils/config';
import { isGuest, storeGuestTicket } from '../utils/guestUtils';
import type { GuestTicket } from '../utils/guestUtils';
import Footer from '../components/Footer';

interface TicketQuantities {
  voksen: number;
  barn: number;
  honnør: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  isImage: boolean;
  fallback?: string;
  combinedIcons?: string[];
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.state?.route || null;
  const from = location.state?.from || '';
  const to = location.state?.to || '';
  const departureTime = location.state?.departureTime || '';
  const routeCode = location.state?.routeCode || '';
  const routeName = location.state?.routeName || '';
  const adults = location.state?.adults || 0;
  const children = location.state?.children || 0;
  const seniors = location.state?.seniors || 0;
  const ticketType = location.state?.ticketType || 'Enkeltbillett';
  const ticketQuantities = location.state?.ticketQuantities || null;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    { 
      id: 'vipps', 
      name: 'Vipps', 
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vipps.svg',
      isImage: true,
      fallback: 'fa-mobile-alt'
    },
    { 
      id: 'card', 
      name: 'Kort', 
      icon: 'fa-credit-card',
      isImage: false
    },
    { 
      id: 'klarna', 
      name: 'Klarna', 
      icon: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/klarna.svg',
      isImage: true,
      fallback: 'fa-shopping-bag'
    },
    { 
      id: 'balance', 
      name: 'App-saldo', 
      icon: 'fa-wallet',
      isImage: false
    },
    { 
      id: 'wallet', 
      name: 'Apple Pay / Google Pay', 
      icon: 'combined',
      isImage: true,
      fallback: 'fa-mobile-alt',
      combinedIcons: [
        'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applepay.svg',
        'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlepay.svg'
      ]
    },
  ];

  const getTicketSummary = () => {
    if (!ticketQuantities) {
      // Fallback to old structure
      if (adults > 0 || children > 0 || seniors > 0) {
        return [{
          ticketType: ticketType,
          quantities: { voksen: adults, barn: children, honnør: seniors }
        }];
      }
      return [];
    }
    
    const summary: Array<{ ticketType: string; quantities: TicketQuantities }> = [];
    Object.entries(ticketQuantities).forEach(([ticketType, quantities]) => {
      const qty = quantities as TicketQuantities;
      const total = qty.voksen + qty.barn + qty.honnør;
      if (total > 0) {
        summary.push({ ticketType, quantities: qty });
      }
    });
    return summary;
  };

  const ticketSummary = getTicketSummary();

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Vennligst velg en betalingsmåte');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/tickets/buy');
      
      // Determine fare type based on passenger selection
      let fareType = 'ADULT';
      if (seniors > 0) {
        fareType = 'SENIOR';
      } else if (children > 0) {
        fareType = 'ADULT'; // Children typically use ADULT fare type, or you might need a CHILD type
      }

      // For now, we'll need a departureId - this should come from the route selection
      // For simplicity, we'll use a placeholder or get it from the route
      const requestBody = {
        departureId: 1, // TODO: Get actual departure ID from route
        paymentMethodId: 1, // TODO: Get from payment method selection
        fareType: fareType,
        routeCode: routeCode,
        routeName: routeName,
        from: from,
        to: to,
        departureTime: departureTime,
        adults: adults,
        children: children,
        seniors: seniors,
        ticketType: ticketType,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();
        
        // If guest, store ticket locally
        if (isGuest() && data.ticketId) {
          const guestTicket: GuestTicket = {
            ticketId: data.ticketId,
            qrCodeHash: data.qrCodeHash || '',
            purchasedAt: new Date().toISOString(),
            routeCode: routeCode,
            routeName: routeName,
            from: from,
            to: to,
            departureTime: departureTime,
            fareType: fareType,
            priceCents: 4000, // Default price
            state: 'NEW',
          };
          storeGuestTicket(guestTicket);
        }
        
        navigate('/ticket/success', {
          state: {
            ticketId: data.ticketId,
            route,
            from,
            to,
            departureTime,
            routeCode,
            routeName,
          },
        });
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Failed to purchase ticket' }));
        setError(errorData.message || 'Failed to purchase ticket');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      setError('An error occurred while purchasing the ticket');
      setIsProcessing(false);
    }
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
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#000', textAlign: 'left', flex: 1 }}>Kjøp billett</h1>
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

        {ticketSummary.length > 0 && (
          <section style={{
            padding: '16px',
            backgroundColor: 'white',
            border: '1px solid #e8e8e8',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>Billetter</span>
            </div>
            {ticketSummary.map(({ ticketType, quantities }) => {
              const total = quantities.voksen + quantities.barn + quantities.honnør;
              return (
                <div key={ticketType} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: ticketSummary.length > 1 ? '1px solid #e8e8e8' : 'none' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '6px' }}>{ticketType}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {quantities.voksen > 0 && `${quantities.voksen} voksen${quantities.voksen > 1 ? 'er' : ''}`}
                    {quantities.voksen > 0 && (quantities.barn > 0 || quantities.honnør > 0) && ', '}
                    {quantities.barn > 0 && `${quantities.barn} barn${quantities.barn > 1 ? '' : ''}`}
                    {quantities.barn > 0 && quantities.honnør > 0 && ', '}
                    {quantities.honnør > 0 && `${quantities.honnør} honnør${quantities.honnør > 1 ? 'er' : ''}`}
                    {' '}({total} {total === 1 ? 'billett' : 'billetter'})
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {departureTime && (
          <section style={{
            padding: '16px',
            backgroundColor: 'white',
            border: '1px solid #e8e8e8',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>Starter</span>
            <span style={{ fontSize: '15px', color: '#000' }}>
              {new Date(departureTime).toLocaleDateString('nb-NO', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </section>
        )}
        
        {routeName && (
          <section style={{
            padding: '16px',
            backgroundColor: 'white',
            border: '1px solid #e8e8e8',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#000', marginBottom: '8px' }}>
              <strong>{routeName}</strong> ({routeCode})
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {from} → {to}
            </div>
          </section>
        )}

        <div>
          <section
            onClick={() => setShowPaymentMethods(!showPaymentMethods)}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>
              Betalingsmåte {selectedPaymentMethod && `• ${paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name || ''}`}
            </span>
            <span style={{ fontSize: '20px', color: '#666' }}>{showPaymentMethods ? '▼' : '›'}</span>
          </section>

          {showPaymentMethods && (
            <div style={{
              marginTop: '-12px',
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              borderTopLeftRadius: '0',
              borderTopRightRadius: '0'
            }}>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id);
                    setShowPaymentMethods(false);
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: selectedPaymentMethod === method.id ? '#e3f2fd' : 'white',
                    border: selectedPaymentMethod === method.id ? '2px solid #007bff' : '1px solid #e8e8e8',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPaymentMethod !== method.id) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPaymentMethod !== method.id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {method.isImage ? (
                    <div style={{ position: 'relative', width: method.icon === 'combined' ? '64px' : '32px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      {method.icon === 'combined' && method.combinedIcons ? (
                        <>
                          <img 
                            src={method.combinedIcons[0]} 
                            alt="Apple Pay"
                            style={{ 
                              maxWidth: '28px', 
                              maxHeight: '20px', 
                              objectFit: 'contain',
                              backgroundColor: 'white',
                              padding: '2px',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <img 
                            src={method.combinedIcons[1]} 
                            alt="Google Pay"
                            style={{ 
                              maxWidth: '28px', 
                              maxHeight: '20px', 
                              objectFit: 'contain',
                              backgroundColor: 'white',
                              padding: '2px',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </>
                      ) : (
                        <img 
                          src={method.icon} 
                          alt={method.name}
                          style={{ 
                            maxWidth: '32px', 
                            maxHeight: '24px', 
                            objectFit: 'contain',
                            backgroundColor: 'white',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                            if (fallback && method.fallback) {
                              fallback.style.display = 'inline';
                            }
                          }}
                        />
                      )}
                      {method.fallback && (
                        <i className={`fas ${method.fallback} fallback-icon`} style={{ 
                          fontSize: '20px', 
                          color: '#666', 
                          display: 'none',
                          position: 'absolute'
                        }}></i>
                      )}
                    </div>
                  ) : (
                    <i className={`fas ${method.icon}`} style={{ fontSize: '20px', color: '#666', width: '24px', textAlign: 'center' }}></i>
                  )}
                  <span style={{ fontSize: '15px', fontWeight: selectedPaymentMethod === method.id ? '600' : '400', color: '#000', flex: 1 }}>
                    {method.name}
                  </span>
                  {selectedPaymentMethod === method.id && (
                    <span style={{ fontSize: '16px', color: '#007bff' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <section style={{
          padding: '16px',
          backgroundColor: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>Sum</span>
          <span style={{ fontSize: '24px', fontWeight: '600', color: '#007bff' }}>40 kr</span>
        </section>

        {error && (
          <div style={{ 
            color: '#d32f2f', 
            fontSize: '14px', 
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '8px',
            backgroundColor: isProcessing ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '0.8rem',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = '#007bff';
            }
          }}
        >
          {isProcessing 
            ? 'Behandler...' 
            : selectedPaymentMethod 
              ? `Kjøp med ${paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name || 'betalingsmåte'}` 
              : 'Velg betalingsmåte'}
        </button>
      </section>

      <Footer />
    </main>
  );
}

