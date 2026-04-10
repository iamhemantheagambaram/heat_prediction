import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import "./App.css";
import { useState } from "react";

function App() {
  const [locationName, setLocationName] = useState(null);

  console.log("APP LOCATION:", locationName);

  return (
    <div className="app">
      <Navbar location={locationName} />

      <div className="main-layout">
        <Sidebar />
        <Dashboard setLocationName={setLocationName} />
      </div>
    </div>
  );
}

export default App;