import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './Settings.css';

interface User {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  roles?: string[];
}

interface Route {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

interface Stats {
  totalUsers: number;
  totalTickets: number;
  totalRoutes: number;
  activeBuses: number;
  revenue: number;
}

const ROLE_NAMES: Record<string, string> = {
  'ADMINISTRATOR': 'Administratorer',
  'ADMIN': 'Administratorer',
  'ANSATT': 'Ansatte',
  'EMP': 'Ansatte',
  'VANLIG_BRUKER': 'Vanlige brukere',
  'USER': 'Vanlige brukere',
  'UTVIKLER': 'Utviklere',
  'DEV': 'Utviklere',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'routes' | 'buses'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Ikke autentisert');
        return;
      }

      if (activeTab === 'stats') {
        const url = buildApiUrl('api/admin/stats');
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else if (res.status === 403) {
          setError('Ingen tilgang. Du må være administrator.');
        }
      } else if (activeTab === 'users') {
        const url = buildApiUrl('api/admin/users');
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else if (res.status === 403) {
          setError('Ingen tilgang. Du må være administrator.');
        }
      } else if (activeTab === 'routes') {
        const url = buildApiUrl('api/admin/routes');
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setRoutes(data);
        } else if (res.status === 403) {
          setError('Ingen tilgang. Du må være administrator.');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Feil ved henting av data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page-settings">
      <header className="appbar" role="banner" aria-label="Toppmeny">
        <a className="backlink" href="/home" onClick={(e) => { e.preventDefault(); navigate('/home'); }}>
          Hjem
        </a>
        <h1 className="appbar__title">Admin Dashboard</h1>
        <span className="appbar__spacer" aria-hidden="true"></span>
      </header>

      <main className="container">
        {error && (
          <div style={{ padding: '16px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <section className="tabs" role="tablist" style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #ddd' }}>
          <button
            role="tab"
            aria-selected={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === 'stats' ? '#007bff' : 'transparent',
              color: activeTab === 'stats' ? 'white' : '#333',
              cursor: 'pointer',
              borderBottom: activeTab === 'stats' ? '2px solid #007bff' : '2px solid transparent'
            }}
          >
            Statistikk
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === 'users' ? '#007bff' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#333',
              cursor: 'pointer',
              borderBottom: activeTab === 'users' ? '2px solid #007bff' : '2px solid transparent'
            }}
          >
            Brukere
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'routes'}
            onClick={() => setActiveTab('routes')}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === 'routes' ? '#007bff' : 'transparent',
              color: activeTab === 'routes' ? 'white' : '#333',
              cursor: 'pointer',
              borderBottom: activeTab === 'routes' ? '2px solid #007bff' : '2px solid transparent'
            }}
          >
            Ruter
          </button>
        </section>

        {/* Content */}
        {isLoading ? (
          <p>Laster...</p>
        ) : activeTab === 'stats' && stats ? (
          <section>
            <h2>Systemstatistikk</h2>
            <ul className="list list--grouped">
              <li>
                <div className="list-item">
                  <span className="label">Totalt antall brukere</span>
                  <span className="meta">{stats.totalUsers}</span>
                </div>
              </li>
              <li>
                <div className="list-item">
                  <span className="label">Totalt antall billetter</span>
                  <span className="meta">{stats.totalTickets}</span>
                </div>
              </li>
              <li>
                <div className="list-item">
                  <span className="label">Totalt antall ruter</span>
                  <span className="meta">{stats.totalRoutes}</span>
                </div>
              </li>
              <li>
                <div className="list-item">
                  <span className="label">Aktive busser</span>
                  <span className="meta">{stats.activeBuses}</span>
                </div>
              </li>
              <li>
                <div className="list-item">
                  <span className="label">Omsetning</span>
                  <span className="meta">{stats.revenue / 100} kr</span>
                </div>
              </li>
            </ul>
          </section>
        ) : activeTab === 'users' ? (
          <section>
            <h2>Brukeradministrasjon</h2>
            {users.length === 0 ? (
              <p>Ingen brukere funnet</p>
            ) : (() => {
              // Group users by their PRIMARY role only (each user appears in one group)
              // Priority: ADMINISTRATOR > ADMIN > ANSATT > EMP > UTVIKLER > DEV > VANLIG_BRUKER > USER
              const rolePriority: Record<string, number> = {
                'ADMINISTRATOR': 1,
                'ADMIN': 2,
                'ANSATT': 3,
                'EMP': 4,
                'UTVIKLER': 5,
                'DEV': 6,
                'VANLIG_BRUKER': 7,
                'USER': 8
              };
              
              const usersByRole: Record<string, User[]> = {};
              
              users.forEach((user) => {
                const roles = user.roles || [];
                let primaryRole = 'VANLIG_BRUKER'; // Default role
                
                if (roles.length > 0) {
                  // Find the role with highest priority (lowest number)
                  primaryRole = roles.reduce((prev, current) => {
                    const prevPriority = rolePriority[prev] || 999;
                    const currentPriority = rolePriority[current] || 999;
                    return currentPriority < prevPriority ? current : prev;
                  });
                }
                
                if (!usersByRole[primaryRole]) {
                  usersByRole[primaryRole] = [];
                }
                usersByRole[primaryRole].push(user);
              });
              
              // Define role order
              const roleOrder = ['ADMINISTRATOR', 'ADMIN', 'ANSATT', 'EMP', 'UTVIKLER', 'DEV', 'VANLIG_BRUKER', 'USER'];
              
              return (
                <ul className="list list--grouped">
                  {roleOrder.map((roleCode) => {
                    const roleUsers = usersByRole[roleCode];
                    if (!roleUsers || roleUsers.length === 0) return null;
                    
                    const roleName = ROLE_NAMES[roleCode] || roleCode;
                    const isExpanded = expandedRoles.has(roleCode);
                    
                    return (
                      <li key={roleCode}>
                        <div 
                          className="list-item" 
                          onClick={() => {
                            const newExpanded = new Set(expandedRoles);
                            if (isExpanded) {
                              newExpanded.delete(roleCode);
                            } else {
                              newExpanded.add(roleCode);
                            }
                            setExpandedRoles(newExpanded);
                          }}
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? '#f0f0f0' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div>
                              <span className="label" style={{ fontWeight: '600' }}>
                                {roleName}
                              </span>
                              <span className="meta" style={{ display: 'block', fontSize: '12px', color: '#666' }}>
                                {roleUsers.length} {roleUsers.length === 1 ? 'bruker' : 'brukere'}
                              </span>
                            </div>
                            <span style={{ fontSize: '18px', color: '#666' }}>
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                        {isExpanded && (
                          <ul className="list" style={{ marginLeft: '16px', marginTop: '8px', borderLeft: '2px solid #ddd', paddingLeft: '16px' }}>
                            {roleUsers.map((user) => (
                              <li key={user.id} style={{ marginBottom: '8px' }}>
                                <div 
                                  className="list-item" 
                                  style={{ padding: '8px', cursor: 'pointer' }}
                                  onClick={() => navigate(`/admin/users/${user.id}`)}
                                >
                                  <div>
                                    <span className="label" style={{ fontSize: '14px' }}>{user.fullName}</span>
                                    <span className="meta" style={{ display: 'block', fontSize: '12px', color: '#666' }}>
                                      {user.email} • {user.isActive ? 'Aktiv' : 'Inaktiv'}
                                      {user.roles && user.roles.length > 0 && (
                                        <span> • Roller: {user.roles.join(', ')}</span>
                                      )}
                                    </span>
                                  </div>
                                  <span className="chevron" aria-hidden="true">›</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </section>
        ) : activeTab === 'routes' ? (
          <section>
            <h2>Ruteadministrasjon</h2>
            {routes.length === 0 ? (
              <p>Ingen ruter funnet</p>
            ) : (
              <ul className="list list--grouped">
                {routes.map((route) => (
                  <li key={route.id}>
                    <div className="list-item">
                      <div>
                        <span className="label">{route.name}</span>
                        <span className="meta" style={{ display: 'block', fontSize: '12px', color: '#666' }}>
                          {route.code} • {route.active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </main>

      <Footer />
    </section>
  );
}


