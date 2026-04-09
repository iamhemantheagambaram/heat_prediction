import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function ClimateTrend({ lat, lon }) {

  const [trend, setTrend] = useState([]);

  useEffect(() => {

    if (!lat || !lon) return;

    fetch("http://127.0.0.1:5000/api/heat-trend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ lat, lon })
    })
      .then(res => res.json())
      .then(data => setTrend(data));

  }, [lat, lon]);

  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <h3>📈 Climate Trend (Next 5 Days)</h3>

      <LineChart width={500} height={250} data={trend}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="temperature" />
      </LineChart>
    </div>
  );
}

export default ClimateTrend;