import { useState, useEffect } from "react";
import WeatherCards from "./WeatherCards";
import Chatbot from "./Chatbot";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📍 Get user location
  const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("📍 Location fetched:", position.coords);

        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.error("❌ Location error:", error);
        reject(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

const fetchPrediction = async () => {
  try {
    console.log("🚀 Fetch started");

    const location = await getUserLocation();
    console.log("📍 Sending location:", location);

    const response = await fetch("http://127.0.0.1:5000/api/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(location)
    });

    console.log("📡 Response status:", response.status);

    const result = await response.json();
    console.log("✅ Backend Response:", result);

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
    console.error("🔥 ERROR:", err);
    setError(err.message);
    setLoading(false);
  }
};

  // 🚀 Run on page load
  useEffect(() => {
    fetchPrediction();
  }, []);

  return (
    <div style={{ display: "flex", width: "100%" }}>
      
      {/* LEFT SIDE */}
      <div className="dashboard">

        {/* Weather Cards */}
        <WeatherCards data={data} />

        {/* Areas */}
        <div className="card">
          <h3>Areas in Chennai</h3>
          <p>📍 Anna Nagar</p>
          <p>📍 T Nagar</p>
          <p>📍 Velachery</p>
          <p>📍 Adyar</p>
        </div>

        {/* Heat Map */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Chennai - Heat Zones</h3>
          <p style={{ color: "#aaa" }}>
            Map will be displayed after backend integration
          </p>
        </div>

        {/* Climate Graph */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Climate Trend (Next 7 Days)</h3>
          <p style={{ color: "#aaa" }}>
            Graph will be displayed after data integration
          </p>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">

        {/* Area Dashboard */}
        <div className="card">
          <h3>Area Dashboard</h3>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <>
              <p>Heat Risk: {data?.risk}</p>
            </>
          )}
        </div>

        {/* Solutions */}
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

        {/* Chatbot */}
        <Chatbot />

      </div>

    </div>
  );
}

export default Dashboard;