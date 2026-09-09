import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../utils/config';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface HomeProps {
  onLogout?: () => void;
}

interface Route {
  from: string;
  to: string;
  durationMinutes: number;
  departureTime: string;
  arrivalTime: string;
  routeCode: string;
  routeName: string;
}

interface RouteSearchResponse {
  itineraries?: Route[];
  error?: string;
}

interface FavoriteTrip {
  id: number;
  from: string;
  to: string;
  routeCode: string;
}

interface Stop {
  name: string;
  municipality: string;
}

interface NearbyDeparture {
  routeCode: string;
  routeName: string;
  destination: string;
  departureTime: string;
  minutesUntil: number;
}

// Mapping of stop names to coordinates
const getStopCoordinates = (stopName: string): [number, number] | null => {
  const stopMap: Record<string, [number, number]> = {
    'Halden Bussterminal': [59.1289, 11.3875],
    'Halden Stasjon': [59.1289, 11.3875],
    'Halden Sentrum': [59.1289, 11.3875],
    'Sarpsborg Bussterminal': [59.2830, 11.1090],
    'Sarpsborg Stasjon': [59.2830, 11.1090],
    'Sarpsborg Sentrum': [59.2830, 11.1090],
    'Fredrikstad Bussterminal': [59.2167, 10.9500],
    'Fredrikstad Stasjon': [59.2167, 10.9500],
    'Fredrikstad Sentrum': [59.2167, 10.9500],
    'Moss Bussterminal': [59.4333, 10.6667],
    'Moss Stasjon': [59.4333, 10.6667],
    'Moss Sentrum': [59.4333, 10.6667],
    'Remmen Høgskole': [59.1289, 11.3875],
    'Skjeberg': [59.2500, 11.1000],
    'Tune': [59.2667, 11.0833],
    'Greåker': [59.2667, 11.0833],
    'Varteig': [59.2500, 11.1000],
    'Tistedal': [59.1167, 11.4000],
    'Berg': [59.1000, 11.3500],
    'Idd': [59.0500, 11.3000],
    'Rød': [59.0833, 11.3667],
    'Rokke': [59.0667, 11.3333],
    'Gressvik': [59.2000, 10.9167],
    'Onsøy': [59.2167, 10.9167],
    'Kråkerøy': [59.2167, 10.9500],
    'Rygge': [59.3833, 10.7500],
    'Rygge Stasjon': [59.3833, 10.7500],
    'Råde': [59.3500, 10.8000],
    'Rygge Flyplass': [59.3833, 10.7500],
  };

  // Try exact match first
  if (stopMap[stopName]) {
    return stopMap[stopName];
  }

  // Try case-insensitive match
  const lowerName = stopName.toLowerCase();
  for (const [key, coords] of Object.entries(stopMap)) {
    if (key.toLowerCase() === lowerName) {
      return coords;
    }
  }

  // Try partial match (e.g., "Halden" matches "Halden Bussterminal")
  for (const [key, coords] of Object.entries(stopMap)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return coords;
    }
  }

  return null;
};

