function WeatherCards({ data }) {
  return (
    <div className="cards">

      {/* Temperature */}
      <div className="card">
        <h4>Current Temperature</h4>
        <h2 className="temp">
          {data?.temp !== null ? (
            `${data.temp}°C`
          ) : (
            <span className="loading">Loading...</span>
          )}
        </h2>
      </div>

      {/* Humidity */}
      <div className="card">
        <h4>Humidity</h4>
        <h2 className="humidity">
          {data?.humidity !== null ? (
            `${data.humidity}%`
          ) : (
            <span className="loading">Loading...</span>
          )}
        </h2>
      </div>

      {/* Wind */}
      <div className="card">
        <h4>Wind Speed</h4>
        <h2 className="wind">
          {data?.wind !== null ? (
            `${data.wind} km/h`
          ) : (
            <span className="loading">Loading...</span>
          )}
        </h2>
      </div>

      {/* Heat Risk */}
      <div className="card">
        <h4>Heat Risk</h4>
        <h2 className="risk">
          {data?.risk ? (
            data.risk
          ) : (
            <span className="loading">Loading...</span>
          )}
        </h2>
      </div>

    </div>
  );
}

export default WeatherCards;