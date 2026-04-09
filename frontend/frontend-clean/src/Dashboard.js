import { useState, useEffect } from "react";
import UHIChatbot from "./UHIChatbot";
import MapComponent from "./MapComponent";
import ClimateTrend from "./ClimateTrend";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [showHeatMapPopup, setShowHeatMapPopup] = useState(false);
  const [showChatbotPopup, setShowChatbotPopup] = useState(false);

  const [location, setLocation] = useState(null);

  // ✅ dynamic location from map
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
            lon: position.coords.longitude,
          });
        },
        (error) => reject(error.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const fetchPrediction = async () => {
    try {
      const loc = await getUserLocation();

      const response = await fetch("http://127.0.0.1:5000/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loc),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Backend error");

      setData({
        temp: result.temp,
        humidity: result.humidity,
        wind: result.wind,
        risk: result.risk,
        recommendation: result.recommendation, // 🔥 object
        weather: result.weather,
      });

      setLocation(loc);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  // UI helpers
  let tempIcon = "🟢";
  if (data?.temp > 38) tempIcon = "🔴";
  else if (data?.temp > 30) tempIcon = "🟠";

  const weatherIcon = (type) => {
    switch (type) {
      case "sunny": return "🌞";
      case "cloudy": return "☁️";
      case "rain": return "🌧️";
      case "thunder": return "⚡";
      default: return "❓";
    }
  };

  return (
    <div style={{ display: "flex", width: "100%" }}>
      
      {/* LEFT SIDE */}
      <div style={{ flex: 3 }}>

        {location && (
          <p>📍 Lat {location.lat}, Lon {location.lon}</p>
        )}

        {/* Cards */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div className="card">
            <h3>{tempIcon} Temp</h3>
            <p>{data?.temp ?? "--"}°C</p>
          </div>
          <div className="card" style={{ marginTop: "20px" }}></div>
          <ClimateTrend
            lat={selectedLocation?.lat || location?.lat}
            lon={selectedLocation?.lon || location?.lon}
          />

          <div className="card">
            <h3>💧 Humidity</h3>
            <p>{data?.humidity ?? "--"}%</p>
          </div>

          <div className="card">
            <h3>🌬 Wind</h3>
            <p>{data?.wind ?? "--"} km/h</p>
          </div>

          <div className="card">
            <h3>{weatherIcon(data?.weather)} Weather</h3>
            <p>{data?.weather ?? "--"}</p>
          </div>
        </div>

        {/* MAP */}
        <div style={{ marginTop: "20px" }}>
          <MapComponent setLocation={setSelectedLocation} />
        </div>

        {/* 🔥 FIXED RECOMMENDATIONS */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>💡 Recommendations</h3>

          {data?.recommendation ? (
            <div className="recommendation-text">
              <p><b>👕 Clothing:</b> {data.recommendation.clothing}</p>
              <p><b>💧 Hydration:</b> {data.recommendation.hydration}</p>
              <p><b>🌤 Outdoor Advice:</b> {data.recommendation.outdoor_advice}</p>
            </div>
          ) : (
            <p>Waiting...</p>
          )}
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">

        <div className="card" onClick={() => setShowHeatMapPopup(true)}>
          <h3>🗺 Heat Map</h3>
        </div>

        <div className="card" onClick={() => setShowChatbotPopup(true)}>
          <h3>🤖 AI Chatbot</h3>
        </div>

      </div>

      {/* HEATMAP POPUP */}
      {showHeatMapPopup && (
        <div className="popup-overlay">
          <div className="popup-box-blue">
            <button className="close-btn" onClick={() => setShowHeatMapPopup(false)}>×</button>

            <MapComponent setLocation={setSelectedLocation} />
          </div>
        </div>
      )}

      {/* CHATBOT POPUP */}
      {showChatbotPopup && (
        <div className="popup-overlay">
          <div className="chatbot-popup-center">
            <button className="close-btn" onClick={() => setShowChatbotPopup(false)}>×</button>

            <UHIChatbot
              lat={selectedLocation?.lat}
              lon={selectedLocation?.lon}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;