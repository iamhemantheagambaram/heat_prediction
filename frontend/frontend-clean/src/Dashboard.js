import { useState, useEffect } from "react";
import WeatherCards from "./WeatherCards";
import UHIChatbot from "./UHIChatbot";
import MapComponent from "./MapComponent";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [heatData, setHeatData] = useState([]);

  // ✅ NO DEFAULT LOCATION
  const [selectedLocation, setSelectedLocation] = useState(null);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => reject(error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const fetchPrediction = async () => {
    try {
      const location = await getUserLocation();

      const response = await fetch("http://127.0.0.1:5000/api/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(location)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Backend error");
      }

      setData({
        temp: result.temp,
        humidity: result.humidity,
        wind: result.wind,
        risk: result.risk,
        recommendation: result.recommendation
      });

      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchHeatMap = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/predict-all");
      const data = await res.json();
      setHeatData(data);
    } catch (err) {
      console.error("Heatmap error:", err);
    }
  };

  useEffect(() => {
    fetchPrediction();
    fetchHeatMap();
  }, []);

  return (
    <div style={{ display: "flex", width: "100%" }}>
      
      {/* LEFT SIDE */}
      <div className="dashboard">

        <WeatherCards data={data} />

        <div className="card">
          <h3>Areas in Chennai</h3>
          <p>📍 Anna Nagar</p>
          <p>📍 T Nagar</p>
          <p>📍 Velachery</p>
          <p>📍 Adyar</p>
        </div>

        {/* MAP */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Chennai - Heat Zones</h3>

          <MapComponent setLocation={setSelectedLocation} />
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Climate Trend (Next 7 Days)</h3>
          <p style={{ color: "#aaa" }}>
            Graph will be displayed after data integration
          </p>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">

        <div className="card">
          <h3>Area Dashboard</h3>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <p>Heat Risk: {data?.risk}</p>
          )}
        </div>

        <div className="card" style={{ marginTop: "15px" }}>
          <h3>Solutions</h3>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(data?.recommendation, null, 2)}
            </pre>
          )}
        </div>

        {/* ✅ CHATBOT (SAFE + DYNAMIC) */}
        <UHIChatbot
          lat={selectedLocation?.lat}
          lon={selectedLocation?.lon}
        />

      </div>
    </div>
  );
}

export default Dashboard;