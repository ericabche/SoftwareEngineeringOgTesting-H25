import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './Settings.css';

interface User {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  roles?: string[];
  createdAt?: string;
}

interface Ticket {
  id: number;
  user_id: number;
  departure_id: number;
  qr_code_hash: string;
  purchased_at: string;
  fare: string;
  price_cents: number;
  state: string;
}

const ROLE_NAMES: Record<string, string> = {
  'ADMINISTRATOR': 'Administrator',
  'ADMIN': 'Administrator',
  'ANSATT': 'Ansatt',
  'EMP': 'Ansatt',
  'VANLIG_BRUKER': 'Vanlig bruker',
  'USER': 'Vanlig bruker',
  'UTVIKLER': 'Utvikler',
  'DEV': 'Utvikler',
};

const AVAILABLE_ROLES = ['ADMINISTRATOR', 'ANSATT', 'UTVIKLER', 'VANLIG_BRUKER'];

export default function AdminUserProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  
  // Form states
  const [showChangeFullName, setShowChangeFullName] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showGiveTicket, setShowGiveTicket] = useState(false);
  const [ticketFareType, setTicketFareType] = useState('ADULT');
  const [ticketPriceCents, setTicketPriceCents] = useState(4000);

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Ikke autentisert');
        return;
      }

      // Fetch user details
      const userUrl = buildApiUrl(`api/admin/users/${id}`);
      const userRes = await fetch(userUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        setNewEmail(userData.email);
        setNewFullName(userData.fullName);
        if (userData.roles && userData.roles.length > 0) {
          setSelectedRole(userData.roles[0]);
        }
      } else {
        setError('Kunne ikke hente brukerdata');
      }

      // Fetch user tickets
      const ticketsUrl = buildApiUrl(`api/admin/users/${id}/tickets`);
      const ticketsRes = await fetch(ticketsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Feil ved henting av brukerdata');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeFullName = async () => {
    if (!id || !newFullName || newFullName.trim().length === 0) {
      setResult('Fullt navn kan ikke være tomt');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/admin/users/${id}/fullname`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: newFullName.trim() }),
      });

      if (res.ok) {
        setResult('Fullt navn oppdatert');
        setShowChangeFullName(false);
        fetchUserData();
      } else {
        const data = await res.json();
        setResult(data.message || 'Kunne ikke oppdatere fullt navn');
      }
    } catch (error) {
      setResult('Feil ved oppdatering av fullt navn');
    }
  };

  const handleChangeEmail = async () => {
    if (!id || !newEmail) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/admin/users/${id}/email`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (res.ok) {
        setResult('E-post oppdatert');
        setShowChangeEmail(false);
        fetchUserData();
      } else {
        const data = await res.json();
        setResult(data.message || 'Kunne ikke oppdatere e-post');
      }
    } catch (error) {
      setResult('Feil ved oppdatering av e-post');
    }
  };

  const handleChangePassword = async () => {
    if (!id || !newPassword || newPassword.length < 6) {
      setResult('Passord må være minst 6 tegn');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/admin/users/${id}/password`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        setResult('Passord oppdatert');
        setShowChangePassword(false);
        setNewPassword('');
      } else {
        const data = await res.json();
        setResult(data.message || 'Kunne ikke oppdatere passord');
      }
    } catch (error) {
      setResult('Feil ved oppdatering av passord');
    }
  };

  const handleChangeRole = async () => {
    if (!id || !selectedRole) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/admin/users/${id}/role`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleCode: selectedRole }),
      });

      if (res.ok) {
        setResult('Rolle oppdatert');
        setShowChangeRole(false);
        fetchUserData();
      } else {
        const data = await res.json();
        setResult(data.message || 'Kunne ikke oppdatere rolle');
      }
    } catch (error) {
      setResult('Feil ved oppdatering av rolle');
    }
  };

  const handleDisableAccount = async () => {
    if (!id || !confirm('Er du sikker på at du vil deaktivere denne brukeren?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/admin/users/${id}/disable`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setResult('Bruker deaktivert');
        fetchUserData();
      } else {
        setResult('Kunne ikke deaktivere bruker');
      }
    } catch (error) {
      setResult('Feil ved deaktivering av bruker');
    }
  };

  const handleEnableAccount = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/admin/users/${id}/enable`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setResult('Bruker aktivert');
        fetchUserData();
      } else {
        setResult('Kunne ikke aktivere bruker');
      }
    } catch (error) {
      setResult('Feil ved aktivering av bruker');
    }
  };

  const handleDeleteAccount = async () => {
    if (!id || !confirm('Er du sikker på at du vil slette denne brukeren? Dette kan ikke angres!')) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/admin/users/${id}`);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Bruker slettet');
        navigate('/admin');
      } else {
        setResult('Kunne ikke slette bruker');
      }
    } catch (error) {
      setResult('Feil ved sletting av bruker');
    }
  };

  const handleGiveTicket = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`api/admin/users/${id}/ticket`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          departureId: 1,
          fareType: ticketFareType,
          priceCents: ticketPriceCents,
        }),
      });

      if (res.ok) {
        setResult('Billett gitt til bruker');
        setShowGiveTicket(false);
        fetchUserData();
      } else {
        const data = await res.json();
        setResult(data.message || 'Kunne ikke gi billett');
      }
    } catch (error) {
      setResult('Feil ved giving av billett');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nb-NO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getActiveTickets = () => {
    const now = new Date();
    return tickets.filter(ticket => {
      if (ticket.state === 'REFUNDED') return false;
      const purchasedAt = new Date(ticket.purchased_at);
      const validUntil = new Date(purchasedAt.getTime() + 90 * 60 * 1000); // 90 minutes
      return now < validUntil;
    });
  };

  if (isLoading) {
    return (
      <section className="page-settings">
        <header className="appbar" role="banner">
          <a className="backlink" href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
            Admin
          </a>
          <h1 className="appbar__title">Brukerprofil</h1>
        </header>
        <main className="container">
          <p>Laster...</p>
        </main>
        <Footer />
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="page-settings">
        <header className="appbar" role="banner">
          <a className="backlink" href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
            Admin
          </a>
          <h1 className="appbar__title">Brukerprofil</h1>
        </header>
        <main className="container">
          <p style={{ color: '#c00' }}>{error || 'Bruker ikke funnet'}</p>
        </main>
        <Footer />
      </section>
    );
  }

  const activeTickets = getActiveTickets();
  const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'VANLIG_BRUKER';

  return (
    <section className="page-settings">
      <header className="appbar" role="banner" aria-label="Toppmeny">
        <a className="backlink" href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
          Admin
        </a>
        <h1 className="appbar__title">Brukerprofil</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        {result && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: result.includes('oppdatert') || result.includes('gitt') || result.includes('aktivert') ? '#dfd' : '#fdd',
            color: result.includes('oppdatert') || result.includes('gitt') || result.includes('aktivert') ? '#060' : '#600',
            borderRadius: '4px', 
            marginBottom: '16px' 
          }}>
            {result}
          </div>
        )}

        {/* User Info */}
        <section className="settings-group">
          <h2 className="group-title">Brukerinformasjon</h2>
          <ul className="list list--grouped">
            <li>
              <div className="list-item">
                <span className="label">Fullt navn</span>
                <span className="meta">{user.fullName}</span>
              </div>
            </li>
            <li>
              <div className="list-item">
                <span className="label">E-post</span>
                <span className="meta">{user.email}</span>
              </div>
            </li>
            <li>
              <div className="list-item">
                <span className="label">Status</span>
                <span className="meta">{user.isActive ? 'Aktiv' : 'Deaktivert'}</span>
              </div>
            </li>
            <li>
              <div className="list-item">
                <span className="label">Rolle</span>
                <span className="meta">
                  {user.roles && user.roles.length > 0 
                    ? user.roles.map(r => ROLE_NAMES[r] || r).join(', ')
                    : 'Ingen rolle'}
                </span>
              </div>
            </li>
            {user.createdAt && (
              <li>
                <div className="list-item">
                  <span className="label">Opprettet</span>
                  <span className="meta">{formatDate(user.createdAt)}</span>
                </div>
              </li>
            )}
          </ul>
        </section>

        {/* Active Tickets */}
        <section className="settings-group">
          <h2 className="group-title">Aktive billetter</h2>
          {activeTickets.length === 0 ? (
            <p style={{ padding: '16px', color: '#666' }}>Ingen aktive billetter</p>
          ) : (
            <ul className="list list--grouped">
              {activeTickets.map((ticket) => (
                <li key={ticket.id}>
                  <div className="list-item">
                    <div>
                      <span className="label">Billett #{ticket.id}</span>
                      <span className="meta" style={{ display: 'block', fontSize: '12px', color: '#666' }}>
                        {ticket.fare} • {ticket.price_cents / 100} kr • {formatDate(ticket.purchased_at)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Actions */}
        <section className="settings-group">
          <h2 className="group-title">Handlinger</h2>
          <ul className="list list--grouped">
            <li>
              <button
                className="list-item"
                onClick={() => setShowChangeFullName(!showChangeFullName)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="label">Endre fullt navn</span>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
              {showChangeFullName && (
                <div style={{ padding: '16px', backgroundColor: '#f9f9f9', marginTop: '8px', borderRadius: '4px' }}>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Fullt navn"
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleChangeFullName}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Lagre
                    </button>
                    <button
                      onClick={() => { setShowChangeFullName(false); setNewFullName(user.fullName); }}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </li>
            <li>
              <button
                className="list-item"
                onClick={() => setShowChangeEmail(!showChangeEmail)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="label">Endre e-post</span>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
              {showChangeEmail && (
                <div style={{ padding: '16px', backgroundColor: '#f9f9f9', marginTop: '8px', borderRadius: '4px' }}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Ny e-post"
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleChangeEmail}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Lagre
                    </button>
                    <button
                      onClick={() => { setShowChangeEmail(false); setNewEmail(user.email); }}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </li>
            <li>
              <button
                className="list-item"
                onClick={() => setShowChangePassword(!showChangePassword)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="label">Endre passord</span>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
              {showChangePassword && (
                <div style={{ padding: '16px', backgroundColor: '#f9f9f9', marginTop: '8px', borderRadius: '4px' }}>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nytt passord (minst 6 tegn)"
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleChangePassword}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Lagre
                    </button>
                    <button
                      onClick={() => { setShowChangePassword(false); setNewPassword(''); }}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </li>
            <li>
              <button
                className="list-item"
                onClick={() => setShowChangeRole(!showChangeRole)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="label">Endre rolle</span>
                <span className="meta">{ROLE_NAMES[primaryRole] || primaryRole}</span>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
              {showChangeRole && (
                <div style={{ padding: '16px', backgroundColor: '#f9f9f9', marginTop: '8px', borderRadius: '4px' }}>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    {AVAILABLE_ROLES.map(role => (
                      <option key={role} value={role}>{ROLE_NAMES[role] || role}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleChangeRole}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Lagre
                    </button>
                    <button
                      onClick={() => { setShowChangeRole(false); if (user.roles && user.roles.length > 0) setSelectedRole(user.roles[0]); }}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </li>
            <li>
              <button
                className="list-item"
                onClick={() => setShowGiveTicket(!showGiveTicket)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span className="label">Gi billett</span>
                <span className="chevron" aria-hidden="true">›</span>
              </button>
              {showGiveTicket && (
                <div style={{ padding: '16px', backgroundColor: '#f9f9f9', marginTop: '8px', borderRadius: '4px' }}>
                  <select
                    value={ticketFareType}
                    onChange={(e) => setTicketFareType(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="ADULT">Voksen</option>
                    <option value="STUDENT">Student</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                  <input
                    type="number"
                    value={ticketPriceCents / 100}
                    onChange={(e) => setTicketPriceCents(parseInt(e.target.value) * 100)}
                    placeholder="Pris (kr)"
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleGiveTicket}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Gi billett
                    </button>
                    <button
                      onClick={() => { setShowGiveTicket(false); setTicketPriceCents(4000); setTicketFareType('ADULT'); }}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </li>
            <li>
              <button
                className="list-item"
                onClick={user.isActive ? handleDisableAccount : handleEnableAccount}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: user.isActive ? '#dc3545' : '#28a745' }}
              >
                <span className="label">{user.isActive ? 'Deaktiver konto' : 'Aktiver konto'}</span>
              </button>
            </li>
            <li>
              <button
                className="list-item"
                onClick={handleDeleteAccount}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}
              >
                <span className="label">Slett konto</span>
              </button>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </section>
  );
}

