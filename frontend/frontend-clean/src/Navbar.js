function Navbar({ location }) {
  return (
    <div className="navbar-title">
      <h2 className="main-title">
        🌡 AI-BASED URBAN HEAT PREDICTION AND COOLING RECOMMENDATIONS
      </h2>

      <p className="location-text">
        <span>📍</span>
        <span className="location-value">
          {location ? location : "Fetching location..."}
        </span>
      </p>
    </div>
  );
}

export default Navbar;