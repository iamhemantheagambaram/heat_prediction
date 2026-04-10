import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

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
      .then(data => setTrend(data))
      .catch(err => console.error("TREND ERROR:", err));

  }, [lat, lon]);

  return (
    <div style={{ width: "100%" }}>
      <h3 style={{ marginBottom: "10px" }}>
        📈 Climate Trend (Next 5 Days)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={trend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 3}}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ClimateTrend;