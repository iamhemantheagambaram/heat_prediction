import React, { useState, useEffect } from "react";
import UHIChatbot from "./UHIChatbot";
import MapComponent from "./MapComponent";
import ClimateTrend from "./ClimateTrend";
import "./App.css";
import Navbar from "./Navbar";

const Dashboard = ({ setLocationName }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [data, setData] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [search, setSearch] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);

  // 🌍 AUTO LOCATION
 useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      setSelectedLocation({ lat, lon });

      // 🔥 Get city name
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await res.json();

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Unknown location";

      console.log("SETTING CITY:", city);

        setLocationName(city);
      } catch (err) {
        console.error("Location name error:", err);
        setLocationName("Unknown location");
      }
    },
    () => {
      setSelectedLocation({ lat: 13.0827, lon: 80.2707 });
      setLocationName("Chennai"); // fallback
    }
  );
}, []);

  // 🌡 LIVE DATA
  useEffect(() => {
    if (!selectedLocation) return;

    fetch("http://127.0.0.1:5000/api/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedLocation),
    })
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("LIVE API ERROR:", err));
  }, [selectedLocation]);

  // 🔥 RECOMMENDATION
  useEffect(() => {
    if (!data || data.temp == null || data.wind == null) return;

    fetch("http://127.0.0.1:5000/predict_heat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature_2m_max: data.temp,
        temperature_2m_min: data.temp - 3,
        wind_speed_10m_max: data.wind,
      }),
    })
      .then((res) => res.json())
      .then((res) => setRecommendationData(res))
      .catch((err) => console.error("RECOMMENDATION ERROR:", err));
  }, [data]);

  // 🔍 SEARCH
  const handleSearch = async () => {
  if (!search) return;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
  );
  const data = await res.json();

  if (data.length > 0) {
    setSelectedLocation({
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    });

    // 🔥 Update navbar text instantly
    setLocationName(search);
  }
};

  // 🔥 TEMP STYLE
  const getTempStyle = (temp) => {
    if (temp >= 35) {
      return { label: "Hot", emoji: "🔥" };
    } else if (temp >= 25) {
      return { label: "Warm", emoji: "🌤️" };
    } else {
      return { label: "Cool", emoji: "❄️" };
    }
  };

  // 🌦 WEATHER LOGIC
  const getWeatherCondition = (temp, humidity) => {
    if (humidity > 75) return { text: "Rainy", emoji: "🌧️" };
    if (temp > 33) return { text: "Sunny", emoji: "☀️" };
    if (humidity > 50) return { text: "Cloudy", emoji: "☁️" };
    return { text: "Clear", emoji: "🌈" };
  };

  const getHumidityStyle = (humidity) => {
    if (humidity >= 75) {
      return { color: "#3b82f6", label: "High 💧" };
    } else if (humidity >= 50) {
      return { color: "#22c55e", label: "Normal 💦" };
    } else {
      return { color: "#f59e0b", label: "Low 🌵" };
    }
  };

  const getWindStyle = (wind) => {
    if (wind >= 20) {
      return { color: "#ef4444", label: "Strong 🌪️" };
    } else if (wind >= 10) {
      return { color: "#38bdf8", label: "Moderate 🌬️" };
    } else {
      return { color: "#22c55e", label: "Calm 🍃" };
    }
  };

  const getWeatherStyle = (weather) => {
    if (weather === "High") {
      return { color: "#ef4444", emoji: "🔥" };
    } else if (weather === "Medium") {
      return { color: "#facc15", emoji: "🌤️" };
    } else {
      return { color: "#22c55e", emoji: "☁️" };
    }
  };

  return (
    
    <div className="dashboard">

      {/* 🔍 SEARCH */}
      <div className="search-bar">
        <input
          placeholder="Search city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="main-layout">

        {/* LEFT */}
        <div className="left-section">

          {/* WEATHER CARDS */}
          <div className="cards-grid">

            {/* 🌡 TEMPERATURE */}
            <div className="card temp-card">
              <h3>🌡 Temperature</h3>

              {data ? (() => {
                const tempInfo = getTempStyle(data.temp);
                const weather = getWeatherCondition(data.temp, data.humidity);

                return (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                      padding: "10px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center"
                    }}
                  >
                    <p
                      style={{
                        fontSize: "22px",
                        fontWeight: "bold",
                        color:
                          data.temp >= 35
                            ? "#ef4444"
                            : data.temp >= 25
                            ? "#facc15"
                            : "#22c55e"
                      }}
                    >
                      {tempInfo.emoji} {data.temp}°C
                    </p>

                    <p
                      style={{
                        fontSize: "14px",
                        color:
                          data.temp >= 35
                            ? "#ef4444"
                            : data.temp >= 25
                            ? "#facc15"
                            : "#22c55e"
                      }}
                    >
                      {tempInfo.label} • {weather.emoji} {weather.text}
                    </p>
                  </div>
                );
              })() : "Loading..."}

            </div>

            {/* 💧 HUMIDITY */}
            <div className="card humidity-card">
              <h3>💧 Humidity</h3>
              {data ? (() => {
                const hum = getHumidityStyle(data.humidity);
                return (
                  <p style={{ color: hum.color, fontWeight: "bold" }}>
                    {data.humidity}% • {hum.label}
                  </p>
                );
              })() : "Loading..."}
            </div>

            {/* 🌬 WIND */}
            <div className="card wind-card">
              <h3>🌬 Wind</h3>
              {data ? (() => {
                const wind = getWindStyle(data.wind);
                return (
                  <p style={{ color: wind.color, fontWeight: "bold" }}>
                    {data.wind} km/h • {wind.label}
                  </p>
                );
              })() : "Loading..."}
            </div>

            {/* ☁️ WEATHER */}
            <div className="card weather-card">
              <h3>☁️ Weather</h3>
              {data ? (() => {
                const weather = getWeatherStyle(data.risk);
                return (
                  <p style={{ color: weather.color, fontWeight: "bold" }}>
                    {weather.emoji} {data.risk}
                  </p>
                );
              })() : "Loading..."}
            </div>

          </div>

          {/* RECOMMENDATION + GRAPH */}
          <div className="bottom-section">

            <div className="recommendation-card">
  <h3>💡 Recommendations</h3>

  {recommendationData ? (
    <>
      <div className="risk-badge">
        🔥 Risk: {recommendationData.heat_risk}
      </div>

      {/* HUMAN */}
      <div className="rec-section">
        <h4>👤 Human</h4>
        <div className="rec-list">
          {recommendationData.human_recommendations &&
          Object.keys(recommendationData.human_recommendations).length > 0 ? (
            Object.values(recommendationData.human_recommendations).map((val, i) => (
              <div key={i} className="rec-item">
                <span className="rec-icon">✅</span>
                <span>{val}</span>
              </div>
            ))
          ) : (
            <p className="no-rec">No human recommendations</p>
          )}
        </div>
      </div>

      {/* ENVIRONMENT */}
      <div className="rec-section">
        <h4>🌍 Environment</h4>
        <div className="rec-list">
          {recommendationData.environment_recommendations &&
          Object.keys(recommendationData.environment_recommendations).length > 0 ? (
            Object.values(recommendationData.environment_recommendations).map((val, i) => (
              <div key={i} className="rec-item env">
                <span className="rec-icon">🌱</span>
                <span>{val}</span>
              </div>
            ))
          ) : (
            <p className="no-rec">No environment recommendations</p>
          )}
        </div>
      </div>
    </>
  ) : (
    <p>Loading recommendations...</p>
  )}
</div>
  
              <div className="chart-container">
                <ClimateTrend
                  lat={selectedLocation?.lat}
                  lon={selectedLocation?.lon}
                />
              </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="right-section">

          <div className="map-container-box">
            <div className="map-box">
              {selectedLocation && (
                <MapComponent
                  lat={selectedLocation?.lat}
                  lon={selectedLocation?.lon}
                  setLocation={setSelectedLocation}
                />
              )}
          </div>
          </div>
          <div
            className="chatbot-trigger"
            onClick={() => setShowChatbot(true)}
          >
            🤖  AI Chatbot
          </div>

        </div>

      </div>

      {/* POPUP */}
      {showChatbot && (
        <div
          className="popup-overlay"
          onClick={() => setShowChatbot(false)}
        >
          <button
            className="popup-close-btn"
            onClick={() => setShowChatbot(false)}
          >
            ✕
          </button>

          <div
            className="chatbot-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <UHIChatbot
              lat={selectedLocation?.lat}
              lon={selectedLocation?.lon}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;