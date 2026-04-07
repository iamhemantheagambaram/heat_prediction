function WeatherCards({ data }) {

  // 🔥 Handle null data FIRST (important)
  if (!data) {
    return <p>Loading weather...</p>;
  }

  return (
    <div className="cards">

      {/* Temperature */}
      <div className="card">
        <h4>Current Temperature</h4>
        <h2 className="temp">
          {data.temp !== undefined ? `${data.temp}°C` : "Loading..."}
        </h2>
      </div>

      {/* Humidity */}
      <div className="card">
        <h4>Humidity</h4>
        <h2 className="humidity">
          {data.humidity !== undefined ? `${data.humidity}%` : "Loading..."}
        </h2>
      </div>

      {/* Wind */}
      <div className="card">
        <h4>Wind Speed</h4>
        <h2 className="wind">
          {data.wind !== undefined ? `${data.wind} km/h` : "Loading..."}
        </h2>
      </div>

      {/* Heat Risk */}
      <div className="card">
        <h4>Heat Risk</h4>
        <h2 className="risk">
          {data.risk || "Loading..."}
        </h2>
      </div>

    </div>
  );
}

export default WeatherCards;