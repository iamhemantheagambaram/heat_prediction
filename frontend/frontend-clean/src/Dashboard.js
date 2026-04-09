import { useState, useEffect } from "react";
import Chatbot from "./Chatbot";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showHeatMapPopup, setShowHeatMapPopup] = useState(false);
  const [showChatbotPopup, setShowChatbotPopup] = useState(false);
  const [location, setLocation] = useState(null);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude.toFixed(4),
            lon: position.coords.longitude.toFixed(4),
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
        recommendation: result.recommendation,
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

  let tempIcon = "🟢";
  if (data?.temp > 38) tempIcon = "🔴";
  else if (data?.temp > 30) tempIcon = "🟠";

  let humidityColor = "green";
  if (data?.humidity > 75) humidityColor = "blue";
  else if (data?.humidity > 50) humidityColor = "orange";

  let windColor = "green";
  if (data?.wind > 25) windColor = "red";
  else if (data?.wind > 10) windColor = "orange";

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        background: "#1e3a8a",
        minHeight: "100vh",
        padding: "20px 10px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "1400px",
          width: "100%",
          gap: "20px",
        }}
      >
        {/* Main Dashboard */}
        <div style={{ flex: 3 }}>
          {location && (
            <p style={{ color: "#d1d5db", fontSize: "16px" }}>
              📍 Current Location: Lat {location.lat}, Lon {location.lon}
            </p>
          )}

          {/* Four attribute cards */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
              marginTop: "25px",
            }}
          >
            {[{
              title: `${tempIcon} Temp`,
              value: data?.temp ? `${data.temp}°C` : "--",
              color: tempIcon === "🔴" ? "red" : tempIcon === "🟠" ? "orange" : "green"
            },
            {
              title: "💦 Humidity",
              value: data?.humidity ? `${data.humidity}%` : "--",
              color: humidityColor
            },
            {
              title: "🌀 Wind",
              value: data?.wind ? `${data.wind} km/h` : "--",
              color: windColor
            },
            {
              title: `${weatherIcon(data?.weather)} Weather`,
              value: data?.weather ? data.weather.charAt(0).toUpperCase() + data.weather.slice(1) : "--",
              color: "#d1d5db"
            }].map((item, index) => (
              <div key={index} style={{
                flex: 1,
                textAlign: "center",
                padding: "25px",
                background: "#3b82f6",
                borderRadius: "14px",
                minWidth: "0",
              }}>
                <h3 style={{ margin: "5px 0", fontSize: "22px" }}>{item.title}</h3>
                <p style={{ fontWeight: "bold", fontSize: "28px", color: item.color, margin: "5px 0" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div style={{
            marginTop: "25px",
            padding: "20px",
            background: "#3b82f6",
            borderRadius: "14px"
          }}>
            <h3 style={{ fontSize: "20px" }}>💡 Recommendations</h3>
            <p style={{ color: "#d1d5db", fontSize: "17px", lineHeight: "1.6" }}>
              {data?.recommendation
                ? data.recommendation
                : "Recommendations will be displayed here based on heat risk, weather conditions, and city insights."}
            </p>
          </div>

          {/* Climate Trend */}
          <div style={{
            marginTop: "25px",
            padding: "20px",
            background: "#3b82f6",
            borderRadius: "14px"
          }}>
            <h3 style={{ fontSize: "20px" }}>📈 Climate Trend (Next 7 Days)</h3>
            <p style={{ color: "#d1d5db", fontSize: "17px" }}>Graph will be displayed after data integration</p>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "25px" }}>
          <div
            style={{
              padding: "20px",
              background: "#3b82f6",
              borderRadius: "14px",
              cursor: "pointer"
            }}
            onClick={() => setShowHeatMapPopup(true)}
          >
            <h3 style={{ fontSize: "20px" }}>🗺 Heat Map</h3>
            <p style={{ color: "#d1d5db", fontSize: "16px" }}>
              Heat map details will be displayed here after backend integration.
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              background: "#3b82f6",
              borderRadius: "14px",
              cursor: "pointer"
            }}
            onClick={() => setShowChatbotPopup(true)}
          >
            <h3 style={{ fontSize: "20px" }}>🤖 AI Chatbot</h3>
            <p style={{ color: "#d1d5db", fontSize: "16px" }}>Click to open the chatbot assistant.</p>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showHeatMapPopup && (
        <div className="popup-overlay">
          <div className="popup-box-blue">
            <button className="close-btn" onClick={() => setShowHeatMapPopup(false)}>×</button>
            <h2>Heat Map Details</h2>
            <p style={{ color: "#fff", marginTop: "20px" }}>
              Heat map content from backend will appear here.
            </p>
          </div>
        </div>
      )}

      {showChatbotPopup && (
        <div className="popup-overlay">
          <div className="chatbot-popup-center">
            <button className="close-btn" onClick={() => setShowChatbotPopup(false)}>×</button>
            <div style={{ marginTop: "20px" }}>
              <Chatbot showHeader={false} showSendButton={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;