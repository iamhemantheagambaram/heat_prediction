import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

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

      setLocation(newLoc);

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

// 🔥 HEAT LAYER
const HeatLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heat = L.heatLayer(points, {
      radius: 100,
      blur: 60,
      maxZoom: 17,
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null;
};

const MapComponent = ({ lat, lon, setLocation: setParentLocation }) => {
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [heatPoints, setHeatPoints] = useState([]);

  useEffect(() => {
    if (lat && lon) {
      setLocation({ lat, lon });
    }
  }, [lat, lon]);

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

  // 🔥 NEW HEATMAP LOGIC (ONLY CHANGE)
  useEffect(() => {
    if (!location) return;

    fetch("http://127.0.0.1:5000/api/heatmap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(location)
    })
      .then(res => res.json())
      .then(data => {

        const formatted = [];

data.forEach(p => {
  const intensity = p.temp > 38 ? 1 : p.temp > 32 ? 0.7 : 0.4;

  formatted.push([p.lat, p.lon, intensity]);

  // 🔥 add surrounding spread
  formatted.push([p.lat + 0.005, p.lon + 0.005, intensity * 0.8]);
  formatted.push([p.lat - 0.005, p.lon - 0.005, intensity * 0.8]);
  formatted.push([p.lat + 0.01, p.lon, intensity * 0.6]);
});

        setHeatPoints(formatted);
      })
      .catch(() => {});

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
        center={[lat || 13.0827, lon || 80.2707]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        <ChangeView lat={lat} lon={lon} />

        <MapClickHandler
          setLocation={setLocation}
          setParentLocation={setParentLocation}
        />

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

        <HeatLayer points={heatPoints} />

      </MapContainer>
    </div>
  );
};

export default MapComponent;