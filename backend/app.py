print("🔥 FINAL BACKEND RUNNING")

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

from weather import get_weather
from model_loader import model
from api import climate_solutions, heat_advice

app = Flask(__name__)
CORS(app)

labels = {
    0: "Low",
    1: "Medium",
    2: "High"
}

@app.route("/")
def home():
    return "Backend Running Successfully"


# 🔥 SINGLE LOCATION (NO CHANGE)
@app.route("/api/live", methods=["POST"])
def predict_heat():

    try:
        data = request.get_json()

        lat = data.get("lat")
        lon = data.get("lon")

        if lat is None or lon is None:
            return jsonify({"error": "lat and lon required"}), 400

        temp, humidity, pressure, wind = get_weather(lat, lon)

        temp_max = temp + 1
        temp_min = temp - 1
        precip = 0

        sample = pd.DataFrame([[temp_max, temp_min, precip, wind]], columns=[
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "wind_speed_10m_max"
        ])

        prediction = model.predict(sample)[0]
        heat_risk = labels.get(prediction, "Unknown")

        avg_temp = (temp_max + temp_min) / 2

        recommendation = heat_advice.get(heat_risk, {})
        climate, climate_advice = climate_solutions(avg_temp)

        return jsonify({
            "temp": temp,
            "humidity": humidity,
            "wind": wind,
            "risk": heat_risk,
            "recommendation": recommendation,
            "climate_type": climate,
            "climate_solutions": climate_advice
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔥 NEW: GRID HEATMAP API
@app.route("/predict-all", methods=["GET"])
def predict_all():

    try:
        grid_data = []

        base_lat = 13.0827
        base_lon = 80.2707

        # 🔥 ONLY ONE WEATHER CALL (IMPORTANT)
        temp, humidity, pressure, wind = get_weather(base_lat, base_lon)

        for i in range(-10, 10):
            for j in range(-10, 10):

                lat = base_lat + (i * 0.01)
                lon = base_lon + (j * 0.01)

                temp_max = temp + 1
                temp_min = temp - 1
                precip = 0

                sample = pd.DataFrame([[temp_max, temp_min, precip, wind]], columns=[
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_sum",
                    "wind_speed_10m_max"
                ])

                prediction = model.predict(sample)[0]
                heat_risk = labels.get(prediction, "Unknown")

                # 🔥 convert to intensity
                intensity = 1 if heat_risk == "Low" else 2 if heat_risk == "Medium" else 3

                grid_data.append({
                    "lat": lat,
                    "lon": lon,
                    "intensity": intensity
                })

        return jsonify(grid_data)

    except Exception as e:
        print("❌ GRID ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


# 💬 CHATBOT (NO CHANGE)
@app.route("/api/chat", methods=["POST"])
def chat():

    msg = request.json.get("message", "").lower()

    if "heat" in msg:
        return jsonify({"reply": "Heat is high. Stay hydrated and avoid sun."})

    if "safe time" in msg:
        return jsonify({"reply": "Avoid outdoor activity between 11 AM and 4 PM."})

    return jsonify({"reply": "Ask about heat, safety, or climate."})


if __name__ == "__main__":
    app.run(debug=True)