function Navbar({ location }) {
  return (
    <div className="navbar">
      <h2>🌡 Smart Heat Climate Assistant</h2>
      <p>📍 {location ? location : "Fetching location..."}</p>
    </div>
  );
}
export default Navbar;
