function Navbar({ location }) {
  return (
    <div className="navbar">
      <h2>🌡 AI-Based Urban Heat Prediction and Cooling Recommendations</h2>
      <p>📍 {location ? location : "Fetching location..."}</p>
    </div>
  );
}
export default Navbar;