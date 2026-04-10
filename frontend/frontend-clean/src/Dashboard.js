import React, { useState, useEffect } from "react";
import UHIChatbot from "./UHIChatbot";
import MapComponent from "./MapComponent";
import ClimateTrend from "./ClimateTrend";
import "./App.css";

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [data, setData] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [search, setSearch] = useState("");

  // 🌍 AUTO LOCATION (UNCHANGED)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        setSelectedLocation({ lat: 13.0827, lon: 80.2707 });
      }
    );
  }, []);

  // 🌡 LIVE DATA
  useEffect(() => {
    if (!selectedLocation) return;

    fetch("http://127.0.0.1:5000/api/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedLocation),
    })
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [selectedLocation]);

  // 🔥 RECOMMENDATION FIX
  useEffect(() => {
    if (!data || !data.temp || !data.wind) return;

    fetch("http://127.0.0.1:5000/predict_heat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        temperature_2m_max: data.temp,
        temperature_2m_min: data.temp - 3,
        wind_speed_10m_max: data.wind,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("Recommendation:", res);
        setRecommendationData(res);
      });
  }, [data]);

  // 🔍 GLOBAL SEARCH (controls everything)
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
    }
  };

  return (
    <div className="dashboard">

      {/* 🔍 SEARCH BAR */}
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

          <div className="cards-grid">

            <div className="card">
              <h3>🌡 Temperature</h3>
              <p>{data ? `${data.temp}°C` : "Loading..."}</p>
            </div>

            <div className="card">
              <h3>💧 Humidity</h3>
              <p>{data ? `${data.humidity}%` : "Loading..."}</p>
            </div>

            <div className="card">
              <h3>🌬 Wind</h3>
              <p>{data ? `${data.wind} km/h` : "Loading..."}</p>
            </div>

            <div className="card">
              <h3>☁️ Weather</h3>
              <p>{data ? data.risk : "Loading..."}</p>
            </div>

          </div>

          <ClimateTrend
            lat={selectedLocation?.lat}
            lon={selectedLocation?.lon}
          />

          {/* 💡 RECOMMENDATIONS */}
          <div className="recommendation-card">
            <h3>💡 Recommendations</h3>

            {recommendationData ? (
              <>
                <p className="risk">
                  🔥 Risk: {recommendationData.heat_risk}
                </p>

                <div className="rec-section">
                  <h4>👤 Human</h4>
                  {Object.values(
                    recommendationData.human_recommendations
                  ).map((val, i) => (
                    <div key={i} className="rec-item">✅ {val}</div>
                  ))}
                </div>

                <div className="rec-section">
                  <h4>🌍 Environment</h4>
                  {Object.values(
                    recommendationData.environment_recommendations
                  ).map((val, i) => (
                    <div key={i} className="rec-item">🌱 {val}</div>
                  ))}
                </div>
              </>
            ) : "Loading..."}
          </div>

        </div>

        {/* RIGHT */}
        <div className="right-section">

          <div className="map-box">
            <MapComponent
              lat={selectedLocation?.lat}
              lon={selectedLocation?.lon}
              setLocation={setSelectedLocation}
            />
          </div>

          <div className="chatbot-box">
            <UHIChatbot
              lat={selectedLocation?.lat}
              lon={selectedLocation?.lon}
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;