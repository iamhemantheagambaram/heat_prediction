<<<<<<< HEAD
import { useState, useEffect } from "react";
import UHIChatbot from "./UHIChatbot";
import MapComponent from "./MapComponent";
import ClimateTrend from "./ClimateTrend";

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
=======
import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import "./App.css";
>>>>>>> 4fc7448 (frontend)

const Dashboard = () => {
  const [showHeatMapPopup, setShowHeatMapPopup] = useState(false);
  const [showChatbotPopup, setShowChatbotPopup] = useState(false);

  return (
    <div className="dashboard">
      {/* Left Panel */}
      <div className="left-panel">
        <div className="flex-attributes">
          <div className="attribute-card">
            <h3>🌡Current Temperature</h3>
            <p className="attribute-value temperature-value"></p>
          </div>
          <div className="card" style={{ marginTop: "20px" }}></div>
          <ClimateTrend
            lat={selectedLocation?.lat || location?.lat}
            lon={selectedLocation?.lon || location?.lon}
          />

          <div className="attribute-card">
            <h3>💧Humidity</h3>
            <p className="attribute-value humidity-value"></p>
          </div>

          <div className="attribute-card">
            <h3>🌬 Wind Speed</h3>
            <p className="attribute-value wind-value"></p>
          </div>

          <div className="attribute-card">
            <h3>☁️Weather</h3>
            <p className="attribute-value weather-value"></p>
          </div>
        </div>

        <div className="card large-card">
          <h3>💡Recommendations</h3>
          <div className="recommendation-text">
            Recommendations will appear after backend integration
          </div>
        </div>

        <div className="card large-card">
          <h3>📈Climate Trend (Next 7 Days)</h3>
          <div className="recommendation-text">
            Graph will be displayed after data integration
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        {/* Heat Map */}
        <div
          className="card side-card heatmap-card"
          onClick={() => setShowHeatMapPopup(true)}
        >
          <h3>🗺 Heat Map</h3>

          <div className="small-map-preview">
            <div className="small-map-placeholder">
              Map Preview
            </div>
          </div>
        </div>

        {/* Chatbot */}
        <div
          className="card side-card chatbot-card"
          onClick={() => setShowChatbotPopup(true)}
        >
          <h3>🤖AI Chatbot</h3>

          <div className="small-chatbot-preview">
            <div className="small-chatbot-box">
              Ask something...
            </div>
          </div>
        </div>
      </div>

      {/* Heat Map Popup */}
      {showHeatMapPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowHeatMapPopup(false)}
        >
          <div
            className="heatmap-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setShowHeatMapPopup(false)}
            >
              ×
            </button>

            <h2>Heat Map</h2>

            <div className="popup-map-area">
              Large Map Will Appear Here
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Popup */}
      {showChatbotPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowChatbotPopup(false)}
        >
          <div
            className="chatbot-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setShowChatbotPopup(false)}
            >
              ×
            </button>

            <h2>AI Chatbot</h2>

            <div className="chat-messages">
              <div className="bot-message">
                Hello! Ask me anything about the weather.
              </div>
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                placeholder="Type your message..."
                className="chat-input"
              />
              <button className="send-btn">
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;