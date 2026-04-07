import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;