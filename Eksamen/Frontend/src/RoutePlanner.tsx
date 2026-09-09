import { useState } from "react";
import { buildApiUrl } from "./utils/config";

interface Route {
  from: string;
  to: string;
  durationMinutes: number;
  departureTime: string;
  arrivalTime: string;
  routeCode: string;
  routeName: string;
}

interface RouteResponse {
  itineraries?: Route[];
  error?: string;
}

export default function RoutePlanner() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<RouteResponse | null>(null);

  const handleSearch = async () => {
    try {
      const url = buildApiUrl(`api/route?from=${from}&to=${to}`);
      
      console.log('API URL:', url);
      
      const res = await fetch(url);
      const data: RouteResponse = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Route search error:', error);
      setResult({ error: 'Feil ved rutesøk' });
    }
  };

  return (
    <section style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Ruteplanlegger</h2>
      <input
        placeholder="Fra"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        style={{ marginRight: "1rem" }}
      />
      <input
        placeholder="Til"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <button onClick={handleSearch} style={{ marginLeft: "1rem" }}>
        Søk
      </button>

      {result && (
        <pre style={{ marginTop: "1rem", background: "#eee", padding: "1rem" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}