// Component to update map center when it changes
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function Home(_props: HomeProps) {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteTrip[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<Stop[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Stop[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [nearbyDepartures, setNearbyDepartures] = useState<NearbyDeparture[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([59.1289, 11.3875]); // Default to Halden
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Fetch nearby departures on component mount and refresh every 30 seconds
  useEffect(() => {
    fetchNearbyDepartures();
    const interval = setInterval(() => {
      fetchNearbyDepartures();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        window.clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const searchStops = async (query: string, setSuggestions: (stops: Stop[]) => void) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const url = buildApiUrl(`api/stops/search?query=${encodeURIComponent(query)}`);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data: Stop[] = await res.json();
        setSuggestions(data.slice(0, 10)); // Limit to 10 suggestions
      } else {
        // Silently fail for stops search - don't show error to user
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching stops:', error);
      setSuggestions([]);
    }
  };

  const handleFromChange = (value: string) => {
    setFrom(value);
    setShowFromSuggestions(true);

    // Clear existing timeout
    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
    }

    // Debounce the search
    const timeout = window.setTimeout(() => {
      searchStops(value, setFromSuggestions);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleToChange = (value: string) => {
    setTo(value);
    setShowToSuggestions(true);

    // Clear route if "to" is cleared
    if (!value.trim()) {
      setToCoords(null);
      setRoutePolyline(null);
      // If "from" is still set, center on it
      if (from) {
        const fromCoordsValue = getStopCoordinates(from);
        if (fromCoordsValue) {
          setMapCenter(fromCoordsValue);
        }
      }
    }

    // Clear existing timeout
    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
    }

    // Debounce the search
    const timeout = window.setTimeout(() => {
      searchStops(value, setToSuggestions);
    }, 300);

    setSearchTimeout(timeout);
  };

  // Function to create route polyline with intermediate stops
  const updateRoutePolyline = (from: [number, number], to: [number, number]) => {
    // Create a simple polyline between from and to
    // In a real app, this would use actual route data with intermediate stops
    const polyline: [number, number][] = [from, to];
    setRoutePolyline(polyline);
    
    // Center map to show both points
    const centerLat = (from[0] + to[0]) / 2;
    const centerLon = (from[1] + to[1]) / 2;
    setMapCenter([centerLat, centerLon]);
  };

  const handleFromSelect = (stop: Stop) => {
    setFrom(stop.name);
    setFromSuggestions([]);
    setShowFromSuggestions(false);
    
    // Update map center to selected stop
    const coords = getStopCoordinates(stop.name);
    if (coords) {
      setMapCenter(coords);
      setFromCoords(coords);
      // If "to" is also set, update the route
      if (to) {
        const toCoordsValue = getStopCoordinates(to);
        if (toCoordsValue) {
          setToCoords(toCoordsValue);
          updateRoutePolyline(coords, toCoordsValue);
        }
      }
    }
  };

  const handleToSelect = (stop: Stop) => {
    setTo(stop.name);
    setToSuggestions([]);
    setShowToSuggestions(false);
    
    // Update map center to selected stop
    const coords = getStopCoordinates(stop.name);
    if (coords) {
      setToCoords(coords);
      // If "from" is also set, update the route
      if (from) {
        const fromCoordsValue = getStopCoordinates(from);
        if (fromCoordsValue) {
          setFromCoords(fromCoordsValue);
          updateRoutePolyline(fromCoordsValue, coords);
        }
      } else {
        // If only "to" is set, center on it
        setMapCenter(coords);
      }
    }
  };

  const handleFavoriteClick = (favorite: FavoriteTrip) => {
    setFrom(favorite.from);
    setTo(favorite.to);
    setSearchError('');
    setRoutes([]);
    
    // Update map coordinates
    const fromCoordsValue = getStopCoordinates(favorite.from);
    const toCoordsValue = getStopCoordinates(favorite.to);
    if (fromCoordsValue) {
      setFromCoords(fromCoordsValue);
    }
    if (toCoordsValue) {
      setToCoords(toCoordsValue);
      if (fromCoordsValue) {
        updateRoutePolyline(fromCoordsValue, toCoordsValue);
      }
    }
    
    // Automatically search for routes when a favorite is clicked
    // Pass values directly to avoid race conditions with state updates
    handleSearchRoutes(favorite.from, favorite.to);
  };

  const fetchFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/favorites/favorite-trips');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data: FavoriteTrip[] = await res.json();
        setFavorites(data);
      } else if (res.status === 403) {
        // User not authenticated - silently fail
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const fetchNearbyDepartures = async () => {
    setIsLoadingNearby(true);
    try {
      // Common destinations from Halden
      const destinations = ['Sarpsborg', 'Fredrikstad', 'Moss', 'Oslo', 'Skjeberg'];
      const allDepartures: NearbyDeparture[] = [];
      const now = new Date();

      // Fetch routes from Halden to each destination
      for (const destination of destinations) {
        try {
          const url = buildApiUrl(`api/route?from=${encodeURIComponent('Halden')}&to=${encodeURIComponent(destination)}`);
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (res.ok) {
            const data: RouteSearchResponse = await res.json();
            if (data.itineraries) {
              data.itineraries.forEach((route) => {
                const departureTime = new Date(route.departureTime);
                const minutesUntil = Math.floor((departureTime.getTime() - now.getTime()) / (1000 * 60));
                
                // Only include departures in the next 60 minutes
                if (minutesUntil >= 0 && minutesUntil <= 60) {
                  allDepartures.push({
                    routeCode: route.routeCode,
                    routeName: route.routeName,
                    destination: route.to,
                    departureTime: route.departureTime,
                    minutesUntil: minutesUntil,
                  });
                }
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching routes to ${destination}:`, error);
        }
      }

      // Sort by departure time (soonest first) and limit to 5
      allDepartures.sort((a, b) => a.minutesUntil - b.minutesUntil);
      setNearbyDepartures(allDepartures.slice(0, 5));
    } catch (error) {
      console.error('Error fetching nearby departures:', error);
      setNearbyDepartures([]);
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const handleSearchRoutes = async (fromValue?: string, toValue?: string) => {
    const searchFrom = fromValue ?? from;
    const searchTo = toValue ?? to;

    if (!searchFrom.trim() || !searchTo.trim()) {
      setSearchError('Vennligst fyll inn både fra og til');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setRoutes([]);

    try {
      const url = buildApiUrl(`api/route?from=${encodeURIComponent(searchFrom)}&to=${encodeURIComponent(searchTo)}`);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        setSearchError('Kunne ikke finne ruter');
        return;
      }

      const data: RouteSearchResponse = await res.json();

      if (data.itineraries) {
        setRoutes(data.itineraries);
        // Update route polyline when routes are found
        const fromCoordsValue = getStopCoordinates(searchFrom);
        const toCoordsValue = getStopCoordinates(searchTo);
        if (fromCoordsValue && toCoordsValue) {
          setFromCoords(fromCoordsValue);
          setToCoords(toCoordsValue);
          updateRoutePolyline(fromCoordsValue, toCoordsValue);
        }
      } else if (data.error) {
        setSearchError(data.error);
      } else {
        setSearchError('Kunne ikke finne ruter');
      }
    } catch (error) {
      console.error('Error searching routes:', error);
      setSearchError('Feil ved søk etter ruter');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!from.trim() || !to.trim()) {
      alert('Vennligst fyll inn både fra og til først');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/favorites/favorite-trip');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          from: from.trim(),
          to: to.trim(),
          routeCode: routes[0]?.routeCode || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Favoritt lagret');
        fetchFavorites(); // Refresh favorites list
      } else {
        alert('Kunne ikke lagre favoritt');
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
      alert('Feil ved lagring av favoritt');
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const handleRouteClick = async (route: Route) => {
    // Always navigate to ticket purchase - guest users can purchase tickets
    navigate('/ticket-purchase', {
      state: {
        route: route,
        from: route.from,
        to: route.to,
        departureTime: route.departureTime,
        routeCode: route.routeCode,
        routeName: route.routeName,
      },
    });
  };

  return (
    <main className="home">
      <section 
        className="map-placeholder" 
        style={{ position: 'relative', height: '300px', width: '100%' }}
      >
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '0.8rem', zIndex: 0 }}
            scrollWheelZoom={true}
            zoomControl={true}
            dragging={true}
            doubleClickZoom={true}
            boxZoom={true}
            keyboard={true}
            touchZoom={true}
            key={`${mapCenter[0]}-${mapCenter[1]}`}
          >
            <ChangeMapView center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Route polyline */}
            {routePolyline && routePolyline.length > 0 && (
              <Polyline
                positions={routePolyline}
                color="#007bff"
                weight={4}
                opacity={0.7}
              />
            )}
            {/* From marker */}
            {fromCoords && (
              <Marker position={fromCoords}>
                <Popup>
                  <strong>Fra:</strong> {from}
                </Popup>
              </Marker>
            )}
            {/* To marker */}
            {toCoords && (
              <Marker position={toCoords}>
                <Popup>
                  <strong>Til:</strong> {to}
                </Popup>
              </Marker>
            )}
            {/* Default marker if no from/to selected */}
            {!fromCoords && !toCoords && (
              <Marker position={mapCenter}>
                <Popup>
                  {from || to || 'Halden, Norge'}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          fontWeight: 600,
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          {from || to || 'Halden, Norge'}
        </div>
      </section>

      <section className="to-from">
        <h3>Hvor vil du reise?</h3>
        <section className="to-from-container" style={{ position: 'relative' }}>
          <section style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="search-field"
              placeholder="Fra"
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchRoutes()}
              onFocus={() => from.length >= 2 && setShowFromSuggestions(true)}
              onBlur={() => {
                // Delay hiding to allow click on suggestion
                setTimeout(() => setShowFromSuggestions(false), 200);
              }}
            />
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <ul
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  marginTop: '2px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  listStyle: 'none',
                  padding: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {fromSuggestions.map((stop, index) => (
                  <li
                    key={index}
                    onClick={() => handleFromSelect(stop)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <strong>{stop.name}</strong>
                    <br />
                    <small style={{ color: '#999' }}>{stop.municipality}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="search-field"
              placeholder="Til"
              value={to}
              onChange={(e) => handleToChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchRoutes()}
              onFocus={() => to.length >= 2 && setShowToSuggestions(true)}
              onBlur={() => {
                // Delay hiding to allow click on suggestion
                setTimeout(() => setShowToSuggestions(false), 200);
              }}
            />
            {showToSuggestions && toSuggestions.length > 0 && (
              <ul
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  marginTop: '2px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  listStyle: 'none',
                  padding: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {toSuggestions.map((stop, index) => (
                  <li
                    key={index}
                    onClick={() => handleToSelect(stop)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <strong>{stop.name}</strong>
                    <br />
                    <small style={{ color: '#999' }}>{stop.municipality}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
        <button 
          className="search-departures-btn"
          onClick={() => handleSearchRoutes()}
          disabled={isSearching}
        >
          {isSearching ? 'Søker...' : 'Finn avganger'}
        </button>
        
        {searchError && (
          <p style={{ color: 'red', marginTop: '10px' }}>{searchError}</p>
        )}

        {routes.length > 0 && (
          <section style={{ marginTop: '20px' }}>
            <h4>Funnet {routes.length} rute(r):</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {routes.map((route, index) => {
                const departureTime = new Date(route.departureTime);
                const now = new Date();
                const minutesUntil = Math.floor((departureTime.getTime() - now.getTime()) / (1000 * 60));
                
                return (
                  <li
                    key={index}
                    onClick={() => handleRouteClick(route)}
                    style={{
                      padding: '12px',
                      margin: '8px 0',
                      border: '1px solid #e8e8e8',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem' }}>{route.routeCode}</strong>
                        <span style={{ marginLeft: '8px', color: '#999' }}>{route.routeName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.9rem', color: '#999' }}>{route.from} → {route.to}</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#007bff' }}>
                            {minutesUntil <= 0 ? 'Nå' : `${minutesUntil} min`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#aaa' }}>
                      Avgang: {formatTime(route.departureTime)} • Ankomst: {formatTime(route.arrivalTime)} • {route.durationMinutes} min
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </section>

      <section className="nearby">
        <h3>I nærheten</h3>
        <section className="nearby-box">
          {isLoadingNearby ? (
            <p>Laster avganger...</p>
          ) : nearbyDepartures.length === 0 ? (
            <p>Ingen avganger i nærheten</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {nearbyDepartures.map((dep, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setFrom('Halden');
                    setTo(dep.destination);
                    handleSearchRoutes('Halden', dep.destination);
                  }}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    border: '1px solid #e8e8e8',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    backgroundColor: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{dep.routeCode}</strong>
                      <span style={{ marginLeft: '8px', color: '#999' }}>{dep.routeName}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', color: '#999' }}>Til {dep.destination}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#007bff' }}>
                        {dep.minutesUntil === 0 ? 'Nå' : `${dep.minutesUntil} min`}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#aaa' }}>
                    {formatTime(dep.departureTime)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      <section className="favorites">
        <h3>Favoritter</h3>
        <section className="favorites-box">
          {isLoadingFavorites ? (
            <p>Laster favoritter...</p>
          ) : favorites.length === 0 ? (
            <p>Ingen favoritter lagret</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {favorites.map((fav) => (
                <li 
                  key={fav.id} 
                  onClick={() => handleFavoriteClick(fav)}
                  style={{ 
                    padding: '10px', 
                    margin: '5px 0',
                    border: '1px solid #e8e8e8',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <strong>{fav.from}</strong> → <strong>{fav.to}</strong>
                  {fav.routeCode && <span> ({fav.routeCode})</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <button 
          className="search-departures-btn"
          onClick={handleSaveFavorite}
        >
          <i className="fas fa-plus"></i>
          <span>Legg til favoritt</span>
        </button>
        
      </section>
      

      <nav className="bottom-nav" aria-label="Hovedmeny">
        <ul>
          <li>
            <Link to="/home">
              <i className="fas fa-bus"></i>
              <span>Reiser</span>
            </Link>
          </li>
          <li>
            <Link to="/ticket">
              <i className="fas fa-ticket-alt"></i>
              <span>Billett</span>
            </Link>
          </li>
          <li>
            <Link to="/profile">
              <i className="fas fa-user"></i>
              <span>Profil</span>
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
