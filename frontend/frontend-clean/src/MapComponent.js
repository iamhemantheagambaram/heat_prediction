import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";


// ✅ FIX DEFAULT MARKER ISSUE
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});


// 🖱 CLICK ANYWHERE FEATURE
function MapClickHandler({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({
        lat: e.latlng.lat,
        lon: e.latlng.lng
      });
    }
  });
  return null;
}


// 🎨 COLOR BASED ON RISK
const getColor = (risk) => {
  if (risk === "High") return "red";
  if (risk === "Medium") return "orange";
  return "green";
};


// 🌍 MAIN COMPONENT
const MapComponent = () => {
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  // 🔄 Reset result when new location
  useEffect(() => {
    setResult(null);
  }, [location]);

  // 🔥 FETCH BACKEND DATA
  useEffect(() => {
    if (!location) return;

    setLoading(true);

    fetch("http://127.0.0.1:5000/api/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(location)
    })
      .then(res => res.json())
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, [location]);

  // 🔍 SEARCH FUNCTION (INDUSTRY WAY)
  const searchLocation = async () => {
    if (!query) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );

      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        setLocation({ lat, lon });
      } else {
        alert("Location not found");
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
    }}>

      {/* 🔍 SEARCH BAR */}
      <div style={{
        padding: "10px",
        background: "#1e1e1e",
        display: "flex"
      }}>
        <input
          type="text"
          placeholder="Search any location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "none"
          }}
        />
        <button
          onClick={searchLocation}
          style={{
            marginLeft: "10px",
            padding: "10px 15px",
            background: "#ff5722",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      {/* 🗺 MAP */}
      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
      >

        {/* 🌍 Satellite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {/* 🏷 Labels */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        <MapClickHandler setLocation={setLocation} />

        {/* 📍 Marker */}
        {location && (
          <Marker position={[location.lat, location.lon]}>
            <Popup>
              <b>📍 Location</b><br />

              {loading ? (
                "⏳ Loading..."
              ) : result ? (
                <>
                  🌡 Temp: {result.temp}°C <br />
                  💧 Humidity: {result.humidity}% <br />
                  🌬 Wind: {result.wind} km/h <br />
                  🔥 Risk: <span style={{ color: getColor(result.risk) }}>
                    {result.risk}
                  </span>
                </>
              ) : "Click or search"}
            </Popup>
          </Marker>
        )}

      </MapContainer>

      {/* 📊 RESULT PANEL */}
      {result && (
        <div style={{
          padding: "15px",
          background: "#121212",
          color: "white"
        }}>
          <h3>📊 Heat Analysis</h3>

          <p>🌡 Temperature: {result.temp}°C</p>
          <p>🔥 Risk: <b style={{ color: getColor(result.risk) }}>
            {result.risk}
          </b></p>

          <h4>💡 Recommendations</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result.recommendation, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MapComponent;