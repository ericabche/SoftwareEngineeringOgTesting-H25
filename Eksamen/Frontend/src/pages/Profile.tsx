import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { getGuestTickets, isGuest } from '../utils/guestUtils';
import { buildApiUrl } from '../utils/config';
import type { GuestTicket } from '../utils/guestUtils';
import './Profile.css';

interface ProfileProps {
  onLogout?: () => void;
}

export default function Profile({ onLogout }: ProfileProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Bruker';
  const [guestTickets, setGuestTickets] = useState<GuestTicket[]>([]);
  const [ticketImportId, setTicketImportId] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [importMode, setImportMode] = useState<'type' | 'scan'>('type');
  const [isScanning, setIsScanning] = useState(false);
  const [scanVideoRef, setScanVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isGuest()) {
      setGuestTickets(getGuestTickets());
    }
  }, []);

  useEffect(() => {
    // Start scanning when switching to scan mode and video ref is available
    if (importMode === 'scan' && scanVideoRef && !isScanning) {
      // Small delay to ensure video element is ready
      const timer = setTimeout(() => {
        startScanning(scanVideoRef);
      }, 100);
      return () => clearTimeout(timer);
    }

    // Cleanup camera when mode changes away from scan
    if (importMode !== 'scan' && scanVideoRef && scanVideoRef.srcObject) {
      const stream = scanVideoRef.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsScanning(false);
    }
  }, [importMode, scanVideoRef, isScanning]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login', { replace: true });
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const importTicketById = async (ticketId: number) => {
    setImportError('');
    setImportSuccess('');

    try {
      // Fetch ticket from backend
      const url = buildApiUrl(`api/tickets/${ticketId}`);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const ticket = await res.json();
        // If user is logged in, ticket is already in their account
        // If guest, store it locally
        if (isGuest()) {
          const guestTicket: GuestTicket = {
            ticketId: ticket.id,
            qrCodeHash: ticket.qrCodeHash || '',
            purchasedAt: ticket.purchasedAt || new Date().toISOString(),
            routeCode: ticket.routeCode,
            routeName: ticket.routeName,
            from: ticket.from,
            to: ticket.to,
            departureTime: ticket.departureTime,
            fareType: ticket.fareType,
            priceCents: ticket.priceCents,
            state: ticket.state,
          };
          const tickets = getGuestTickets();
          if (!tickets.find(t => t.ticketId === ticketId)) {
            tickets.push(guestTicket);
            localStorage.setItem(`guestTickets_${localStorage.getItem('clientId')}`, JSON.stringify(tickets));
            setGuestTickets(tickets);
            setImportSuccess('Billett importert!');
            setTicketImportId('');
            if (isScanning) {
              stopScanning();
            }
          } else {
            setImportError('Billett er allerede importert');
          }
        } else {
          setImportSuccess('Billett er allerede i din konto');
          setTicketImportId('');
          if (isScanning) {
            stopScanning();
          }
        }
      } else {
        setImportError('Kunne ikke finne billett. Sjekk at billett-ID er korrekt.');
      }
    } catch (error) {
      console.error('Error importing ticket:', error);
      setImportError('Feil ved import av billett');
    }
  };

  const handleImportTicket = async () => {
    if (!ticketImportId.trim()) {
      setImportError('Vennligst skriv inn billett-ID');
      return;
    }

    const ticketId = parseInt(ticketImportId.trim());
    if (isNaN(ticketId)) {
      setImportError('Ugyldig billett-ID');
      return;
    }

    await importTicketById(ticketId);
  };

  const startScanning = async (videoElement?: HTMLVideoElement) => {
    const video = videoElement || scanVideoRef;
    if (!video) return;

    try {
      setIsScanning(true);
      setImportError('');
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      video.srcObject = stream;
      await video.play();

      // QR code detection using canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      
      const scanInterval = setInterval(async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Try to extract QR code from image
          // For now, we'll check if the QR code contains a ticket ID
          // In production, you'd use a QR library like jsQR or html5-qrcode
          // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Simple pattern matching - look for numeric ticket IDs in the image
          // This is a placeholder - proper implementation would use a QR library
          // For now, we'll show a message that manual entry is needed
        }
      }, 500);

      // Store interval for cleanup
      (window as any).qrScanInterval = scanInterval;
    } catch (error) {
      console.error('Error accessing camera:', error);
      setImportError('Kunne ikke få tilgang til kamera. Vennligst tillat kamera-tilgang.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scanVideoRef && scanVideoRef.srcObject) {
      const stream = scanVideoRef.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      scanVideoRef.srcObject = null;
    }
    if ((window as any).qrScanInterval) {
      clearInterval((window as any).qrScanInterval);
    }
    setIsScanning(false);
  };


  return (
    <section className="page page-profil">
      <main className="container">
        {/* Profilstatus */}
        {!token ? (
          <article className="card card--profile">
            <button 
              type="button"
              className="list-item"
              onClick={handleLogin}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              <section>
                <p className="li-title">Du er ikke logget inn</p>
                <p className="li-sub">Logg inn eller opprett profil, så tar vi alltid vare på billettene dine</p>
              </section>
            </button>
          </article>
        ) : (
          <article className="card card--profile">
            <a href="/profile/details" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/profile/details'); }}>
              <section>
                <p className="li-title">{username}</p>
                <p className="li-sub">Informasjonen din</p>
              </section>
            </a>
          </article>
        )}

        {/* Innstillinger */}
        <nav aria-labelledby="settings-title" className="section">
          <h2 id="settings-title" className="section-title">Innstillinger</h2>
          <ul className="list list--grouped" role="list">
            <li>
              <a href="/settings" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
                <span className="li-title">Innstillinger</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Guest tickets */}
        {isGuest() && guestTickets.length > 0 && (
          <nav aria-labelledby="guest-tickets-title" className="section">
            <h2 id="guest-tickets-title" className="section-title">Dine gjestebilletter</h2>
            <ul className="list list--grouped" role="list">
              {guestTickets.map((ticket) => (
                <li key={ticket.ticketId}>
                  <div className="list-item">
                    <span className="li-title">Billett #{ticket.ticketId}</span>
                    {ticket.routeName && (
                      <span className="li-sub">{ticket.routeName} - {ticket.from} → {ticket.to}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Import ticket */}
        {isGuest() && (
          <nav aria-labelledby="import-ticket-title" className="section">
            <h2 id="import-ticket-title" className="section-title">Importer billett</h2>
            <div style={{ padding: '16px' }}>
              {/* Mode selector */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '16px',
                borderBottom: '1px solid #ddd',
                paddingBottom: '8px'
              }}>
                <button
                  onClick={() => {
                    if (isScanning) stopScanning();
                    setImportMode('type');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: importMode === 'type' ? '#007bff' : '#f0f0f0',
                    color: importMode === 'type' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: importMode === 'type' ? '500' : 'normal'
                  }}
                >
                  Skriv inn ID
                </button>
                <button
                  onClick={() => {
                    if (isScanning) stopScanning();
                    setImportMode('scan');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: importMode === 'scan' ? '#007bff' : '#f0f0f0',
                    color: importMode === 'scan' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: importMode === 'scan' ? '500' : 'normal'
                  }}
                >
                  Skann QR-kode
                </button>
              </div>

              {/* Type mode */}
              {importMode === 'type' && (
                <>
                  <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                    Har du en billett-ID? Skriv den inn for å importere billetten.
                  </p>
                  <input
                    type="text"
                    placeholder="Billett-ID"
                    value={ticketImportId}
                    onChange={(e) => setTicketImportId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleImportTicket()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </>
              )}

              {/* Scan mode */}
              {importMode === 'scan' && (
                <>
                  <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                    Skann QR-koden på billetten for å importere den.
                  </p>
                  <div style={{ marginBottom: '12px', position: 'relative' }}>
                    <video
                      ref={(ref) => {
                        setScanVideoRef(ref);
                        // Start scanning when video element is ready and we're in scan mode
                        if (ref && importMode === 'scan' && !isScanning) {
                          setTimeout(() => {
                            startScanning(ref);
                          }, 100);
                        }
                      }}
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        borderRadius: '4px',
                        backgroundColor: '#000'
                      }}
                      playsInline
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '200px',
                      height: '200px',
                      border: '2px solid #007bff',
                      borderRadius: '8px',
                      pointerEvents: 'none'
                    }} />
                    <p style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      margin: 0
                    }}>
                      Rett kameraet mot QR-koden
                    </p>
                    <button
                      onClick={stopScanning}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Stopp
                    </button>
                  </div>
                </>
              )}

              {importError && (
                <p style={{ color: '#d32f2f', fontSize: '12px', marginBottom: '8px' }}>{importError}</p>
              )}
              {importSuccess && (
                <p style={{ color: '#2e7d32', fontSize: '12px', marginBottom: '8px' }}>{importSuccess}</p>
              )}
              
              {importMode === 'type' && (
                <button
                  onClick={handleImportTicket}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Importer billett
                </button>
              )}
            </div>
          </nav>
        )}

        {/* Billetter og betaling */}
        <nav aria-labelledby="tickets-title" className="section">
          <h2 id="tickets-title" className="section-title">Billetter og betaling</h2>
          <ul className="list list--grouped" role="list">
            {token && (
              <li>
                <a href="/ticket-history" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/ticket-history'); }}>
                  <span className="li-title">Billett­historikk</span>
                </a>
              </li>
            )}
            <li>
              <a href="/pickup-ticket" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/pickup-ticket'); }}>
                <span className="li-title">Hent billett</span>
              </a>
            </li>
            {token && (
              <li>
                <a href="/payment-methods" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/payment-methods'); }}>
                  <span className="li-title">Betalingsmåter</span>
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Dine reiser */}
        <nav aria-labelledby="travel-title" className="section">
          <h2 id="travel-title" className="section-title">Dine reiser</h2>
          <ul className="list list--grouped" role="list">
            <li>
              <a href="/saved-trips" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/saved-trips'); }}>
                <span className="li-title">Lagrede reiser</span>
              </a>
            </li>
            <li>
              <a href="/favorites" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/favorites'); }}>
                <span className="li-title">Favoritter</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Hjelp og kontakt */}
        <nav aria-labelledby="help-title" className="section">
          <h2 id="help-title" className="section-title">Hjelp og informasjon</h2>
          <ul className="list list--grouped" role="list">
            <li>
              <a href="/help" className="list-item" onClick={(e) => { e.preventDefault(); navigate('/help'); }}>
                <span className="li-title">Hjelp og kontakt</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Logg ut */}
        {token && (
          <section className="section" id="logout-section">
            <button type="button" id="btn-logout" className="btn btn--danger btn--block" onClick={handleLogout}>
              Logg ut
            </button>
          </section>
        )}
      </main>

      <Footer />
    </section>
  );
}
