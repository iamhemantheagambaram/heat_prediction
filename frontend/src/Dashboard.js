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
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            reject(error.message);
          }
        );
      }
    });
  };

  // 🔥 Fetch prediction using location
  const fetchPrediction = async () => {
    try {
      // 1️⃣ Get location
      const location = await getUserLocation();

      // 2️⃣ Send to backend
      const response = await fetch("http://127.0.0.1:5000/api/live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(location)
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const result = await response.json();

      console.log("Backend Response:", result);

      // 3️⃣ Map backend → frontend UI
      setData({
        temp: result.temp,
        humidity: result.humidity,
        wind: result.wind,
        risk: result.risk,
        recommendation: result.recommendation,
        prediction: result.risk
      });

      setLoading(false);

    } catch (err) {
      console.error(err);
      setError("Location or Backend error");
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