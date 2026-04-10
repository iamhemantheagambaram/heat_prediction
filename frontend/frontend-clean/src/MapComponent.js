import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// ✅ FIX DEFAULT MARKER ISSUE (KEEP THIS)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});

// 🔄 AUTO MOVE MAP WHEN LAT/LON CHANGES
const ChangeView = ({ lat, lon }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 14);
    }
  }, [lat, lon, map]);

  return null;
};

// 🖱 CLICK HANDLER (DO NOT TOUCH YOUR FLOW)
function MapClickHandler({ setLocation, setParentLocation }) {
  useMapEvents({
    click(e) {
      const newLoc = {
        lat: e.latlng.lat,
        lon: e.latlng.lng
      };

      // local state
      setLocation(newLoc);

      // update dashboard (IMPORTANT)
      if (setParentLocation) {
        setParentLocation(newLoc);
      }
    }
  });

  return null;
};

// 🎨 COLOR
const getColor = (risk) => {
  if (risk === "High") return "red";
  if (risk === "Medium") return "orange";
  return "green";
};

const MapComponent = ({ lat, lon, setLocation: setParentLocation }) => {
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔁 Sync with dashboard location (THIS PRESERVES YOUR AUTO GEO)
  useEffect(() => {
    if (lat && lon) {
      setLocation({ lat, lon });
    }
  }, [lat, lon]);

  // 🌡 OPTIONAL: fetch data for popup only (safe)
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

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden"
      }}
    >
      <MapContainer
        center={[lat || 13.0827, lon || 80.2707]} // fallback safe
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >

        {/* 🌍 MAP */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {/* 🏷 LABELS */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        {/* 🔄 AUTO MOVE */}
        <ChangeView lat={lat} lon={lon} />

        {/* 🖱 CLICK SUPPORT */}
        <MapClickHandler
          setLocation={setLocation}
          setParentLocation={setParentLocation}
        />

        {/* 📍 MARKER */}
        {location && (
          <Marker position={[location.lat, location.lon]}>
            <Popup>
              <b>📍 Selected Location</b><br />

              {loading ? (
                "⏳ Loading..."
              ) : result ? (
                <>
                  🌡 Temp: {result.temp}°C <br />
                  💧 Humidity: {result.humidity}% <br />
                  🌬 Wind: {result.wind} km/h <br />
                  🔥 Risk:{" "}
                  <span style={{ color: getColor(result.risk) }}>
                    {result.risk}
                  </span>
                </>
              ) : "Click on map"}
            </Popup>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
};

export default MapComponent;