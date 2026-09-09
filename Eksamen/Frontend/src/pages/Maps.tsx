import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Footer from '../components/Footer';
import { buildApiUrl } from '../utils/config';
import './Maps.css';

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface BusPosition {
  busId: number;
  latitude: number;
  longitude: number;
  route: string;
  status: string;
}

function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function Maps() {
  const location = useLocation();
  const route = location.state?.route || null;
  const from = location.state?.from || '';
  const to = location.state?.to || '';
  const routeCode = route?.routeCode || location.state?.routeCode || '633';
  
  const [busPositions, setBusPositions] = useState<BusPosition[]>([]);
  const [isLoadingBuses, setIsLoadingBuses] = useState(false);
  const [departures, setDepartures] = useState<any[]>([]);
  const [mapCenter] = useState<[number, number]>([59.1289, 11.3875]); // Default to Halden
  const [notificationMinutes, setNotificationMinutes] = useState(5);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);

  useEffect(() => {
    fetchBusPositions();
    fetchDepartures();
    // Refresh bus positions every 10 seconds
    const interval = setInterval(() => {
      fetchBusPositions();
    }, 10000);
    return () => clearInterval(interval);
  }, [routeCode]);

  const fetchBusPositions = async () => {
    setIsLoadingBuses(true);
    try {
      // Fetch buses for the route - in a real app, you'd get all buses for the route
      // For now, we'll try to fetch a few bus IDs (1-5) as an example
      const positions: BusPosition[] = [];
      for (let busId = 1; busId <= 5; busId++) {
        try {
          const url = buildApiUrl(`api/realtime/bus/${busId}`);
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (res.ok) {
            const data = await res.json();
            // Only show buses on the current route
            if (data.route === routeCode || !routeCode) {
              positions.push(data);
            }
          }
        } catch (error) {
          // Bus not found or error - continue
        }
      }
      setBusPositions(positions);
    } catch (error) {
      console.error('Error fetching bus positions:', error);
    } finally {
      setIsLoadingBuses(false);
    }
  };

  const fetchDepartures = async () => {
    try {
      // Mock departures - in a real app, fetch from API
      const mockDepartures = [
        { time: '14:20', bus: routeCode, destination: to || 'Kalnes', stopId: 1 },
        { time: '14:40', bus: routeCode, destination: to || 'Kalnes', stopId: 1 },
        { time: '15:00', bus: routeCode, destination: to || 'Kalnes', stopId: 1 },
        { time: '15:20', bus: routeCode, destination: to || 'Kalnes', stopId: 1 },
      ];
      setDepartures(mockDepartures);
    } catch (error) {
      console.error('Error fetching departures:', error);
    }
  };

  const handleSetNotification = async (stopId: number) => {
    setSelectedStopId(stopId);
    setShowNotificationDialog(true);
  };

  const confirmNotification = async () => {
    if (!selectedStopId) return;
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl('api/realtime/notification');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          stopId: selectedStopId,
          routeCode: routeCode,
          minutesBefore: notificationMinutes,
        }),
      });

      if (res.ok) {
        alert(`Varsel satt! Du vil få varsel ${notificationMinutes} minutter før bussen ankommer.`);
        setShowNotificationDialog(false);
      } else {
        alert('Kunne ikke sette varsel. Prøv igjen.');
      }
    } catch (error) {
      console.error('Error setting notification:', error);
      alert('Feil ved setting av varsel.');
    }
  };

  return (
    <section className="journey-details-page">
      <section className="map-container" style={{ height: '400px', width: '100%', position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          scrollWheelZoom={true}
        >
          <ChangeMapView center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Bus positions */}
          {busPositions.map((bus) => (
            <Marker
              key={bus.busId}
              position={[bus.latitude, bus.longitude]}
              icon={busIcon}
            >
              <Popup>
                <div>
                  <strong>Buss {bus.busId}</strong><br />
                  Rute: {bus.route}<br />
                  Status: {bus.status}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {isLoadingBuses && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'white', padding: '8px', borderRadius: '4px' }}>
            Laster busser...
          </div>
        )}
      </section>

      <section className="journey-info">
        <h2 className="location-name">{from || 'Remmen'}</h2>
        <h3 className="departures-title">Avganger</h3>
        
        <section className="departures-list">
          {departures.map((dep, index) => (
            <section key={index} className="departure-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <section className="bus-number">{dep.bus}</section>
                <section className="departure-info">
                  <span className="destination">{dep.destination}</span>
                  <span className="time">{dep.time}</span>
                </section>
              </div>
              <button
                onClick={() => handleSetNotification(dep.stopId)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🔔 Varsel
              </button>
            </section>
          ))}
        </section>
      </section>

      {showNotificationDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3>Sett varsel for bussankomst</h3>
            <p>Hvor mange minutter før bussen ankommer vil du ha varsel?</p>
            <select
              value={notificationMinutes}
              onChange={(e) => setNotificationMinutes(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value={1}>1 minutt</option>
              <option value={2}>2 minutter</option>
              <option value={5}>5 minutter</option>
              <option value={10}>10 minutter</option>
              <option value={15}>15 minutter</option>
            </select>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNotificationDialog(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Avbryt
              </button>
              <button
                onClick={confirmNotification}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sett varsel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </section>
  );
}

